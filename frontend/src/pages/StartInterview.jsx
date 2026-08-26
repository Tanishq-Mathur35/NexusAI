import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import useInterviewStore from '../store/interviewStore.js';

const DOMAINS = [
    { id: 'frontend', label: 'Frontend Dev', icon: '◧', desc: 'React, Vue, CSS, JS' },
    { id: 'backend', label: 'Backend Dev', icon: '◨', desc: 'Node, Python, APIs' },
    { id: 'fullstack', label: 'Full Stack', icon: '⬡', desc: 'End-to-end development' },
    { id: 'devops', label: 'DevOps', icon: '◉', desc: 'CI/CD, Docker, AWS' },
    { id: 'data-science', label: 'Data Science', icon: '◎', desc: 'ML, Python, Stats' },
    { id: 'product', label: 'Product Manager', icon: '◈', desc: 'Strategy, Roadmap' },
    { id: 'design', label: 'UI/UX Design', icon: '◷', desc: 'Figma, User Research' },
    { id: 'mobile', label: 'Mobile Dev', icon: '◯', desc: 'iOS, Android, RN' },
    { id: 'security', label: 'Cybersecurity', icon: '◆', desc: 'Pentesting, SOC' },
    { id: 'management', label: 'Eng Manager', icon: '▷', desc: 'Leadership, Process' },
    { id: 'blockchain', label: 'Blockchain', icon: '⬢', desc: 'Web3, Solidity' },
    { id: 'hr', label: 'HR & People', icon: '◑', desc: 'Talent, Culture' }
];
const DIFFICULTIES = [
    { id: 'easy', label: 'Junior', desc: '0–2 years', dots: '●○○', color: '#10b981' },
    { id: 'medium', label: 'Mid-Level', desc: '2–5 years', dots: '●●○', color: '#f59e0b' },
    { id: 'hard', label: 'Senior', desc: '5+ years', dots: '●●●', color: '#f43f5e' }
];
const TYPES = [
    { id: 'technical', label: 'Technical', icon: '◎', desc: 'Coding & system design' },
    { id: 'hr', label: 'HR Round', icon: '◯', desc: 'Behavioral & cultural fit' },
    { id: 'mixed', label: 'Mixed', icon: '⬡', desc: 'Both technical & HR' }
];

