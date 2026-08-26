import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatGoogleGenerativeAI({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.7,
    maxOutputTokens: 2000,
});

const call = async (messages, opts = {}) => {
    const llm = new ChatGoogleGenerativeAI({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        apiKey: process.env.GOOGLE_API_KEY,
        temperature: opts.temp ?? 0.7,
        maxOutputTokens: opts.tokens ?? 2000,
    });

    const response = await llm.invoke(messages);

    if (!response || !response.content) {
        throw new Error("Gemini returned an empty response");
    }

    if (typeof response.content === "string") {
        return response.content;
    }

    return response.content
        .map((item) => {
            if (typeof item === "string") return item;
            return item.text || "";
        })
        .join("");
};

const parseJSON = (raw) => {
    let s = String(raw)
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "");

    const a = s.search(/[{[]/);
    const b = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));

    if (a !== -1 && b !== -1) {
        s = s.substring(a, b + 1);
    }

    return JSON.parse(s);
};

export const generateInterviewQuestions = async ({
    domain,
    difficulty,
    type,
    count = 8,
    resumeContext = "",
}) => {
    const raw = await call(
        [
            [
                "human",
                `You are an expert interviewer. Generate exactly ${count} ${difficulty}-level ${domain} ${type} interview questions.${resumeContext ? ` Candidate: ${resumeContext}` : ""}

Return ONLY a valid JSON array, no markdown:
[{"id":"q1","question":"...","type":"technical","difficulty":"${difficulty}","expectedTopics":["topic"],"followUpHints":["hint"]}]`,
            ],
        ],
        {
            temp: 0.8,
            tokens: 3000,
        }
    );

    const arr = parseJSON(raw);

    if (!Array.isArray(arr)) {
        throw new Error("Expected array");
    }

    return arr.map((q, i) => ({
        id: q.id || `q${i + 1}`,
        question: String(q.question || ""),
        type: q.type || "technical",
        difficulty: q.difficulty || difficulty,
        expectedTopics: Array.isArray(q.expectedTopics)
            ? q.expectedTopics.map(String)
            : [],
        followUpHints: Array.isArray(q.followUpHints)
            ? q.followUpHints.map(String)
            : [],
    }));
};

export const evaluateAnswer = async ({
    question,
    answer,
    domain,
    difficulty,
}) => {
    const raw = await call(
        [
            [
                "human",
                `Evaluate this interview answer. Domain:${domain} Difficulty:${difficulty}

Q: ${question}

A: ${answer || "(no answer)"}

Return ONLY JSON:
{"score":75,"feedback":"...","strengths":["..."],"improvements":["..."],"followUp":"...or null","keywords":["..."]}`,
            ],
        ],
        {
            temp: 0.5,
            tokens: 800,
        }
    );

    const p = parseJSON(raw);

    return {
        score: Number(p.score) || 0,
        feedback: String(p.feedback || ""),
        strengths: Array.isArray(p.strengths)
            ? p.strengths.map(String)
            : [],
        improvements: Array.isArray(p.improvements)
            ? p.improvements.map(String)
            : [],
        followUp: p.followUp ? String(p.followUp) : null,
        keywords: Array.isArray(p.keywords)
            ? p.keywords.map(String)
            : [],
    };
};

export const generateInterviewReport = async ({
    questions,
    scores,
    speechMetrics,
    emotionSummary,
    domain,
}) => {
    const raw = await call(
        [
            [
                "human",
                `Generate interview report. Domain:${domain}

Scores:${JSON.stringify(scores)}

Speech:${JSON.stringify(speechMetrics)}

Emotions:${JSON.stringify(emotionSummary)}

Questions:${questions.length}

Return ONLY JSON:
{"summary":"...","strengths":["..."],"improvements":["..."],"recommendations":["..."],"aiAnalysis":"...","hirabilityScore":75}`,
            ],
        ],
        {
            temp: 0.6,
            tokens: 1500,
        }
    );

    const p = parseJSON(raw);

    return {
        summary: String(p.summary || ""),
        strengths: Array.isArray(p.strengths)
            ? p.strengths.map(String)
            : [],
        improvements: Array.isArray(p.improvements)
            ? p.improvements.map(String)
            : [],
        recommendations: Array.isArray(p.recommendations)
            ? p.recommendations.map(String)
            : [],
        aiAnalysis: String(p.aiAnalysis || ""),
        hirabilityScore: Number(p.hirabilityScore) || 0,
    };
};

export const analyzeResume = async (text) => {
    const raw = await call(
        [
            [
                "human",
                `Extract resume data.

IMPORTANT:
- description must be a plain string NOT array
- certifications must be string array NOT objects

Resume:
${text.substring(0, 4000)}

Return ONLY JSON:
{"name":"","email":"","phone":"","location":"","summary":"","skills":[],"experience":[{"company":"","role":"","duration":"","description":"single string","years":0}],"education":[{"institution":"","degree":"","year":"","gpa":""}],"certifications":["string only"],"projects":[{"name":"","description":"","technologies":[]}],"languages":[],"totalExperience":0}`,
            ],
        ],
        {
            temp: 0.3,
            tokens: 2500,
        }
    );

    return parseJSON(raw);
};

export const generateATSAnalysis = async (
    resumeText,
    jobDescription,
    jobTitle
) => {
    const raw = await call(
        [
            [
                "human",
                `ATS analysis.

Job:${jobTitle}

JD:
${jobDescription.substring(0, 2000)}

Resume:
${resumeText.substring(0, 3000)}

Return ONLY JSON, all scores must be numbers:
{"score":78,"matchedKeywords":[],"missingKeywords":[],"sectionScores":{"skills":80,"experience":75,"education":70,"formatting":85,"keywords":78},"suggestions":[],"summary":""}`,
            ],
        ],
        {
            temp: 0.4,
            tokens: 1500,
        }
    );

    return parseJSON(raw);
};
