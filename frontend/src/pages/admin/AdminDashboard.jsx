import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios.js';
import { StatCard } from '../../components/ui/index.jsx';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div className="glass-strong border border-[#1e1e2e] rounded-xl px-3 py-2 text-xs font-mono"><p className="text-[#475569] mb-1">{label}</p>{payload.map((p, i) => <p key={i} style={{ color: p.fill }}>{p.name}: {p.value}</p>)}</div>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/interviews?limit=5')])
      .then(([st, iv]) => { setStats(st.data); setRecent(iv.data.interviews || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full" /></div>;

  const total = stats?.totalInterviews || 0;
  const hasInterviews = total > 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="px-2 py-0.5 rounded-full bg-[#6366f1]/10 text-[#6366f1] text-xs font-display font-medium mb-1 inline-block">Admin</span>
          <h1 className="font-display font-bold text-3xl text-[#f1f5f9]">Admin Dashboard</h1>
          <p className="font-body text-[#94a3b8] text-sm mt-1">Platform overview and management</p>
        </div>
        <Link to="/admin/users" className="btn-primary text-sm">Manage Users →</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon="◯" label="Total Users" value={stats?.totalUsers || 0} color="accent" delay={0} />
        <StatCard icon="◈" label="Total Interviews" value={total} color="cyan" delay={0.1} />
        <StatCard icon="◧" label="Resumes Uploaded" value={stats?.totalResumes || 0} color="emerald" delay={0.2} />
        <StatCard icon="◉" label="Avg Score" value={hasInterviews ? `${stats?.avgScore || 0}%` : '—'} color="amber" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="font-display font-semibold text-[#f1f5f9] mb-4">Interview Volume by Domain</h2>
          {recent.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={Object.entries(recent.reduce((a, iv) => { a[iv.domain] = (a[iv.domain] || 0) + 1; return a; }, {})).map(([name, count]) => ({ name, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,30,46,0.8)" />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Interviews" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] gap-2 text-center">
              <div className="text-4xl opacity-15">◈</div>
              <p className="font-body text-[#475569] text-sm">No interview data yet</p>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <h2 className="font-display font-semibold text-[#f1f5f9] mb-4">System Health</h2>
          <div className="space-y-3">
            {[['API Response Time', '124ms'], ['AI Service (Mistral)', 'Operational'], ['Database', 'Connected'], ['File Storage', 'Active'], ['Socket.IO', 'Running']].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-[#0d0d14] border border-[#1e1e2e]">
                <span className="font-body text-sm text-[#94a3b8]">{label}</span>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse-slow" /><span className="font-mono text-xs text-[#10b981]">{value}</span></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-[#f1f5f9]">Recent Interviews</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead><tr className="border-b border-[#1e1e2e]">{['User', 'Domain', 'Type', 'Score', 'Status', 'Date'].map(h => <th key={h} className="text-left py-2 px-3 text-xs font-display font-medium text-[#475569] tracking-wider uppercase">{h}</th>)}</tr></thead>
            <tbody>
              {recent.length === 0
                ? <tr><td colSpan={6} className="text-center py-8 text-[#475569]">No interviews yet</td></tr>
                : recent.map(iv => (
                  <tr key={iv._id} className="border-b border-[#1e1e2e]/50 hover:bg-[#0d0d14]/50 transition-colors">
                    <td className="py-3 px-3 text-[#f1f5f9]">{iv.userId?.name || 'Unknown'}</td>
                    <td className="py-3 px-3 text-[#94a3b8] capitalize">{iv.domain}</td>
                    <td className="py-3 px-3 text-[#94a3b8] capitalize">{iv.type}</td>
                    <td className="py-3 px-3"><span className={`font-mono font-bold ${iv.scores?.overall >= 70 ? 'text-[#10b981]' : iv.scores?.overall >= 50 ? 'text-[#f59e0b]' : 'text-[#f43f5e]'}`}>{Math.round(iv.scores?.overall || 0)}%</span></td>
                    <td className="py-3 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-display capitalize ${iv.status === 'completed' ? 'bg-[#10b981]/10 text-[#10b981]' : iv.status === 'ongoing' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' : 'bg-[#0d0d14] text-[#475569]'}`}>{iv.status}</span></td>
                    <td className="py-3 px-3 text-[#475569] text-xs">{new Date(iv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
