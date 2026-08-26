import { useCallback } from 'react';
import useInterviewStore from '../store/interviewStore.js';

export function useInterview() {
    const store = useInterviewStore();

    const currentQuestion = useCallback(() => store.currentInterview ? store.currentInterview.questions[store.currentQuestionIndex] ?? null : null, [store.currentInterview, store.currentQuestionIndex]);

    const isLastQuestion = useCallback(() => store.currentInterview ? store.currentQuestionIndex >= store.currentInterview.questions.length - 1 : false, [store.currentInterview, store.currentQuestionIndex]);

    const progress = useCallback(() => (!store.currentInterview || !store.currentInterview.questions.length) ? 0 : Math.round((store.currentQuestionIndex / store.currentInterview.questions.length) * 100), [store.currentInterview, store.currentQuestionIndex]);

    return {
        ...store,
        currentQuestion,
        isLastQuestion,
        progress,
        totalQuestions: store.currentInterview?.questions?.length ?? 0
    };
}
