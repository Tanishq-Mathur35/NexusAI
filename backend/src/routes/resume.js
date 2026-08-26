import express from 'express';
import { analyzeATS, deleteResume, getResume, getResumes, upload, uploadResume } from '../controllers/resumeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.post('/upload', upload.single('resume'), uploadResume);
router.post('/ats', analyzeATS);
router.get('/', getResumes);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);


export default router;
