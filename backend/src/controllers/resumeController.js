import multer from 'multer';
import fs from 'fs';
import path from 'path';
import Resume from '../models/Resume.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { analyzeResume, generateATSAnalysis } from '../ai/mistralService.js';
import { sanitizeParsedData, sanitizeATSResult } from '../utils/sanitize.js';
import { computeATSScore } from '../ats/atsEngine.js';

const dir = path.resolve('src/uploads');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({ destination: (r,f,cb)=>cb(null,dir), filename: (r,f,cb)=>cb(null,`${Date.now()}-${f.originalname.replace(/\s+/g,'_')}`) }),
  limits: { fileSize: 5*1024*1024 },
  fileFilter: (r,f,cb) => ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(f.mimetype) ? cb(null,true) : cb(new Error('Only PDF/DOCX allowed'))
});

const readText = async (fp, mime) => {
  if (mime === 'application/pdf') {
    try { const {default:pp} = await import('pdf-parse/lib/pdf-parse.js'); return (await pp(fs.readFileSync(fp))).text||''; }
    catch { return ''; }
  }
  try { return fs.readFileSync(fp,'utf-8').replace(/[^\x20-\x7E\n\r\t]/g,' '); } catch { return ''; }
};

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const rawText = await readText(req.file.path, req.file.mimetype);
  let parsedData;
  try { parsedData = sanitizeParsedData(await analyzeResume(rawText)); }
  catch (e) { console.error('AI parse error:', e.message); parsedData = sanitizeParsedData({}); }
  try { fs.unlinkSync(req.file.path); } catch {}
  const resume = await Resume.create({ userId: req.user._id, fileName: req.file.originalname, fileUrl: '', rawText: rawText.substring(0,50000), parsedData });
  res.status(201).json({ resume });
});

export const getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id, isActive: true }).sort({ createdAt:-1 });
  res.json({ resumes });
});

export const getResume = asyncHandler(async (req, res) => {
  const r = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!r) return res.status(404).json({ error: 'Resume not found' });
  res.json({ resume: r });
});

export const analyzeATS = asyncHandler(async (req, res) => {
  const { resumeId, jobDescription, jobTitle='Software Engineer' } = req.body;
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
  if (!resume) return res.status(404).json({ error: 'Resume not found' });
  let analysis;
  try { analysis = sanitizeATSResult(await generateATSAnalysis(resume.rawText, jobDescription, jobTitle)); }
  catch (e) { console.error('ATS AI fallback:', e.message); analysis = computeATSScore(resume.rawText, jobDescription, jobTitle); }
  resume.atsScores.push({ jobDescription, jobTitle, ...analysis });
  await resume.save();
  res.json({ analysis, resume });
});

export const deleteResume = asyncHandler(async (req, res) => {
  const r = await Resume.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isActive: false }, { new: true });
  if (!r) return res.status(404).json({ error: 'Resume not found' });
  res.json({ message: 'Deleted' });
});
