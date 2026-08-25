import mongoose from 'mongoose';
const expSchema = new mongoose.Schema({ company: { type: String, default: '' }, role: { type: String, default: '' }, duration: { type: String, default: '' }, description: { type: String, default: '' }, years: { type: Number, default: 0 } }, { _id: false });
const eduSchema = new mongoose.Schema({ institution: { type: String, default: '' }, degree: { type: String, default: '' }, year: { type: String, default: '' }, gpa: { type: String, default: '' } }, { _id: false });
const projSchema = new mongoose.Schema({ name: { type: String, default: '' }, description: { type: String, default: '' }, technologies: [{ type: String }] }, { _id: false });
const parsedSchema = new mongoose.Schema({
  name: { type: String, default: '' }, email: { type: String, default: '' }, phone: { type: String, default: '' },
  location: { type: String, default: '' }, summary: { type: String, default: '' },
  skills: [{ type: String }], experience: [expSchema], education: [eduSchema],
  certifications: [{ type: String }], projects: [projSchema], languages: [{ type: String }],
  totalExperience: { type: Number, default: 0 }
}, { _id: false });
const atsSchema = new mongoose.Schema({
  jobDescription: { type: String, default: '' }, jobTitle: { type: String, default: '' },
  score: { type: Number, default: 0 }, matchedKeywords: [{ type: String }], missingKeywords: [{ type: String }],
  sectionScores: { skills: { type: Number, default: 0 }, experience: { type: Number, default: 0 }, education: { type: Number, default: 0 }, formatting: { type: Number, default: 0 }, keywords: { type: Number, default: 0 } },
  suggestions: [{ type: String }], summary: { type: String, default: '' }, createdAt: { type: Date, default: Date.now }
}, { _id: false });
const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, default: '' }, fileUrl: { type: String, default: '' }, rawText: { type: String, default: '' },
  parsedData: { type: parsedSchema, default: () => ({}) }, atsScores: [atsSchema], isActive: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('Resume', resumeSchema);
