import dotenv from "dotenv";
dotenv.config();
const URL = "https://api.mistral.ai/v1/chat/completions";

const call = async (messages, opts = {}) => {
    const res = await fetch(URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
            model: process.env.MISTRAL_MODEL || "mistral-large-latest",
            messages,
            temperature: opts.temp ?? 0.7,
            max_tokens: opts.tokens ?? 2000,
        }),
    });
    if (!res.ok) throw new Error(`Mistral ${res.status}: ${await res.text()}`);
    return (await res.json()).choices[0].message.content;
};

const parseJSON = (raw) => {
    let s = raw
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "");
    const a = s.search(/[{\[]/),
        b = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
    if (a !== -1 && b !== -1) s = s.substring(a, b + 1);
    return JSON.parse(s);
};

export const generateInterviewQuestions = async ({
    domain,
    difficulty,
    type,
    count = 8,
    resumeContext = "",
}) => {
    const raw = await call(
        [
            {
                role: "user",
                content: `You are an expert interviewer. Generate exactly ${count} ${difficulty}-level ${domain} ${type} interview questions.${resumeContext ? ` Candidate: ${resumeContext}` : ""}\n\nReturn ONLY a valid JSON array, no markdown:\n[{"id":"q1","question":"...","type":"technical","difficulty":"${difficulty}","expectedTopics":["topic"],"followUpHints":["hint"]}]`,
            },
        ],
        { temp: 0.8, tokens: 3000 },
    );
    const arr = parseJSON(raw);
    if (!Array.isArray(arr)) throw new Error("Expected array");
    return arr.map((q, i) => ({
        id: q.id || `q${i + 1}`,
        question: String(q.question || ""),
        type: q.type || "technical",
        difficulty: q.difficulty || difficulty,
        expectedTopics: Array.isArray(q.expectedTopics)
            ? q.expectedTopics.map(String)
            : [],
        followUpHints: Array.isArray(q.followUpHints)
            ? q.followUpHints.map(String)
            : [],
    }));
};

export const evaluateAnswer = async ({
    question,
    answer,
    domain,
    difficulty,
}) => {
    const raw = await call(
        [
            {
                role: "user",
                content: `Evaluate this interview answer. Domain:${domain} Difficulty:${difficulty}\nQ: ${question}\nA: ${answer || "(no answer)"}\n\nReturn ONLY JSON:\n{"score":75,"feedback":"...","strengths":["..."],"improvements":["..."],"followUp":"...or null","keywords":["..."]}`,
            },
        ],
        { temp: 0.5, tokens: 800 },
    );
    const p = parseJSON(raw);
    return {
        score: Number(p.score) || 0,
        feedback: String(p.feedback || ""),
        strengths: Array.isArray(p.strengths) ? p.strengths.map(String) : [],
        improvements: Array.isArray(p.improvements)
            ? p.improvements.map(String)
            : [],
        followUp: p.followUp ? String(p.followUp) : null,
        keywords: Array.isArray(p.keywords) ? p.keywords.map(String) : [],
    };
};

export const generateInterviewReport = async ({
    questions,
    scores,
    speechMetrics,
    emotionSummary,
    domain,
}) => {
    const raw = await call(
        [
            {
                role: "user",
                content: `Generate interview report. Domain:${domain} Scores:${JSON.stringify(scores)} Speech:${JSON.stringify(speechMetrics)} Emotions:${JSON.stringify(emotionSummary)} Questions:${questions.length}\n\nReturn ONLY JSON:\n{"summary":"...","strengths":["..."],"improvements":["..."],"recommendations":["..."],"aiAnalysis":"...","hirabilityScore":75}`,
            },
        ],
        { temp: 0.6, tokens: 1500 },
    );
    const p = parseJSON(raw);
    return {
        summary: String(p.summary || ""),
        strengths: Array.isArray(p.strengths) ? p.strengths.map(String) : [],
        improvements: Array.isArray(p.improvements)
            ? p.improvements.map(String)
            : [],
        recommendations: Array.isArray(p.recommendations)
            ? p.recommendations.map(String)
            : [],
        aiAnalysis: String(p.aiAnalysis || ""),
        hirabilityScore: Number(p.hirabilityScore) || 0,
    };
};

export const analyzeResume = async (text) => {
    const raw = await call(
        [
            {
                role: "user",
                content: `Extract resume data. IMPORTANT: description must be a plain string NOT array. certifications must be string array NOT objects.\n\nResume:\n${text.substring(0, 4000)}\n\nReturn ONLY JSON:\n{"name":"","email":"","phone":"","location":"","summary":"","skills":[],"experience":[{"company":"","role":"","duration":"","description":"single string","years":0}],"education":[{"institution":"","degree":"","year":"","gpa":""}],"certifications":["string only"],"projects":[{"name":"","description":"","technologies":[]}],"languages":[],"totalExperience":0}`,
            },
        ],
        { temp: 0.3, tokens: 2500 },
    );
    return parseJSON(raw);
};

export const generateATSAnalysis = async (
    resumeText,
    jobDescription,
    jobTitle,
) => {
    const raw = await call(
        [
            {
                role: "user",
                content: `ATS analysis. Job:${jobTitle}\nJD:${jobDescription.substring(0, 2000)}\nResume:${resumeText.substring(0, 3000)}\n\nReturn ONLY JSON, all scores must be numbers:\n{"score":78,"matchedKeywords":[],"missingKeywords":[],"sectionScores":{"skills":80,"experience":75,"education":70,"formatting":85,"keywords":78},"suggestions":[],"summary":""}`,
            },
        ],
        { temp: 0.4, tokens: 1500 },
    );
    return parseJSON(raw);
};
