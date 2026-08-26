import { motion } from 'framer-motion';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

export function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const r = await login(form.email, form.password);
        if (r.success) { toast.success('Welcome back!'); navigate('/dashboard'); } else toast.error(r.error);
    };
    return (
        <div className="glass-strong rounded-2xl p-8 border border-[#1e1e2e]">
            <div className="text-center mb-8">
                <h1 className="font-display font-bold text-3xl text-[#f1f5f9] mb-2">Welcome Back</h1>
                <p className="font-body text-[#94a3b8] text-sm">Sign in to continue your interview prep</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div><label className="block text-xs font-display font-medium text-[#94a3b8] mb-2 tracking-wider uppercase">Email</label>
                    <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
                <div><label className="block text-xs font-display font-medium text-[#94a3b8] mb-2 tracking-wider uppercase">Password</label>
                    <input type="password" className="input-field" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                    {isLoading ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Signing In</> : 'Sign In →'}
                </button>
            </form>
            <div className="mt-6 pt-6 border-t border-[#1e1e2e] text-center">
                <p className="font-body text-[#94a3b8] text-sm">No account? <Link to="/register" className="text-[#6366f1] hover:text-[#818cf8] transition-colors font-medium">Create one free</Link></p>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[#6366f1]/5 border border-[#6366f1]/10">
                <p className="text-xs font-mono text-[#475569] text-center">Demo: admin@nexus.ai / password123</p>
            </div>
        </div>
    );
}

export function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) return toast.error('Passwords do not match');
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        const r = await register(form.name, form.email, form.password);
        if (r.success) { toast.success('Account created!'); navigate('/dashboard'); } else toast.error(r.error);
    };
    return (
        <div className="glass-strong rounded-2xl p-8 border border-[#1e1e2e]">
            <div className="text-center mb-8">
                <h1 className="font-display font-bold text-3xl text-[#f1f5f9] mb-2">Create Account</h1>
                <p className="font-body text-[#94a3b8] text-sm">Start your AI interview preparation journey</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {[{ k: 'name', l: 'Full Name', t: 'text', p: 'John Doe' }, { k: 'email', l: 'Email', t: 'email', p: 'you@example.com' }, { k: 'password', l: 'Password', t: 'password', p: '••••••••' }, { k: 'confirm', l: 'Confirm Password', t: 'password', p: '••••••••' }].map(f => (
                    <div key={f.k}><label className="block text-xs font-display font-medium text-[#94a3b8] mb-2 tracking-wider uppercase">{f.l}</label>
                        <input type={f.t} className="input-field" placeholder={f.p} value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} required /></div>
                ))}
                <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                    {isLoading ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />Creating</> : 'Create Account →'}
                </button>
            </form>
            <div className="mt-6 pt-6 border-t border-[#1e1e2e] text-center">
                <p className="font-body text-[#94a3b8] text-sm">Already have an account? <Link to="/login" className="text-[#6366f1] hover:text-[#818cf8] transition-colors font-medium">Sign in</Link></p>
            </div>
        </div>
    );
}

export default Login;
