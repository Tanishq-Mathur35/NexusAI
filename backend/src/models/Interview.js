import mongoose from 'mongoose';
const questionSchema = new mongoose.Schema({
  id: String, question: String,
  type: { type: String, enum: ['technical','hr','behavioral','situational'], default: 'technical' },
  difficulty: String, answer: { type: String, default: '' }, score: { type: Number, default: 0 },
  feedback: { type: String, default: '' }, timeSpent: { type: Number, default: 0 },
  followUps: [String], expectedTopics: [String]
}, { _id: false });
const interviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  domain: { type: String, required: true },
  type: { type: String, enum: ['technical','hr','mixed'], default: 'mixed' },
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  status: { type: String, enum: ['scheduled','ongoing','completed','abandoned'], default: 'ongoing' },
  questions: [questionSchema],
  transcript: [{ role: String, content: String, timestamp: { type: Date, default: Date.now } }],
  emotionTimeline: [{ timestamp: Number, emotion: String, confidence: Number, values: { type: mongoose.Schema.Types.Mixed, default: {} } }],
  speechMetrics: {
    wordsPerMinute: { type: Number, default: 0 }, fillerWords: [String],
    fillerCount: { type: Number, default: 0 }, pauseCount: { type: Number, default: 0 },
    totalWords: { type: Number, default: 0 }, sentimentScore: { type: Number, default: 0 },
    clarityScore: { type: Number, default: 0 }
  },
  scores: {
    technical: { type: Number, default: 0 }, communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 }, hr: { type: Number, default: 0 }, overall: { type: Number, default: 0 }
  },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
  duration: { type: Number, default: 0 },
  report: {
    summary: { type: String, default: '' }, strengths: [String], improvements: [String],
    recommendations: [String], aiAnalysis: { type: String, default: '' }, hirabilityScore: { type: Number, default: 0 }
  },
  startTime: { type: Date, default: Date.now }, endTime: Date
}, { timestamps: true });
export default mongoose.model('Interview', interviewSchema);
