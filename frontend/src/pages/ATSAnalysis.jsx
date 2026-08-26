import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios.js';
import { ProgressBar, ScoreRing } from '../components/ui/index.jsx';

export default function ATSAnalysis() {
    const [resumes, setResumes] = useState([]);
    const [selectedResume, setSelectedResume] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { api.get('/resume').then(({ data }) => setResumes(data.resumes || [])); }, []);

    const handleAnalyze = async () => {
        if (!selectedResume) return toast.error('Select a resume');
        if (!jobDescription.trim() || jobDescription.trim().length < 50) return toast.error('Job description must be at least 50 characters');
        setLoading(true);
        try {
            const { data } = await api.post('/resume/ats', { resumeId: selectedResume, jobDescription, jobTitle });
            setResult(data.analysis);
            toast.success('ATS analysis complete!');
        } catch (err) { toast.error(err.response?.data?.error || 'Analysis failed'); }
        setLoading(false);
    };

    const SECTION_COLORS = { skills: '#6366f1', experience: '#10b981', education: '#06b6d4', formatting: '#f59e0b', keywords: '#f43f5e' };
    const scoreColor = result ? (result.score >= 70 ? '#10b981' : result.score >= 50 ? '#f59e0b' : '#f43f5e') : '#6366f1';

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="font-display font-bold text-3xl text-[#f1f5f9] mb-2">ATS Score Analyzer</h1>
                <p className="font-body text-[#94a3b8] text-sm">Compare your resume against a job description to optimize for Applicant Tracking Systems.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="card space-y-4">
                    <h2 className="font-display font-semibold text-[#f1f5f9]">Configure Analysis</h2>
                    <div>
                        <label className="block text-xs font-display font-medium text-[#94a3b8] mb-2 tracking-wider uppercase">Select Resume</label>
                        <select value={selectedResume} onChange={e => setSelectedResume(e.target.value)} className="input-field">
                            <option value="">Choose a resume…</option>
                            {resumes.map(r => <option key={r._id} value={r._id}>{r.fileName}</option>)}
                        </select>
                        {resumes.length === 0 && <p className="font-body text-xs text-[#475569] mt-1">No resumes found. <a href="/resume" className="text-[#6366f1] hover:underline">Upload one →</a></p>}
                    </div>
                    <div>
                        <label className="block text-xs font-display font-medium text-[#94a3b8] mb-2 tracking-wider uppercase">Job Title</label>
                        <input type="text" className="input-field" placeholder="e.g. Senior Frontend Developer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-display font-medium text-[#94a3b8] mb-2 tracking-wider uppercase">Job Description</label>
                        <textarea className="input-field resize-none" rows={8} placeholder="Paste the full job description here…" value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
                    </div>
                    <button onClick={handleAnalyze} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                        {loading ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Analyzing with AI</> : <><span>◎</span> Run ATS Analysis</>}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {result ? (
                        <motion.div key="result" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <div className="card text-center">
                                <div className="flex items-center justify-center mb-4"><ScoreRing score={result.score} size={140} color={scoreColor} label="ATS Score" /></div>
                                <p className="font-display font-bold text-lg" style={{ color: scoreColor }}>{result.score >= 70 ? 'Strong Match' : result.score >= 50 ? 'Moderate Match' : 'Needs Improvement'}</p>
                                {result.summary && <p className="font-body text-[#94a3b8] text-sm mt-2 leading-relaxed">{result.summary}</p>}
                            </div>
                            {result.sectionScores && (
                                <div className="card">
                                    <h3 className="font-display font-semibold text-[#f1f5f9] mb-4">Section Scores</h3>
                                    <div className="space-y-3">
                                        {Object.entries(result.sectionScores).map(([key, val]) => (
                                            <ProgressBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={Number(val) || 0} showValue color={SECTION_COLORS[key] || '#6366f1'} height={5} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex flex-col items-center justify-center min-h-64 text-center">
                            <div className="text-6xl opacity-15 mb-4">◎</div>
                            <p className="font-display font-medium text-[#94a3b8]">ATS results will appear here</p>
                            <p className="font-body text-[#475569] text-sm mt-1">Configure and run analysis to get your score</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {result.matchedKeywords?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                            <h3 className="font-display font-semibold text-[#10b981] mb-4">✓ Matched Keywords ({result.matchedKeywords.length})</h3>
                            <div className="flex flex-wrap gap-2">{result.matchedKeywords.map((kw, i) => <span key={i} className="px-2 py-1 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs font-mono">{kw}</span>)}</div>
                        </motion.div>
                    )}
                    {result.missingKeywords?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
                            <h3 className="font-display font-semibold text-[#f43f5e] mb-4">✗ Missing Keywords ({result.missingKeywords.length})</h3>
                            <div className="flex flex-wrap gap-2">{result.missingKeywords.map((kw, i) => <span key={i} className="px-2 py-1 rounded-lg bg-[#f43f5e]/10 border border-[#f43f5e]/20 text-[#f43f5e] text-xs font-mono">{kw}</span>)}</div>
                        </motion.div>
                    )}
                    {result.suggestions?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card lg:col-span-2">
                            <h3 className="font-display font-semibold text-[#6366f1] mb-4">→ AI Improvement Suggestions</h3>
                            <ul className="space-y-2">{result.suggestions.map((s, i) => <li key={i} className="flex items-start gap-2 font-body text-[#94a3b8] text-sm"><span className="text-[#6366f1] mt-0.5 flex-shrink-0">●</span>{s}</li>)}</ul>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
