import express from 'express';

import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

import Interview from '../models/Interview.js';

const router = express.Router();

router.use(authenticate);

router.get(
    '/overview',
    asyncHandler(async (req, res) => {
        const ivs = await Interview.find({
            userId: req.user._id,
            status: 'completed',
        }).sort({ createdAt: 1 });

        const total = ivs.length;

        const avgScore = total
            ? Math.round(
                ivs.reduce((sum, interview) => {
                    return sum + interview.scores.overall;
                }, 0) / total
            )
            : 0;

        const avgConf = total
            ? Math.round(
                ivs.reduce((sum, interview) => {
                    return sum + interview.scores.confidence;
                }, 0) / total
            )
            : 0;

        const scoreTrend = ivs.slice(-10).map((interview) => ({
            date: interview.createdAt.toISOString().split('T')[0],
            overall: Math.round(interview.scores.overall),
            confidence: Math.round(interview.scores.confidence),
            technical: Math.round(interview.scores.technical),
            communication: Math.round(interview.scores.communication),
        }));

        const domainStats = ivs.reduce((acc, interview) => {
            if (!acc[interview.domain]) {
                acc[interview.domain] = {
                    count: 0,
                    totalScore: 0,
                };
            }

            acc[interview.domain].count++;
            acc[interview.domain].totalScore += interview.scores.overall;

            return acc;
        }, {});

        res.json({
            totalInterviews: total,
            avgScore,
            avgConfidence: avgConf,
            scoreTrend,
            domainStats,
        });
    })
);

router.get(
    '/emotions',
    asyncHandler(async (req, res) => {
        const ivs = await Interview.find({
            userId: req.user._id,
            status: 'completed',
        }).select('emotionTimeline');

        const summary = ivs.reduce((acc, interview) => {
            (interview.emotionTimeline || []).forEach((emotion) => {
                if (emotion.emotion) {
                    acc[emotion.emotion] = (acc[emotion.emotion] || 0) + 1;
                }
            });

            return acc;
        }, {});

        res.json({
            emotionSummary: summary,
            total: ivs.length,
        });
    })
);


export default router;
