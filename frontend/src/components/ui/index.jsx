import { motion } from 'framer-motion';

export function ScoreRing({ score = 0, size = 120, color = '#6366f1', label = '', subtitle = '' }) {
    const r = (size - 16) / 2, c = 2 * Math.PI * r, off = c - (Math.min(100, Math.max(0, score)) / 100) * c;
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(30,30,46,0.8)" strokeWidth="8" fill="none" />
                    <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="8" fill="none" strokeLinecap="round"
                        strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: off }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }} style={{ filter: `drop-shadow(0 0 6px ${color}60)` }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="font-display font-bold text-[#f1f5f9]" style={{ fontSize: size * 0.22 }}>{Math.round(score)}</motion.span>
                    {subtitle && <span className="font-body text-[#475569]" style={{ fontSize: size * 0.1 }}>{subtitle}</span>}
                </div>
            </div>
            {label && <span className="font-display text-xs text-[#94a3b8] tracking-wider uppercase">{label}</span>}
        </div>
    );
}

const STAT_COLORS = {
    accent: 'text-[#6366f1] bg-[#6366f1]/10 border-[#6366f1]/20',
    emerald: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20',
    amber: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20',
    rose: 'text-[#f43f5e] bg-[#f43f5e]/10 border-[#f43f5e]/20',
    cyan: 'text-[#06b6d4] bg-[#06b6d4]/10 border-[#06b6d4]/20'
};

export function StatCard({ icon, label, value, trend, color = 'accent', delay = 0 }) {
    const c = STAT_COLORS[color] || STAT_COLORS.accent;
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card hover:border-[#6366f1]/20 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg ${c}`}>{icon}</div>
                {trend !== undefined && <span className={`text-xs font-mono font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'text-[#10b981] bg-[#10b981]/10' : 'text-[#f43f5e] bg-[#f43f5e]/10'}`}>{trend >= 0 ? '+' : ''}{trend}%</span>}
            </div>
            <div className="font-display font-bold text-3xl text-[#f1f5f9] mb-1">{value}</div>
            <div className="font-body text-[#94a3b8] text-sm">{label}</div>
        </motion.div>
    );
}

export function ProgressBar({ value = 0, max = 100, color = '#6366f1', label = '', showValue = false, height = 6, animated = true }) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className="w-full">
            {(label || showValue) && <div className="flex items-center justify-between mb-1.5">
                {label && <span className="font-body text-xs text-[#94a3b8]">{label}</span>}
                {showValue && <span className="font-mono text-xs" style={{ color }}>{Math.round(pct)}%</span>}
            </div>}
            <div className="w-full bg-[#0d0d14] rounded-full overflow-hidden" style={{ height }}>
                <motion.div initial={animated ? { width: 0 } : { width: `${pct}%` }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}40` }} />
            </div>
        </div>
    );
}

const BADGE_VARIANTS = {
    accent: 'bg-[#6366f1]/10 border-[#6366f1]/30 text-[#6366f1]',
    emerald: 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]',
    amber: 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]',
    rose: 'bg-[#f43f5e]/10 border-[#f43f5e]/30 text-[#f43f5e]',
    cyan: 'bg-[#06b6d4]/10 border-[#06b6d4]/30 text-[#06b6d4]',
    muted: 'bg-[#0d0d14] border-[#1e1e2e] text-[#475569]'
};
export function Badge({ children, variant = 'accent', className = '' }) {
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-display font-medium ${BADGE_VARIANTS[variant] || BADGE_VARIANTS.accent} ${className}`}>{children}</span>;
}
