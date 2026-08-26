const FILLERS = [
    "um",
    "uh",
    "like",
    "you know",
    "basically",
    "actually",
    "literally",
    "right",
    "so",
    "well",
    "kind of",
    "sort of",
    "i mean",
    "honestly",
];

export const analyzeSpeech = (transcript) => {
    if (!transcript?.trim())
        return {
            wordsPerMinute: 0,
            fillerWords: [],
            fillerCount: 0,
            pauseCount: 0,
            totalWords: 0,
            sentimentScore: 0.5,
            clarityScore: 0,
        };

    const words = transcript.trim().split(/\s+/).filter(Boolean);

    const totalWords = words.length;

    const found = [];

    FILLERS.forEach((f) => {
        const m = transcript.match(new RegExp(`\\b${f}\\b`, "gi")) || [];
        found.push(...m.map((w) => w.toLowerCase()));
    });

    const unique = [...new Set(found)];

    const fillerCount = found.length;

    const pauseCount = (transcript.match(/\.\.\.|…/g) || []).length;

    let sent = 0.5;

    [
        "excellent",
        "great",
        "strong",
        "led",
        "achieved",
        "built",
        "improved",
        "delivered",
    ].forEach((w) => {
        if (transcript.toLowerCase().includes(w)) sent += 0.03;
    });

    ["failed", "struggled", "mistake", "bad", "weak", "poor"].forEach((w) => {
        if (transcript.toLowerCase().includes(w)) sent -= 0.02;
    });

    sent = Math.min(1, Math.max(0, sent));

    const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim());

    const avg = sentences.length ? totalWords / sentences.length : 0;

    const clarity = Math.min(
        100,
        Math.max(0, 100 - fillerCount * 3 - (avg > 30 ? 10 : 0) + sent * 15),
    );

    const wpm = Math.min(
        220,
        Math.max(60, Math.round(totalWords / Math.max(1, totalWords / 130))),
    );

    return {
        wordsPerMinute: wpm,
        fillerWords: unique,
        fillerCount,
        pauseCount,
        totalWords,
        sentimentScore: Math.round(sent * 100) / 100,
        clarityScore: Math.round(clarity),
    };
};
