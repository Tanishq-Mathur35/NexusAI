import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <motion.div animate={{ rotate:360 }} transition={{ duration:2, repeat:Infinity, ease:'linear' }} className="w-12 h-12 border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full" />
        <motion.p animate={{ opacity:[0.4,1,0.4] }} transition={{ duration:1.5, repeat:Infinity }} className="font-display text-[#94a3b8] text-sm tracking-widest uppercase">Initializing</motion.p>
      </div>
    </div>
  );
}

export function EmptyState({ icon='◎', title='Nothing here yet', description='', actionLabel='', actionTo='' }) {
  return (
    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="text-6xl opacity-15 mb-5">{icon}</div>
      <h3 className="font-display font-semibold text-[#94a3b8] text-lg mb-2">{title}</h3>
      {description && <p className="font-body text-[#475569] text-sm max-w-xs leading-relaxed mb-6">{description}</p>}
      {actionLabel && actionTo && <Link to={actionTo} className="btn-primary text-sm py-2 px-5">{actionLabel}</Link>}
    </motion.div>
  );
}

export default LoadingScreen;
