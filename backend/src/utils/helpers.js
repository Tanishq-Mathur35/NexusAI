export const paginate = (page = 1, limit = 10) => ({
    skip:
        (Math.max(1, parseInt(page, 10)) - 1) *
        Math.min(50, parseInt(limit, 10)),
    limit: Math.min(50, parseInt(limit, 10)),
});

export const calcAvg = (questions) => {
    const scoredQuestions = questions.filter(
        (question) => typeof question.score === 'number'
    );

    return scoredQuestions.length
        ? Math.round(
            scoredQuestions.reduce((sum, question) => {
                return sum + question.score;
            }, 0) / scoredQuestions.length
        )
        : 0;
};

export const safeJson = (str, fallback = null) => {
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
};

export const clamp = (value, min, max) =>
    Math.min(max, Math.max(min, value));

export const sleep = (ms) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    }
    );
