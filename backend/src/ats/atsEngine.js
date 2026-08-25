const KEYWORDS = [
    "javascript",
    "typescript",
    "python",
    "java",
    "go",
    "rust",
    "react",
    "vue",
    "angular",
    "nextjs",
    "nodejs",
    "express",
    "fastapi",
    "django",
    "graphql",
    "rest",
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "git",
    "linux",
    "agile",
    "scrum",
    "machine learning",
    "tensorflow",
    "pytorch",
];

const extract = (text) =>
    KEYWORDS.filter((k) =>
        new RegExp(`\\b${k.replace(/\+/g, "\\+")}\\b`, "i").test(text),
    );

export const computeATSScore = (resumeText, jobDescription, jobTitle = "") => {
    const jobKw = extract(jobDescription + " " + jobTitle);
    const resumeKw = extract(resumeText);
    const matched = jobKw.filter((k) => resumeKw.includes(k));
    const missing = jobKw.filter((k) => !resumeKw.includes(k));
    const ratio = jobKw.length ? matched.length / jobKw.length : 0;
    const hasExp = /experience|employment/i.test(resumeText);
    const hasEdu = /education|degree|university/i.test(resumeText);
    const hasEmail = /[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}/i.test(
        resumeText,
    );
    const skills = Math.min(100, Math.round(ratio * 100));
    const experience = hasExp ? Math.min(100, 55 + matched.length * 2) : 40;
    const education = hasEdu ? 70 : 40;
    const formatting = Math.min(
        100,
        [
            hasEmail,
            /phone|\+\d/i.test(resumeText),
            /skills|projects/i.test(resumeText),
        ].filter(Boolean).length *
        30 +
        10,
    );
    const keywords = Math.round(ratio * 100);
    const score = Math.round(
        skills * 0.3 +
        experience * 0.25 +
        education * 0.15 +
        formatting * 0.1 +
        keywords * 0.2,
    );
    return {
        score: Math.min(100, Math.max(10, score)),
        matchedKeywords: matched,
        missingKeywords: missing.slice(0, 20),
        sectionScores: {
            skills,
            experience: Math.round(experience),
            education,
            formatting,
            keywords,
        },
        suggestions: missing.length
            ? [
                `Add missing skills: ${missing.slice(0, 5).join(", ")}`,
                "Use action verbs to describe achievements",
                "Quantify results (e.g. Reduced load time by 40%)",
            ]
            : [
                "Great keyword match!",
                "Quantify achievements for stronger impact",
            ],
        summary: `Matches ${matched.length}/${jobKw.length} key requirements.`,
    };
};
