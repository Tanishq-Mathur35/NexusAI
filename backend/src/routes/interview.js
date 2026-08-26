import express from 'express';
import { completeInterview, getInterview, getInterviews, getStats, startInterview, submitAnswer } from '../controllers/interviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.post('/start', startInterview);
router.post('/answer', submitAnswer);
router.post('/complete', completeInterview);
router.get('/stats', getStats);
router.get('/', getInterviews);
router.get('/:id', getInterview);


export default router;
