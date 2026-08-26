import { useCallback, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore.js';

let socketInstance = null;

export function useSocket() {
    const { accessToken } = useAuthStore();

    const socketRef = useRef(null);

    useEffect(() => {
        if (!accessToken) return;

        if (!socketInstance) socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { auth: { token: accessToken }, transports: ['websocket'], autoConnect: true });

        socketRef.current = socketInstance;
    }, [accessToken]);

    const emit = useCallback((event, data) => socketRef.current?.emit(event, data), []);
    const on = useCallback((event, handler) => { socketRef.current?.on(event, handler); return () => socketRef.current?.off(event, handler); }, []);
    const joinInterview = useCallback((interviewId) => socketRef.current?.emit('interview:join', { interviewId }), []);
    const sendEmotion = useCallback((interviewId, emotion) => socketRef.current?.emit('emotion:update', { interviewId, emotion }), []);

    return { socket: socketRef.current, emit, on, joinInterview, sendEmotion };
}
