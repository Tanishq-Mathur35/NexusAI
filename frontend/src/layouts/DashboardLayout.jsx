import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';

const NAV = [
  { path:'/dashboard', label:'Dashboard', icon:'⬡' },
  { path:'/interview/start', label:'New Interview', icon:'◈' },
  { path:'/resume', label:'Resume', icon:'◧' },
  { path:'/ats', label:'ATS Score', icon:'◎' },
  { path:'/history', label:'History', icon:'◷' },
  { path:'/analytics', label:'Analytics', icon:'◉' },
  { path:'/profile', label:'Profile', icon:'◯' }
];
const ADMIN_NAV = [
  { path:'/admin', label:'Admin Panel', icon:'◆' },
  { path:'/admin/users', label:'Users', icon:'◈' }
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); toast.success('Logged out'); navigate('/login'); };
  const items = user?.role === 'admin' ? [...NAV, ...ADMIN_NAV] : NAV;

  return (
    <div className="flex h-screen bg-void overflow-hidden">
      <motion.aside animate={{ width: collapsed ? 68 : 236 }} transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex flex-col glass-strong border-r border-[#1e1e2e] z-20 flex-shrink-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1e1e2e] flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center flex-shrink-0 glow-accent">
            <span className="text-white font-display font-bold text-sm">N</span>
          </div>
          <AnimatePresence>
            {!collapsed && <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="font-display font-bold text-lg text-[#f1f5f9] whitespace-nowrap">NexusAI</motion.span>}
          </AnimatePresence>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {items.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/dashboard' || item.path === '/admin'}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-[#6366f1]/15 border border-[#6366f1]/30 text-[#6366f1]' : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#0d0d14]'}`}>
              <span className="text-lg flex-shrink-0 leading-none">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="font-body text-sm whitespace-nowrap">{item.label}</motion.span>}
              </AnimatePresence>
              {collapsed && <div className="absolute left-full ml-3 px-2 py-1 bg-[#12121c] border border-[#1e1e2e] rounded-lg text-xs text-[#f1f5f9] opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">{item.label}</div>}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-[#1e1e2e] space-y-0.5 flex-shrink-0">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-[#94a3b8] hover:text-[#f43f5e] hover:bg-[#f43f5e]/10 transition-all">
            <span className="text-lg flex-shrink-0">⊗</span>
            <AnimatePresence>{!collapsed && <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="font-body text-sm">Logout</motion.span>}</AnimatePresence>
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-[#475569] hover:text-[#94a3b8] transition-all">
            <span className="text-base flex-shrink-0">{collapsed ? '▷' : '◁'}</span>
          </button>
        </div>
      </motion.aside>
      <main className="flex-1 overflow-auto grid-bg"><Outlet /></main>
    </div>
  );
}
