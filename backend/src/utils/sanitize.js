const toStr = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) return v.map(i => (typeof i === 'string' ? i : JSON.stringify(i))).join(' ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};
const toNum = (v, fb = 0) => { const n = parseFloat(v); return isNaN(n) ? fb : n; };
const toStrArr = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(i => {
    if (typeof i === 'string') return i.trim();
    if (typeof i === 'object' && i !== null) return i.name || i.title || i.value || JSON.stringify(i);
    return String(i);
  }).filter(Boolean);
  if (typeof v === 'string') { try { const p = JSON.parse(v); if (Array.isArray(p)) return toStrArr(p); } catch {} return [v.trim()].filter(Boolean); }
  return [String(v)].filter(Boolean);
};
const sanitizeExp = (e) => {
  if (!e || typeof e !== 'object') return null;
  return { company: toStr(e.company), role: toStr(e.role || e.title || e.position || ''), duration: toStr(e.duration || e.period || e.dates || ''), description: toStr(e.description || e.responsibilities || e.details || ''), years: toNum(e.years || e.duration_years || 0) };
};
const sanitizeEdu = (e) => {
  if (!e || typeof e !== 'object') return null;
  return { institution: toStr(e.institution || e.school || e.university || ''), degree: toStr(e.degree || e.qualification || ''), year: toStr(e.year || e.graduation_year || ''), gpa: toStr(e.gpa || e.grade || '') };
};
const sanitizeProj = (p) => {
  if (!p || typeof p !== 'object') return null;
  return { name: toStr(p.name || p.title || ''), description: toStr(p.description || p.summary || ''), technologies: toStrArr(p.technologies || p.tech || p.stack || []) };
};
export const sanitizeParsedData = (data) => {
  if (!data || typeof data !== 'object') return { name:'',email:'',phone:'',location:'',summary:'',skills:[],experience:[],education:[],certifications:[],projects:[],languages:[],totalExperience:0 };
  return {
    name: toStr(data.name), email: toStr(data.email), phone: toStr(data.phone), location: toStr(data.location),
    summary: toStr(data.summary || data.objective || data.profile || ''),
    skills: toStrArr(data.skills),
    experience: Array.isArray(data.experience) ? data.experience.map(sanitizeExp).filter(Boolean) : [],
    education: Array.isArray(data.education) ? data.education.map(sanitizeEdu).filter(Boolean) : [],
    certifications: toStrArr(data.certifications),
    projects: Array.isArray(data.projects) ? data.projects.map(sanitizeProj).filter(Boolean) : [],
    languages: toStrArr(data.languages),
    totalExperience: toNum(data.totalExperience || data.total_experience || 0)
  };
};
export const sanitizeATSResult = (data) => {
  if (!data || typeof data !== 'object') return { score:0,matchedKeywords:[],missingKeywords:[],sectionScores:{skills:0,experience:0,education:0,formatting:0,keywords:0},suggestions:[],summary:'' };
  const ss = data.sectionScores || data.section_scores || {};
  return {
    score: toNum(data.score, 0),
    matchedKeywords: toStrArr(data.matchedKeywords || data.matched_keywords || []),
    missingKeywords: toStrArr(data.missingKeywords || data.missing_keywords || []),
    sectionScores: { skills: toNum(ss.skills,0), experience: toNum(ss.experience,0), education: toNum(ss.education,0), formatting: toNum(ss.formatting,0), keywords: toNum(ss.keywords,0) },
    suggestions: toStrArr(data.suggestions || []),
    summary: toStr(data.summary || '')
  };
};
