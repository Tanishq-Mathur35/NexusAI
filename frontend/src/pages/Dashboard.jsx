import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ScoreRing, StatCard } from '../components/ui/index.jsx';
import useAuthStore from '../store/authStore.js';
import useInterviewStore from '../store/interviewStore.js';

const ChartTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="glass-strong border border-[#1e1e2e] rounded-xl px-4 py-3 text-xs font-mono">
            <p className="text-[#94a3b8] mb-1">{label}</p>
            {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
        </div>
    );
};

const NoDataPlaceholder = ({ icon, message, actionTo, actionLabel }) => (
    <div className="flex flex-col items-center justify-center h-[220px] gap-3 text-center px-4">
        <div className="text-5xl opacity-15">{icon}</div>
        <p className="font-body text-[#475569] text-sm leading-relaxed">{message}</p>
        {actionTo && <Link to={actionTo} className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors font-body">{actionLabel}</Link>}
    </div>
);

export default function Dashboard() {
    const { user } = useAuthStore();
    const { stats, fetchStats, interviews, fetchInterviews } = useInterviewStore();

    useEffect(() => { fetchStats(); fetchInterviews(); }, []);

    const hasData = (stats?.totalInterviews || 0) > 0;
    const total = stats?.totalInterviews || 0;
    const avgScore = hasData ? (stats?.avgScore || 0) : 0;
    const avgConf = hasData ? (stats?.avgConfidence || 0) : 0;
    const best = user?.stats?.bestScore || 0;
    const trendData = (stats?.scoreTrend?.length > 0) ? stats.scoreTrend : [];

    const radarData = hasData ? [
        { subject: 'Technical', A: Math.min(100, avgScore + 5) },
        { subject: 'Comms', A: Math.min(100, avgConf - 4) },
        { subject: 'Confidence', A: avgConf },
        { subject: 'HR', A: Math.min(100, avgScore - 2) },
        { subject: 'Problem Solving', A: Math.min(100, avgScore + 8) },
        { subject: 'Leadership', A: Math.max(0, avgScore - 10) }
    ] : [];

    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const avgTechnical = completedInterviews.length
        ? Math.round(completedInterviews.reduce((s, i) => s + (i.scores?.technical || 0), 0) / completedInterviews.length)
        : 0;
    const avgHR = completedInterviews.length
        ? Math.round(completedInterviews.reduce((s, i) => s + (i.scores?.hr || 0), 0) / completedInterviews.length)
        : 0;

    const aiInsight = avgScore >= 80
        ? 'Excellent performance! Try harder difficulty levels to push your limits further.'
        : avgScore >= 60
            ? 'Good progress. Focus on reducing filler words and structuring answers with the STAR method.'
            : total > 0
                ? 'Keep practicing! Start with easier domains to build confidence and improve your scores.'
                : 'Complete your first interview to receive personalised AI feedback and performance insights.';

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="font-display font-bold text-3xl text-[#f1f5f9] mb-1">
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'},{' '}
                        <span className="text-[#6366f1]">{user?.name?.split(' ')[0]}</span>
                    </motion.h1>
                    <p className="font-body text-[#94a3b8] text-sm">
                        {hasData ? "Here's your interview performance overview" : 'Complete your first interview to see your stats here'}
                    </p>
                </div>
                <Link to="/interview/start" className="btn-primary flex items-center gap-2">
                    <span>◈</span> New Interview
                </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard icon="◷" label="Total Interviews" value={total} color="accent" delay={0} />
                <StatCard icon="◉" label="Avg Score" value={hasData ? `${avgScore}%` : '—'} color="emerald" delay={0.1} />
                <StatCard icon="◯" label="Confidence" value={hasData ? `${avgConf}%` : '—'} color="cyan" delay={0.2} />
                <StatCard icon="◎" label="Best Score" value={hasData ? `${best}%` : '—'} color="amber" delay={0.3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display font-semibold text-[#f1f5f9]">Score Trend</h2>
                        {trendData.length > 0 && (
                            <div className="flex items-center gap-4 text-xs font-body">
                                {[['Overall', '#6366f1'], ['Confidence', '#10b981'], ['Technical', '#06b6d4']].map(([l, c]) => (
                                    <div key={l} className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                                        <span className="text-[#475569]">{l}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,30,46,0.8)" />
                                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTip />} />
                                <Line type="monotone" dataKey="overall" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} name="Overall" />
                                <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="Confidence" />
                                <Line type="monotone" dataKey="technical" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 3 }} name="Technical" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <NoDataPlaceholder
                            icon="◉"
                            message="No interview history yet. Complete your first session to track score trends over time."
                            actionTo="/interview/start"
                            actionLabel="Start your first interview →"
                        />
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
                    <h2 className="font-display font-semibold text-[#f1f5f9] mb-6">Skill Radar</h2>
                    {radarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(30,30,46,0.8)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'DM Sans' }} />
                                <Radar name="Skills" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : (
                        <NoDataPlaceholder
                            icon="◎"
                            message="Skill breakdown appears after your first completed interview."
                        />
                    )}
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display font-semibold text-[#f1f5f9]">Recent Interviews</h2>
                        {interviews.length > 0 && (
                            <Link to="/history" className="text-xs text-[#6366f1] hover:text-[#818cf8] transition-colors font-body">View All →</Link>
                        )}
                    </div>
                    {interviews.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="text-4xl mb-3 opacity-30">◈</div>
                            <p className="font-body text-[#475569] text-sm">No interviews yet</p>
                            <Link to="/interview/start" className="text-[#6366f1] text-sm hover:underline mt-2 inline-block">Start your first →</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {interviews.slice(0, 4).map((iv) => (
                                <Link key={iv._id}
                                    to={iv.status === 'completed' ? `/interview/report/${iv._id}` : `/interview/session/${iv._id}`}
                                    className="flex items-center justify-between p-3 rounded-xl bg-[#0d0d14] hover:bg-[#12121c] border border-[#1e1e2e] hover:border-[#6366f1]/20 transition-all duration-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1] text-sm">◈</div>
                                        <div>
                                            <p className="font-display text-sm font-medium text-[#f1f5f9] capitalize">{iv.domain}</p>
                                            <p className="font-body text-xs text-[#475569]">{iv.difficulty} · {new Date(iv.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {iv.status === 'completed' ? (
                                            <>
                                                <p className="font-display font-bold text-sm text-[#6366f1]">{Math.round(iv.scores?.overall || 0)}%</p>
                                                <p className="font-body text-xs text-[#475569]">completed</p>
                                            </>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 text-[#f59e0b] text-xs font-display">ongoing</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
                    <h2 className="font-display font-semibold text-[#f1f5f9] mb-6">Performance Scores</h2>
                    {!hasData ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <div className="text-5xl opacity-20">◯</div>
                            <p className="font-body text-[#475569] text-sm text-center leading-relaxed">
                                Complete an interview to see your performance breakdown across technical, communication, confidence, and HR dimensions.
                            </p>
                            <Link to="/interview/start" className="btn-primary text-sm py-2 px-5">Start Interview →</Link>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center justify-center gap-6">
                                <ScoreRing score={avgScore} size={100} color="#6366f1" label="Overall" />
                                <ScoreRing score={avgConf} size={100} color="#10b981" label="Confidence" />
                                <ScoreRing score={avgTechnical || avgScore} size={100} color="#06b6d4" label="Technical" />
                                <ScoreRing score={avgHR || Math.max(0, avgScore - 5)} size={100} color="#f59e0b" label="HR Skills" />
                            </div>
                            <div className="mt-6 p-4 rounded-xl bg-[#6366f1]/5 border border-[#6366f1]/10">
                                <p className="font-body text-[#94a3b8] text-xs leading-relaxed">
                                    💡 <strong className="text-[#f1f5f9]">AI Insight:</strong> {aiInsight}
                                </p>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
