import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async (p = 1) => {
        setLoading(true);
        try { const { data } = await api.get(`/admin/users?page=${p}&limit=15`); setUsers(data.users || []); setTotal(data.total || 0); } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(page); }, [page]);

    const handleToggle = async (userId) => {
        try { const { data } = await api.patch(`/admin/users/${userId}/toggle`); setUsers(us => us.map(u => u._id === userId ? { ...u, isActive: data.user.isActive } : u)); toast.success(data.user.isActive ? 'User activated' : 'User deactivated'); }
        catch { toast.error('Action failed'); }
    };

    const filtered = search ? users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) : users;
    const totalPages = Math.ceil(total / 15);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8"><div><h1 className="font-display font-bold text-3xl text-[#f1f5f9] mb-2">User Management</h1><p className="font-body text-[#94a3b8] text-sm">{total} registered users</p></div></div>
            <div className="mb-6"><input type="text" className="input-field max-w-sm" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} /></div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full" /></div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm font-body">
                            <thead><tr className="border-b border-[#1e1e2e]">{['User', 'Email', 'Role', 'Interviews', 'Joined', 'Status', 'Actions'].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-display font-medium text-[#475569] tracking-wider uppercase">{h}</th>)}</tr></thead>
                            <tbody>
                                {filtered.length === 0
                                    ? <tr><td colSpan={7} className="text-center py-8 text-[#475569]">No users found</td></tr>
                                    : filtered.map((user, i) => (
                                        <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-[#1e1e2e]/50 hover:bg-[#0d0d14]/50 transition-colors">
                                            <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1] text-sm font-display font-bold flex-shrink-0">{user.name?.charAt(0).toUpperCase()}</div><span className="text-[#f1f5f9] font-medium">{user.name}</span></div></td>
                                            <td className="py-3 px-4 text-[#94a3b8]">{user.email}</td>
                                            <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-display capitalize ${user.role === 'admin' ? 'bg-[#6366f1]/10 text-[#6366f1]' : 'bg-[#0d0d14] border border-[#1e1e2e] text-[#475569]'}`}>{user.role}</span></td>
                                            <td className="py-3 px-4 text-[#94a3b8] font-mono">{user.stats?.totalInterviews || 0}</td>
                                            <td className="py-3 px-4 text-[#475569] text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-display ${user.isActive ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#f43f5e]/10 text-[#f43f5e]'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                                            <td className="py-3 px-4"><button onClick={() => handleToggle(user._id)} className={`text-xs px-3 py-1 rounded-lg border font-display transition-all ${user.isActive ? 'border-[#f43f5e]/30 text-[#f43f5e] hover:bg-[#f43f5e]/10' : 'border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/10'}`}>{user.isActive ? 'Deactivate' : 'Activate'}</button></td>
                                        </motion.tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm py-2 px-4 disabled:opacity-40">← Prev</button>
                    <span className="font-mono text-[#94a3b8] text-sm">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="btn-ghost text-sm py-2 px-4 disabled:opacity-40">Next →</button>
                </div>
            )}
        </div>
    );
}
