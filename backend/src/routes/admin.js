import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import User from '../models/User.js';
import Interview from '../models/Interview.js';
import Resume from '../models/Resume.js';
const router = express.Router();
router.use(authenticate, requireAdmin);
router.get('/stats', asyncHandler(async (req, res) => {
  const [totalUsers, totalInterviews, totalResumes] = await Promise.all([User.countDocuments(), Interview.countDocuments(), Resume.countDocuments({isActive:true})]);
  const completed = await Interview.find({status:'completed'}).select('scores');
  const avgScore = completed.length ? Math.round(completed.reduce((s,i)=>s+i.scores.overall,0)/completed.length) : 0;
  res.json({ totalUsers, totalInterviews, totalResumes, avgScore });
}));
router.get('/users', asyncHandler(async (req, res) => {
  const { page=1, limit=20 } = req.query;
  const [users, total] = await Promise.all([User.find().select('-password -refreshToken').sort({createdAt:-1}).limit(parseInt(limit)).skip((parseInt(page)-1)*parseInt(limit)), User.countDocuments()]);
  res.json({ users, total });
}));
router.patch('/users/:id/toggle', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.isActive = !user.isActive; await user.save();
  res.json({ user });
}));
router.get('/interviews', asyncHandler(async (req, res) => {
  const { page=1, limit=20 } = req.query;
  const [interviews, total] = await Promise.all([Interview.find().populate('userId','name email').sort({createdAt:-1}).limit(parseInt(limit)).skip((parseInt(page)-1)*parseInt(limit)).select('-questions.answer -transcript -emotionTimeline'), Interview.countDocuments()]);
  res.json({ interviews, total });
}));
export default router;
