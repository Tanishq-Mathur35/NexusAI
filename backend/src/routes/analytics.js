import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Interview from '../models/Interview.js';
const router = express.Router();
router.use(authenticate);
router.get('/overview', asyncHandler(async (req, res) => {
  const ivs = await Interview.find({ userId: req.user._id, status: 'completed' }).sort({ createdAt:1 });
  const total = ivs.length;
  const avgScore = total ? Math.round(ivs.reduce((s,i)=>s+i.scores.overall,0)/total) : 0;
  const avgConf = total ? Math.round(ivs.reduce((s,i)=>s+i.scores.confidence,0)/total) : 0;
  const scoreTrend = ivs.slice(-10).map(i => ({ date: i.createdAt.toISOString().split('T')[0], overall: Math.round(i.scores.overall), confidence: Math.round(i.scores.confidence), technical: Math.round(i.scores.technical), communication: Math.round(i.scores.communication) }));
  const domainStats = ivs.reduce((a,i) => { if(!a[i.domain]) a[i.domain]={count:0,totalScore:0}; a[i.domain].count++; a[i.domain].totalScore+=i.scores.overall; return a; }, {});
  res.json({ totalInterviews: total, avgScore, avgConfidence: avgConf, scoreTrend, domainStats });
}));
router.get('/emotions', asyncHandler(async (req, res) => {
  const ivs = await Interview.find({ userId: req.user._id, status: 'completed' }).select('emotionTimeline');
  const summary = ivs.reduce((a,i) => { (i.emotionTimeline||[]).forEach(e => { if(e.emotion) a[e.emotion]=(a[e.emotion]||0)+1; }); return a; }, {});
  res.json({ emotionSummary: summary, total: ivs.length });
}));
export default router;
