import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const mkTokens = (id) => ({
  accessToken: jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' }),
  refreshToken: jwt.sign({ userId: id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' })
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (await User.findOne({ email })) return res.status(409).json({ error: 'Email already registered' });
  const user = await User.create({ name, email, password });
  const { accessToken, refreshToken } = mkTokens(user._id);
  user.refreshToken = refreshToken; await user.save();
  res.status(201).json({ user, accessToken, refreshToken });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
  if (!user.isActive) return res.status(403).json({ error: 'Account deactivated' });
  const { accessToken, refreshToken } = mkTokens(user._id);
  user.refreshToken = refreshToken; await user.save();
  res.json({ user, accessToken, refreshToken });
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  res.json({ message: 'Logged out' });
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(401).json({ error: 'Refresh token required' });
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user || user.refreshToken !== token) return res.status(401).json({ error: 'Invalid refresh token' });
  const { accessToken, refreshToken } = mkTokens(user._id);
  user.refreshToken = refreshToken; await user.save();
  res.json({ accessToken, refreshToken });
});

export const getMe = asyncHandler(async (req, res) => res.json({ user: req.user }));
