export const analyzeEmotionTimeline = (timeline) => {
    if (!timeline?.length)
        return {
            dominant: "neutral",
            counts: {},
            percentages: {},
            confidenceAvg: 0,
            nervousnessScore: 0,
            confidenceScore: 0,
        };

    const counts = timeline.reduce((a, e) => {
        a[e.emotion || "neutral"] = (a[e.emotion || "neutral"] || 0) + 1;
        return a;
    }, {});

    const total = timeline.length;
    const percentages = Object.fromEntries(
        Object.entries(counts).map(([k, v]) => [
            k,
            Math.round((v / total) * 100),
        ]),
    );

    const dominant = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral";

    const confidenceAvg = Math.round(
        timeline.reduce((s, e) => s + (e.confidence || 65), 0) / total,
    );

    const nervousnessScore = Math.min(
        100,
        Math.round(
            (((counts.nervous || 0) + (counts.confused || 0) * 0.5) / total) *
            200,
        ),
    );

    const confidenceScore = Math.min(
        100,
        Math.round(
            (((counts.confident || 0) + (counts.happy || 0) * 0.7) / total) *
            200,
        ),
    );

    return {
        dominant,
        counts,
        percentages,
        confidenceAvg,
        nervousnessScore,
        confidenceScore,
    };
};
