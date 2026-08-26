import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
    try {
        const auth = req.headers.authorization;

        if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });

        const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select('-password -refreshToken');

        if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid token' });

        req.user = user; next();

    } catch (e) {
        res.status(401).json({ error: e.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token' });
    }
};


export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    next();
};
