import { evaluateAnswer, generateInterviewQuestions, generateInterviewReport } from '../ai/AiService.js';
import { analyzeEmotionTimeline } from '../emotion/emotionAnalyzer.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Interview from '../models/Interview.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { analyzeSpeech } from '../speech/speechAnalyzer.js';

export const startInterview = asyncHandler(async (req, res) => {
    const { domain, type, difficulty, resumeId } = req.body;

    let resumeContext = '';

    if (resumeId) {
        const r = await Resume.findById(resumeId);

        if (r?.parsedData) resumeContext = `Skills: ${r.parsedData.skills?.slice(0, 8).join(', ') || ''}. Experience: ${r.parsedData.totalExperience || 0} years.`;
    }

    const aiQs = await generateInterviewQuestions({ domain, difficulty, type, count: 8, resumeContext });

    const questions = aiQs.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        difficulty: q.difficulty,
        expectedTopics: q.expectedTopics || [],
        followUps: [],
        answer: '',
        score: 0,
        feedback: '',
        timeSpent: 0
    }));

    const interview = await Interview.create({
        userId: req.user._id,
        domain,
        type,
        difficulty,
        questions,
        resumeId: resumeId || null,
        status: 'ongoing'
    });

    res.status(201).json({ interview });
});


export const submitAnswer = asyncHandler(async (req, res) => {
    const { interviewId, questionId, answer, timeSpent } = req.body;

    const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });

    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const q = interview.questions.find(q => q.id === questionId);

    if (!q) return res.status(404).json({ error: 'Question not found' });

    const ev = await evaluateAnswer({
        question: q.question,
        answer,
        domain: interview.domain,
        difficulty: interview.difficulty
    });

    q.answer = answer;
    q.score = ev.score;
    q.feedback = ev.feedback;
    q.timeSpent = timeSpent || 0;

    if (ev.followUp) q.followUps = [ev.followUp];

    interview.transcript.push(
        {
            role: 'interviewer',
            content: q.question
        },
        {
            role: 'candidate',
            content: answer
        }
    );

    await interview.save();

    res.json({
        evaluation: ev,
        interview
    });
});


export const completeInterview = asyncHandler(async (req, res) => {
    const { interviewId, emotionTimeline, audioTranscript } = req.body;

    const interview = await Interview.findOne({
        _id: interviewId,
        userId: req.user._id
    });

    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const answered = interview.questions.filter(q => q.answer);

    const avgScore = answered.length ? Math.round(answered.reduce((s, q) => s + q.score, 0) / answered.length) : 0;

    const speech = audioTranscript ? analyzeSpeech(audioTranscript) : {
        wordsPerMinute: 125,
        fillerWords: [],
        fillerCount: 0,
        pauseCount: 0,
        totalWords: 0,
        sentimentScore: 0.6,
        clarityScore: 72
    };

    const emo = analyzeEmotionTimeline(emotionTimeline || []);

    const scores = {
        technical: Math.min(100, avgScore),
        communication: Math.min(100, speech.clarityScore || 70),
        confidence: Math.min(100, emo.confidenceScore || 65),
        hr: Math.min(100, Math.round(avgScore * 0.9 + 5)),
        overall: Math.min(100, avgScore)
    };

    const report = await generateInterviewReport({
        questions: answered,
        scores, speechMetrics:
            speech, emotionSummary: {
                dominant: emo.dominant,
                confidenceScore: emo.confidenceScore,
                nervousnessScore: emo.nervousnessScore
            },
        domain: interview.domain
    });

    interview.status = 'completed';
    interview.scores = scores;
    interview.speechMetrics = speech;
    interview.emotionTimeline = (emotionTimeline || []).slice(0, 500);
    interview.report = report;
    interview.endTime = new Date();
    interview.duration = Math.floor((interview.endTime - interview.startTime) / 1000);

    await interview.save();

    await User.findByIdAndUpdate(req.user._id,
        {
            $inc: {
                'stats.totalInterviews': 1,
                'stats.totalTime': interview.duration
            }
            , $max: {
                'stats.bestScore': scores.overall

            }
        });

    res.json({
        interview,
        report
    });
});


export const getInterviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const [interviews, total] = await Promise.all([
        Interview.find({
            userId: req.user._id
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .select('-questions.answer -transcript -emotionTimeline'),

        Interview.countDocuments({ userId: req.user._id })
    ]);
    res.json({
        interviews,
        total,
        pages: Math.ceil(total / parseInt(limit))
    });
});


export const getInterview = asyncHandler(async (req, res) => {
    const interview = await Interview.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    res.json({ interview });
});


export const getStats = asyncHandler(async (req, res) => {
    const interviews = await Interview.find({
        userId: req.user._id,
        status: 'completed'
    })
        .sort({ createdAt: 1 });

    const total = interviews.length;

    const avgScore = total ? Math.round(interviews.reduce((s, i) => s + i.scores.overall, 0) / total) : 0;

    const avgConf = total ? Math.round(interviews.reduce((s, i) => s + i.scores.confidence, 0) / total) : 0;

    const scoreTrend = interviews.slice(-10).map(i => ({
        date: i.createdAt.toISOString().split('T')[0],
        overall: Math.round(i.scores.overall),
        confidence: Math.round(i.scores.confidence),
        technical: Math.round(i.scores.technical),
        communication: Math.round(i.scores.communication)

    }));

    const domainStats = interviews.reduce((a, i) => {
        if (!a[i.domain]) a[i.domain] = { count: 0, totalScore: 0 };
        a[i.domain].count++;
        a[i.domain].totalScore += i.scores.overall;
        return a;
    }, {});

    res.json({
        totalInterviews: total,
        avgScore,
        avgConfidence: avgConf,
        scoreTrend,
        domainStats
    });
});
