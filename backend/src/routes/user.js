import express from 'express';

import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

import User from '../models/User.js';

const router = express.Router();

router.use(authenticate);

router.patch(
    '/profile',
    asyncHandler(async (req, res) => {
        const { name, profile, settings } = req.body;

        const updates = {};

        if (name) {
            updates.name = name;
        }

        if (profile) {
            updates.profile = {
                ...(req.user.profile?.toObject?.() ?? {}),
                ...profile,
            };
        }

        if (settings) {
            updates.settings = {
                ...(req.user.settings?.toObject?.() ?? {}),
                ...settings,
            };
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: updates,
            },
            {
                new: true,
                runValidators: true,
            }
        ).select('-password -refreshToken');

        res.json({
            user,
        });
    })
);

router.patch(
    '/password',
    asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Both passwords required',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'Min 6 characters',
            });
        }

        const user = await User.findById(req.user._id);

        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({
                error: 'Current password incorrect',
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            message: 'Password updated',
        });
    })
);


export default router;
