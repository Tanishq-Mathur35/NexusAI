import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/axios.js';
import { ProgressBar, ScoreRing } from '../components/ui/index.jsx';

const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-strong border border-[#1e1e2e] rounded-xl px-3 py-2 text-xs font-mono">
            {label && <p className="text-[#475569] mb-1">{label}</p>}
            {payload.map((p, i) => <p key={i} style={{ color: p.fill || p.color }}>{p.name}: {p.value}</p>)}
        </div>
    );
};

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e'];
const fmtDur = s => s ? `${Math.floor(s / 60)}m ${s % 60}s` : 'N/A';
const scoreColor = s => s >= 70 ? '#10b981' : s >= 50 ? '#f59e0b' : '#f43f5e';

export default function InterviewReport() {
    const { id } = useParams();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/interviews/${id}`)
            .then(({ data }) => setInterview(data.interview))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full" />
        </div>
    );

    if (!interview) return (
        <div className="p-8 text-center">
            <p className="text-[#475569] mb-4">Interview not found.</p>
            <Link to="/history" className="text-[#6366f1] hover:underline">← Back to History</Link>
        </div>
    );

    const { scores, report, questions = [], speechMetrics, emotionTimeline = [], domain, difficulty, duration } = interview;

    const scoreData = [
        { name: 'Technical', score: Math.round(scores?.technical || 0), fill: '#6366f1' },
        { name: 'Communication', score: Math.round(scores?.communication || 0), fill: '#10b981' },
        { name: 'Confidence', score: Math.round(scores?.confidence || 0), fill: '#06b6d4' },
        { name: 'HR Skills', score: Math.round(scores?.hr || 0), fill: '#f59e0b' }
    ];

    const emotionCounts = emotionTimeline.reduce((acc, e) => {
        if (e.emotion) acc[e.emotion] = (acc[e.emotion] || 0) + 1;
        return acc;
    }, {});
    const emotionPie = Object.entries(emotionCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
    const answeredQuestions = questions.filter(q => q.answer);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link to="/history" className="text-[#475569] hover:text-[#94a3b8] text-sm font-body transition-colors">History</Link>
                        <span className="text-[#475569] text-sm">›</span>
                        <span className="text-[#94a3b8] text-sm font-body">Report</span>
                    </div>
                    <h1 className="font-display font-bold text-3xl text-[#f1f5f9] capitalize">{domain} Interview Report</h1>
                    <p className="font-body text-[#94a3b8] text-sm mt-1 capitalize">{difficulty} · {fmtDur(duration)} · {new Date(interview.createdAt).toLocaleDateString()}</p>
                </div>
                <Link to="/interview/start" className="btn-primary text-sm">New Interview →</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {scoreData.map((s, i) => (
                    <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card text-center">
                        <ScoreRing score={s.score} size={80} color={s.fill} />
                        <p className="font-display text-xs text-[#94a3b8] mt-2">{s.name}</p>
                    </motion.div>
                ))}
            </div>

            {report?.summary && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-glow mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse-slow" />
                        <h2 className="font-display font-semibold text-[#f1f5f9]">AI Analysis Summary</h2>
                    </div>
                    <p className="font-body text-[#94a3b8] leading-relaxed">{report.summary}</p>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
                    <h2 className="font-display font-semibold text-[#f1f5f9] mb-4">Score Breakdown</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={scoreData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,30,46,0.8)" horizontal={false} />
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={95} />
                            <Tooltip content={<Tip />} />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                {scoreData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {emotionPie.length > 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
                        <h2 className="font-display font-semibold text-[#f1f5f9] mb-4">Emotion Distribution</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={emotionPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                    {emotionPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie>
                                <Legend formatter={v => <span className="text-[#94a3b8] text-xs capitalize">{v}</span>} />
                                <Tooltip content={<Tip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card flex flex-col items-center justify-center text-center">
                        <div className="text-4xl opacity-20 mb-3">📷</div>
                        <p className="font-body text-[#475569] text-sm">No emotion data recorded.</p>
                        <p className="font-body text-[#475569] text-xs mt-1">Enable camera during interviews to track emotions.</p>
                    </motion.div>
                )}
            </div>

            {speechMetrics && speechMetrics.totalWords > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card mb-6">
                    <h2 className="font-display font-semibold text-[#f1f5f9] mb-4">Speech Analytics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {[['Words/Min', speechMetrics.wordsPerMinute, '#6366f1'], ['Total Words', speechMetrics.totalWords, '#06b6d4'], ['Filler Words', speechMetrics.fillerCount, '#f59e0b'], ['Clarity', `${speechMetrics.clarityScore}%`, '#10b981']].map(([l, v, c]) => (
                            <div key={l} className="p-4 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] text-center">
                                <div className="font-display font-bold text-2xl mb-1" style={{ color: c }}>{v}</div>
                                <div className="font-body text-[#475569] text-xs">{l}</div>
                            </div>
                        ))}
                    </div>
                    <ProgressBar label="Clarity Score" value={speechMetrics.clarityScore} showValue color="#10b981" height={5} />
                    {speechMetrics.fillerWords?.length > 0 && (
                        <div className="mt-4 p-3 rounded-xl bg-[#f59e0b]/5 border border-[#f59e0b]/20">
                            <p className="font-display text-xs text-[#f59e0b] font-medium mb-2">Detected Filler Words:</p>
                            <div className="flex flex-wrap gap-2">
                                {speechMetrics.fillerWords.map((w, i) => <span key={i} className="px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b] text-xs font-mono">"{w}"</span>)}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {[
                    ['✓ Strengths', report?.strengths, '#10b981'],
                    ['△ Improvements', report?.improvements, '#f59e0b'],
                    ['→ Recommendations', report?.recommendations, '#06b6d4']
                ].filter(([, items]) => items?.length > 0).map(([title, items, color]) => (
                    <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                        <h2 className="font-display font-semibold mb-4" style={{ color }}>{title}</h2>
                        <ul className="space-y-2">
                            {items.map((s, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm font-body text-[#94a3b8]">
                                    <span className="mt-0.5 flex-shrink-0" style={{ color }}>●</span>{s}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            {answeredQuestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card">
                    <h2 className="font-display font-semibold text-[#f1f5f9] mb-4">Question-by-Question Review</h2>
                    <div className="space-y-4">
                        {answeredQuestions.map((q, i) => (
                            <div key={i} className="p-4 rounded-xl bg-[#0d0d14] border border-[#1e1e2e]">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        <span className="w-7 h-7 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#6366f1] flex items-center justify-center text-xs font-display font-bold flex-shrink-0">{i + 1}</span>
                                        <p className="font-body text-[#f1f5f9] text-sm leading-relaxed">{q.question}</p>
                                    </div>
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl border flex items-center justify-center font-display font-bold text-lg`}
                                        style={{ borderColor: `${scoreColor(q.score)}40`, backgroundColor: `${scoreColor(q.score)}15`, color: scoreColor(q.score) }}>
                                        {q.score}
                                    </div>
                                </div>
                                {q.feedback && (
                                    <div className="ml-10 p-3 rounded-lg bg-void border border-[#1e1e2e]">
                                        <p className="font-body text-[#94a3b8] text-xs leading-relaxed">{q.feedback}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
