export const paginate = (page = 1, limit = 10) => ({ skip: (Math.max(1, parseInt(page)) - 1) * Math.min(50, parseInt(limit)), limit: Math.min(50, parseInt(limit)) });
export const calcAvg = (questions) => { const a = questions.filter(q => typeof q.score === 'number'); return a.length ? Math.round(a.reduce((s,q)=>s+q.score,0)/a.length) : 0; };
export const safeJson = (str, fb = null) => { try { return JSON.parse(str); } catch { return fb; } };
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