export default function StartInterview() {
    const [step, setStep] = useState(1);
    const [config, setConfig] = useState({ domain: '', difficulty: 'medium', type: 'mixed', resumeId: '' });
    const [resumes, setResumes] = useState([]);
    const [loadingResumes, setLoadingResumes] = useState(false);
    const { startInterview, isLoading } = useInterviewStore();
    const navigate = useNavigate();

    const fetchResumes = async () => {
        setLoadingResumes(true);
        try { const { data } = await api.get('/resume'); setResumes(data.resumes || []); } catch { }
        setLoadingResumes(false);
    };

    const next = () => {
        if (step === 1 && !config.domain) return toast.error('Please select a domain');
        if (step === 3) fetchResumes();
        setStep(s => s + 1);
    };

    const handleStart = async () => {
        const r = await startInterview(config);
        if (r.success) { toast.success('Interview started!'); navigate(`/interview/session/${r.interview._id}`); }
        else toast.error(r.error || 'Failed to start interview');
    };

    const STEPS = ['Domain', 'Level', 'Type', 'Resume'];

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <h1 className="font-display font-bold text-3xl text-[#f1f5f9] mb-2">Configure Interview</h1>
                <p className="font-body text-[#94a3b8] text-sm">Set up your AI-powered mock interview session</p>
            </motion.div>

            <div className="flex items-center gap-2 mb-10">
                {STEPS.map((s, i) => (
                    <React.Fragment key={s}>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all ${i + 1 === step ? 'bg-[#6366f1] text-white' : i + 1 < step ? 'bg-[#6366f1]/20 text-[#6366f1]' : 'bg-[#0d0d14] text-[#475569]'}`}>
                            <span>{i + 1 < step ? '✓' : i + 1}</span><span>{s}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`flex-1 h-px transition-all duration-500 ${i + 1 < step ? 'bg-[#6366f1]/40' : 'bg-[#1e1e2e]'}`} />}
                    </React.Fragment>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 className="font-display font-semibold text-xl text-[#f1f5f9] mb-6">Select Job Domain</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {DOMAINS.map(d => (
                                <button key={d.id} onClick={() => setConfig(c => ({ ...c, domain: d.id }))}
                                    className={`p-4 rounded-2xl border text-left transition-all duration-200 ${config.domain === d.id ? 'border-[#6366f1]/40 bg-[#6366f1]/10 glow-accent' : 'border-[#1e1e2e] bg-[#0d0d14] hover:border-[#6366f1]/30 hover:bg-[#12121c]'}`}>
                                    <div className={`text-2xl mb-2 ${config.domain === d.id ? 'text-[#6366f1]' : 'text-[#94a3b8]'}`}>{d.icon}</div>
                                    <div className="font-display font-semibold text-sm text-[#f1f5f9]">{d.label}</div>
                                    <div className="font-body text-xs text-[#475569] mt-0.5">{d.desc}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 className="font-display font-semibold text-xl text-[#f1f5f9] mb-6">Select Difficulty Level</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {DIFFICULTIES.map(d => (
                                <button key={d.id} onClick={() => setConfig(c => ({ ...c, difficulty: d.id }))}
                                    className={`p-6 rounded-2xl border text-left transition-all duration-200 ${config.difficulty === d.id ? 'border-2' : 'border-[#1e1e2e] bg-[#0d0d14] hover:bg-[#12121c]'}`}
                                    style={config.difficulty === d.id ? { borderColor: `${d.color}60`, backgroundColor: `${d.color}15` } : {}}>
                                    <div className="font-display font-bold text-xl text-[#f1f5f9] mb-1">{d.label}</div>
                                    <div className="font-body text-sm text-[#94a3b8] mb-3">{d.desc}</div>
                                    <div className="font-display text-2xl" style={{ color: d.color }}>{d.dots}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 className="font-display font-semibold text-xl text-[#f1f5f9] mb-6">Select Interview Type</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {TYPES.map(t => (
                                <button key={t.id} onClick={() => setConfig(c => ({ ...c, type: t.id }))}
                                    className={`p-6 rounded-2xl border text-left transition-all duration-200 ${config.type === t.id ? 'border-[#6366f1]/40 bg-[#6366f1]/10 glow-accent' : 'border-[#1e1e2e] bg-[#0d0d14] hover:border-[#6366f1]/30 hover:bg-[#12121c]'}`}>
                                    <div className={`text-3xl mb-4 ${config.type === t.id ? 'text-[#6366f1]' : 'text-[#94a3b8]'}`}>{t.icon}</div>
                                    <div className="font-display font-bold text-xl text-[#f1f5f9]">{t.label}</div>
                                    <div className="font-body text-[#94a3b8] text-sm mt-1">{t.desc}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 className="font-display font-semibold text-xl text-[#f1f5f9] mb-2">Link Resume (Optional)</h2>
                        <p className="font-body text-[#94a3b8] text-sm mb-6">Attach a resume for personalized questions based on your background.</p>
                        <div className="space-y-4 mb-8">
                            <button onClick={() => setConfig(c => ({ ...c, resumeId: '' }))}
                                className={`w-full p-4 rounded-2xl border text-left transition-all ${!config.resumeId ? 'border-[#6366f1]/40 bg-[#6366f1]/10' : 'border-[#1e1e2e] bg-[#0d0d14] hover:bg-[#12121c]'}`}>
                                <div className="font-display font-semibold text-[#f1f5f9]">No Resume</div>
                                <div className="font-body text-[#475569] text-sm">Use general questions for the selected domain</div>
                            </button>
                            {loadingResumes
                                ? <div className="text-center py-4 text-[#475569] font-body text-sm">Loading…</div>
                                : resumes.length === 0
                                    ? <div className="p-4 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] text-center">
                                        <p className="font-body text-[#475569] text-sm">No resumes uploaded yet.</p>
                                        <a href="/resume" className="text-[#6366f1] text-sm hover:underline mt-1 inline-block">Upload one →</a>
                                    </div>
                                    : resumes.map(r => (
                                        <button key={r._id} onClick={() => setConfig(c => ({ ...c, resumeId: r._id }))}
                                            className={`w-full p-4 rounded-2xl border text-left transition-all ${config.resumeId === r._id ? 'border-[#6366f1]/40 bg-[#6366f1]/10' : 'border-[#1e1e2e] bg-[#0d0d14] hover:bg-[#12121c]'}`}>
                                            <div className="font-display font-semibold text-[#f1f5f9]">{r.fileName}</div>
                                            <div className="font-body text-[#475569] text-sm">{r.parsedData?.skills?.slice(0, 4).join(', ')} · {new Date(r.createdAt).toLocaleDateString()}</div>
                                        </button>
                                    ))
                            }
                        </div>
                        <div className="card-glow mb-6">
                            <h3 className="font-display font-semibold text-[#f1f5f9] mb-3">Summary</h3>
                            <div className="grid grid-cols-2 gap-3 text-sm font-body">
                                {[['Domain', config.domain], ['Level', config.difficulty], ['Type', config.type], ['Questions', '8']].map(([k, v]) => (
                                    <div key={k}><span className="text-[#475569]">{k}:</span> <span className="text-[#6366f1] font-medium capitalize">{v}</span></div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-between mt-10">
                <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="btn-ghost disabled:opacity-40 disabled:cursor-not-allowed">← Back</button>
                {step < 4
                    ? <button onClick={next} className="btn-primary">Continue →</button>
                    : <button onClick={handleStart} disabled={isLoading} className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                        {isLoading ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Generating Questions</> : <><span>◈</span> Start Interview</>}
                    </button>}
            </div>
        </div>
    );
}
