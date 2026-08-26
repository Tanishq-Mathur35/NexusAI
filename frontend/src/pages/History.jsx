import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

const STATUS = {
    completed: 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]',
    ongoing: 'bg-[#f59e0b]/10 border-[#f59e0b]/20 text-[#f59e0b]',
    abandoned: 'bg-[#0d0d14] border-[#1e1e2e] text-[#475569]'
};
const DIFF = { easy: 'text-[#10b981]', medium: 'text-[#f59e0b]', hard: 'text-[#f43f5e]' };
const sc = s => s >= 70 ? 'text-[#10b981]' : s >= 50 ? 'text-[#f59e0b]' : 'text-[#f43f5e]';

export default function History() {
    const [interviews, setInterviews] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetch = async (p = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/interviews?page=${p}&limit=10`);
            setInterviews(data.interviews || []);
            setTotal(data.total || 0);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetch(page); }, [page]);

    const filtered = filter === 'all' ? interviews : interviews.filter(i => i.status === filter);
    const totalPages = Math.ceil(total / 10);

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display font-bold text-3xl text-[#f1f5f9] mb-2">Interview History</h1>
                    <p className="font-body text-[#94a3b8] text-sm">{total} total sessions</p>
                </div>
                <Link to="/interview/start" className="btn-primary text-sm">New Interview →</Link>
            </div>

            <div className="flex items-center gap-2 mb-6">
                {['all', 'completed', 'ongoing', 'abandoned'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all capitalize ${filter === f ? 'bg-[#6366f1] text-white' : 'bg-[#0d0d14] border border-[#1e1e2e] text-[#94a3b8] hover:text-[#f1f5f9]'}`}>
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-10 h-10 border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-5xl opacity-20 mb-4">◷</div>
                    <p className="font-body text-[#475569] mb-4">{filter === 'all' ? 'No interviews yet.' : `No ${filter} interviews.`}</p>
                    <Link to="/interview/start" className="text-[#6366f1] text-sm hover:underline">Start one →</Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((iv, i) => (
                        <motion.div key={iv._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="card hover:border-[#6366f1]/20 transition-all duration-200">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1] flex-shrink-0">◈</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-display font-semibold text-[#f1f5f9] capitalize">{iv.domain}</span>
                                        <span className={`px-2 py-0.5 rounded-full border text-xs font-display capitalize ${STATUS[iv.status] || STATUS.abandoned}`}>{iv.status}</span>
                                        <span className={`text-xs font-mono capitalize ${DIFF[iv.difficulty]}`}>{iv.difficulty}</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs font-body text-[#475569]">
                                        <span className="capitalize">{iv.type} round</span>
                                        <span>·</span>
                                        <span>{iv.questions?.length || 0} questions</span>
                                        <span>·</span>
                                        <span>{new Date(iv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    {iv.status === 'completed' && (
                                        <div className="text-right">
                                            <div className={`font-display font-bold text-xl ${sc(iv.scores?.overall || 0)}`}>{Math.round(iv.scores?.overall || 0)}%</div>
                                            <div className="font-body text-xs text-[#475569]">Overall</div>
                                        </div>
                                    )}
                                    {iv.status === 'completed'
                                        ? <Link to={`/interview/report/${iv._id}`} className="px-4 py-2 rounded-xl border border-[#6366f1]/30 text-[#6366f1] hover:bg-[#6366f1]/10 text-xs font-display transition-all">View Report</Link>
                                        : iv.status === 'ongoing'
                                            ? <Link to={`/interview/session/${iv._id}`} className="px-4 py-2 rounded-xl border border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[#f59e0b]/10 text-xs font-display transition-all">Resume</Link>
                                            : null}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm py-2 px-4 disabled:opacity-40">← Prev</button>
                    <span className="font-mono text-[#94a3b8] text-sm">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="btn-ghost text-sm py-2 px-4 disabled:opacity-40">Next →</button>
                </div>
            )}
        </div>
    );
}
