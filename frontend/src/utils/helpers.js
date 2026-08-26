export const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) {
        return '00:00';
    }

    const minutes = Math.floor(seconds / 60);

    return `${String(minutes).padStart(2, '0')}:${String(
        seconds % 60
    ).padStart(2, '0')}`;
};

export const formatDuration = (seconds) => {
    if (!seconds) {
        return 'N/A';
    }

    if (seconds < 60) {
        return `${seconds}s`;
    }

    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

export const formatDate = (date, options = {}) => {
    if (!date) {
        return '';
    }

    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options,
    });
};

export const scoreColor = (score) =>
    score >= 80
        ? '#10b981'
        : score >= 60
            ? '#f59e0b'
            : '#f43f5e';

export const scoreLabel = (score) =>
    score >= 85
        ? 'Excellent'
        : score >= 70
            ? 'Good'
            : score >= 55
                ? 'Average'
                : score >= 40
                    ? 'Below Average'
                    : 'Needs Improvement';

export const capitalize = (str) => {
    if (!str) {
        return '';
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncate = (str, max = 80) => {
    if (!str) {
        return '';
    }

    return str.length > max
        ? `${str.slice(0, max)}…`
        : str;
};

export const getInitials = (name) => {
    if (!name) {
        return '?';
    }

    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

export const sleep = (ms) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

export const debounce = (fn, delay) => {
    let timer;

    return (...args) => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};
