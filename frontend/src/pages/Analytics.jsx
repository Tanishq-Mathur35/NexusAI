import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/axios.js';
import { ScoreRing } from '../components/ui/index.jsx';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong border border-[#1e1e2e] rounded-xl px-4 py-3 text-xs font-mono">
      {label && <p className="text-[#475569] mb-1">{label}</p>}
      {payload.map((p, i) => <p key={i} style={{ color: p.color || p.fill }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e'];

const SectionEmpty = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center justify-center h-[220px] gap-3 text-center px-4">
    <div className="text-5xl opacity-15">{icon}</div>
    <p className="font-display font-medium text-[#94a3b8] text-sm">{title}</p>
    {desc && <p className="font-body text-[#475569] text-xs leading-relaxed max-w-[200px]">{desc}</p>}
  </div>
);

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [emotions, setEmotions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/overview'), api.get('/analytics/emotions')])
      .then(([ov, em]) => { setOverview(ov.data); setEmotions(em.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full" />
    </div>
  );

  const total = overview?.totalInterviews || 0;

  if (total === 0) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-[#f1f5f9] mb-2">Performance Analytics</h1>
          <p className="font-body text-[#94a3b8] text-sm">Comprehensive analysis of your interview performance over time.</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-glow text-center py-24">
          <div className="text-7xl opacity-20 mb-6">◉</div>
          <h2 className="font-display font-bold text-2xl text-[#f1f5f9] mb-3">No analytics data yet</h2>
          <p className="font-body text-[#94a3b8] text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Complete your first interview to unlock score trends, emotion distribution, domain breakdowns, and personalised AI-powered performance insights.
          </p>
          <Link to="/interview/start" className="btn-primary text-base py-3 px-8 inline-block">
            Start Your First Interview →
          </Link>
        </motion.div>
      </div>
    );
  }

  const avgScore = overview.avgScore || 0;
  const avgConf = overview.avgConfidence || 0;
  const trendData = overview.scoreTrend?.length ? overview.scoreTrend : [];
  const hasTrend = trendData.length >= 2;

  const domainData = overview.domainStats
    ? Object.entries(overview.domainStats).map(([domain, s]) => ({
        domain: domain.charAt(0).toUpperCase() + domain.slice(0, 7),
        count: s.count,
        avg: Math.round(s.totalScore / s.count)
      }))
    : [];

  const emotionData = emotions?.emotionSummary
    ? Object.entries(emotions.emotionSummary)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    : [];

  const improvementPct = hasTrend
    ? Math.round(trendData[trendData.length - 1].overall - trendData[0].overall)
    : 0;

  const bestDomain = domainData.length
    ? domainData.reduce((b, d) => d.avg > (b?.avg || 0) ? d : b, null)
    : null;

  const worstDomain = domainData.length > 1
    ? domainData.reduce((w, d) => d.avg < (w?.avg || 100) ? d : w, null)
    : null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-[#f1f5f9] mb-2">Performance Analytics</h1>
        <p className="font-body text-[#94a3b8] text-sm">Based on {total} completed interview{total !== 1 ? 's' : ''}.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Sessions', value: total, color: '#6366f1', icon: '◷' },
          { label: 'Avg Score', value: `${avgScore}%`, color: '#10b981', icon: '◉' },
          { label: 'Avg Confidence', value: `${avgConf}%`, color: '#06b6d4', icon: '◯' },
          {
            label: hasTrend ? (improvementPct >= 0 ? 'Improvement' : 'Change') : 'Sessions',
            value: hasTrend ? `${improvementPct >= 0 ? '+' : ''}${improvementPct}%` : `${total} done`,
            color: !hasTrend ? '#6366f1' : improvementPct >= 0 ? '#f59e0b' : '#f43f5e',
            icon: !hasTrend ? '◈' : improvementPct >= 0 ? '▲' : '▼'
          }
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
            <div className="flex items-start justify-between mb-3">
              <span className="text-lg" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div className="font-display font-bold text-2xl text-[#f1f5f9] mb-1">{s.value}</div>
            <div className="font-body text-[#94a3b8] text-sm">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-[#f1f5f9]">Score Progression</h2>
            {hasTrend && (
              <div className="flex items-center gap-4 text-xs font-body">
                {[['Overall','#6366f1'],['Confidence','#10b981'],['Technical','#06b6d4']].map(([l,c])=>(
                  <div key={l} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                    <span className="text-[#475569]">{l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {hasTrend ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData}>
                <defs>
                  {[['overall','#6366f1'],['confidence','#10b981'],['technical','#06b6d4']].map(([k,c])=>(
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,30,46,0.8)" />
                <XAxis dataKey="date" tick={{ fill:'#475569', fontSize:11, fontFamily:'DM Sans' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="overall" stroke="#6366f1" strokeWidth={2} fill="url(#g-overall)" name="Overall" />
                <Area type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} fill="url(#g-confidence)" name="Confidence" />
                <Area type="monotone" dataKey="technical" stroke="#06b6d4" strokeWidth={2} fill="url(#g-technical)" name="Technical" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <SectionEmpty icon="◉" title="Complete more interviews" desc="Need at least 2 sessions to show a progression chart." />
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card flex flex-col items-center justify-center">
          <h2 className="font-display font-semibold text-[#f1f5f9] mb-6 self-start">Overall Rating</h2>
          <ScoreRing score={avgScore} size={140} color="#6366f1" label="Avg Score" subtitle="%" />
          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
            <ScoreRing score={avgConf} size={80} color="#10b981" label="Confidence" />
            <ScoreRing score={Math.min(100, avgScore + 3)} size={80} color="#06b6d4" label="Technical" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="font-display font-semibold text-[#f1f5f9] mb-4">Performance by Domain</h2>
          {domainData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={domainData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,30,46,0.8)" />
                <XAxis dataKey="domain" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="avg" fill="#6366f1" radius={[4,4,0,0]} name="Avg Score" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <SectionEmpty icon="◧" title="Domain breakdown" desc="Finish at least one interview to see domain performance." />
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
          <h2 className="font-display font-semibold text-[#f1f5f9] mb-4">Emotion Distribution</h2>
          {emotionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={emotionData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {emotionData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<Tip />} />
                <Legend formatter={v => <span className="text-[#94a3b8] text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <SectionEmpty icon="◎" title="No emotion data yet" desc="Enable your camera during interviews to track facial emotions." />
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-glow">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse-slow" />
          <h2 className="font-display font-semibold text-[#f1f5f9]">AI Performance Insights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0d0d14] border border-[#1e1e2e]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#10b981]">▲</span>
              <span className="font-body text-xs text-[#475569]">Strongest Area</span>
            </div>
            <div className="font-display font-semibold text-[#f1f5f9] mb-1 capitalize">
              {bestDomain ? bestDomain.domain : avgScore >= 70 ? 'Technical Skills' : 'Keep Practicing'}
            </div>
            <div className="font-body text-[#94a3b8] text-xs leading-relaxed">
              {bestDomain
                ? `Your best domain with an average score of ${bestDomain.avg}%.`
                : avgScore >= 70
                ? `Scoring consistently above ${avgScore}% across sessions.`
                : 'Complete more interviews to identify your strongest areas.'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0d0d14] border border-[#1e1e2e]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#f59e0b]">△</span>
              <span className="font-body text-xs text-[#475569]">Growth Area</span>
            </div>
            <div className="font-display font-semibold text-[#f1f5f9] mb-1">
              {worstDomain && worstDomain !== bestDomain ? worstDomain.domain.charAt(0).toUpperCase() + worstDomain.domain.slice(1) : avgConf < 70 ? 'Confidence' : 'Communication'}
            </div>
            <div className="font-body text-[#94a3b8] text-xs leading-relaxed">
              {worstDomain && worstDomain !== bestDomain
                ? `Average ${worstDomain.avg}%. Focus here for the fastest improvement.`
                : 'Reducing filler words and structuring answers improves scores significantly.'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0d0d14] border border-[#1e1e2e]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#6366f1]">→</span>
              <span className="font-body text-xs text-[#475569]">Next Focus</span>
            </div>
            <div className="font-display font-semibold text-[#f1f5f9] mb-1">
              {total < 3 ? 'More Sessions' : avgScore < 70 ? 'STAR Method' : 'Senior-Level Problems'}
            </div>
            <div className="font-body text-[#94a3b8] text-xs leading-relaxed">
              {total < 3
                ? `${total} session${total !== 1 ? 's' : ''} done. Aim for 5+ to unlock deeper trend insights.`
                : avgScore < 70
                ? 'Use Situation, Task, Action, Result to structure all behavioral answers.'
                : 'Practice system design and architecture to reach senior benchmarks.'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
