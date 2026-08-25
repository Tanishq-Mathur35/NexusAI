import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  profile: {
    title: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    experience: { type: Number, default: 0 },
    targetRole: { type: String, default: '' },
    linkedIn: { type: String, default: '' },
    github: { type: String, default: '' }
  },
  settings: {
    theme: { type: String, default: 'dark' },
    notifications: { type: Boolean, default: true },
    difficulty: { type: String, default: 'medium' }
  },
  stats: {
    totalInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 }
  },
  refreshToken: { type: String, default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password; delete obj.refreshToken;
  return obj;
};
export default mongoose.model('User', userSchema);
