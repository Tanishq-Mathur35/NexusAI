import express from 'express';

import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

import Interview from '../models/Interview.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get(
    '/stats',
    asyncHandler(async (req, res) => {
        const [totalUsers, totalInterviews, totalResumes] = await Promise.all([
            User.countDocuments(),
            Interview.countDocuments(),
            Resume.countDocuments({ isActive: true }),
        ]);

        const completed = await Interview.find({
            status: 'completed',
        }).select('scores');

        const avgScore = completed.length
            ? Math.round(
                completed.reduce((sum, interview) => {
                    return sum + interview.scores.overall;
                }, 0) / completed.length
            )
            : 0;

        res.json({
            totalUsers,
            totalInterviews,
            totalResumes,
            avgScore,
        });
    })
);

router.get(
    '/users',
    asyncHandler(async (req, res) => {
        const { page = 1, limit = 20 } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        const [users, total] = await Promise.all([
            User.find()
                .select('-password -refreshToken')
                .sort({ createdAt: -1 })
                .limit(limitNum)
                .skip((pageNum - 1) * limitNum),
            User.countDocuments(),
        ]);

        res.json({
            users,
            total,
        });
    })
);

router.patch(
    '/users/:id/toggle',
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            user,
        });
    })
);

router.get(
    '/interviews',
    asyncHandler(async (req, res) => {
        const { page = 1, limit = 20 } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        const [interviews, total] = await Promise.all([
            Interview.find()
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(limitNum)
                .skip((pageNum - 1) * limitNum)
                .select('-questions.answer -transcript -emotionTimeline'),
            Interview.countDocuments(),
        ]);

        res.json({
            interviews,
            total,
        });
    })
);


export default router;
