import { motion } from 'framer-motion';
import { Link, Outlet } from 'react-router-dom';
export default function AuthLayout() {
    return (
        <div className="min-h-screen bg-void grid-bg flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6366f1]/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-6 left-6">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center glow-accent"><span className="text-white font-display font-bold text-sm">N</span></div>
                    <span className="font-display font-bold text-[#f1f5f9] text-lg">NexusAI</span>
                </Link>
            </div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10"><Outlet /></motion.div>
        </div>
    );
}
