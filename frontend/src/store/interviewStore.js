import { create } from 'zustand';

import api from '../api/axios.js';

const useInterviewStore = create((set, get) => ({
    currentInterview: null,
    currentQuestionIndex: 0,
    emotionData: [],
    fullTranscript: '',
    interviews: [],
    stats: null,
    isLoading: false,

    startInterview: async (config) => {
        set({ isLoading: true });

        try {
            const { data } = await api.post(
                '/interviews/start',
                config
            );

            set({
                currentInterview: data.interview,
                currentQuestionIndex: 0,
                emotionData: [],
                fullTranscript: '',
                isLoading: false,
            });

            return {
                success: true,
                interview: data.interview,
            };
        } catch (error) {
            set({
                isLoading: false,
            });

            return {
                success: false,
                error:
                    error.response?.data?.error ||
                    'Failed to start',
            };
        }
    },

    submitAnswer: async (
        questionId,
        answer,
        timeSpent
    ) => {
        const {
            currentInterview,
            currentQuestionIndex,
        } = get();

        set({ isLoading: true });

        try {
            const { data } = await api.post(
                '/interviews/answer',
                {
                    interviewId: currentInterview._id,
                    questionId,
                    answer,
                    timeSpent,
                }
            );

            set({
                currentInterview: data.interview,
                currentQuestionIndex:
                    currentQuestionIndex + 1,
                isLoading: false,
            });

            return {
                success: true,
                evaluation: data.evaluation,
            };
        } catch (error) {
            set({
                isLoading: false,
            });

            return {
                success: false,
                error: error.response?.data?.error,
            };
        }
    },

    completeInterview: async (
        emotionTimeline,
        audioTranscript
    ) => {
        const { currentInterview } = get();

        set({ isLoading: true });

        try {
            const { data } = await api.post(
                '/interviews/complete',
                {
                    interviewId: currentInterview._id,
                    emotionTimeline,
                    audioTranscript,
                }
            );

            set({
                currentInterview: data.interview,
                isLoading: false,
            });

            return {
                success: true,
                interview: data.interview,
                report: data.report,
            };
        } catch (error) {
            set({
                isLoading: false,
            });

            return {
                success: false,
                error: error.response?.data?.error,
            };
        }
    },

    fetchInterviews: async (page = 1) => {
        try {
            const { data } = await api.get(
                `/interviews?page=${page}`
            );

            set({
                interviews: data.interviews || [],
            });

            return data;
        } catch {
            // Ignore fetch errors
        }
    },

    fetchStats: async () => {
        try {
            const { data } = await api.get(
                '/interviews/stats'
            );

            set({
                stats: data,
            });
        } catch {
            // Ignore fetch errors
        }
    },

    resetInterview: () =>
        set({
            currentInterview: null,
            currentQuestionIndex: 0,
            emotionData: [],
            fullTranscript: '',
        }),
}));

export default useInterviewStore;
