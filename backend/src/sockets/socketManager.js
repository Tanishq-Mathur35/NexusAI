import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
let io;
export const initializeSocket = (server) => {
  io = new Server(server, { cors: { origin: process.env.CLIENT_URL||'http://localhost:5173', credentials: true } });
  io.use((socket, next) => {
    try { socket.userId = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET).userId; next(); }
    catch { next(new Error('Auth failed')); }
  });
  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    socket.on('interview:join', ({interviewId}) => socket.join(`interview:${interviewId}`));
    socket.on('emotion:update', ({interviewId, emotion}) => socket.to(`interview:${interviewId}`).emit('emotion:data', emotion));
    socket.on('webrtc:offer', ({targetId, offer}) => socket.to(`user:${targetId}`).emit('webrtc:offer', {from:socket.userId,offer}));
    socket.on('webrtc:answer', ({targetId, answer}) => socket.to(`user:${targetId}`).emit('webrtc:answer', {from:socket.userId,answer}));
    socket.on('webrtc:ice-candidate', ({targetId, candidate}) => socket.to(`user:${targetId}`).emit('webrtc:ice-candidate', {from:socket.userId,candidate}));
  });
  return io;
};
export const getIO = () => io;
