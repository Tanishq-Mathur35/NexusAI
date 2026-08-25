import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';
import api from '../api/axios.js';

const SKILLS_LIST = ['JavaScript','TypeScript','Python','Java','Go','React','Vue','Angular','Node.js','Express','Django','FastAPI','MongoDB','PostgreSQL','MySQL','Redis','Docker','Kubernetes','AWS','Azure','GCP','Git','Linux','GraphQL','REST','Machine Learning','TensorFlow','PyTorch','Agile','Scrum','System Design','Leadership'];

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    profile: { title: user?.profile?.title || '', bio: user?.profile?.bio || '', experience: user?.profile?.experience || '', targetRole: user?.profile?.targetRole || '', linkedIn: user?.profile?.linkedIn || '', github: user?.profile?.github || '', skills: user?.profile?.skills || [] },
    settings: { theme: user?.settings?.theme || 'dark', notifications: user?.settings?.notifications ?? true, difficulty: user?.settings?.difficulty || 'medium' }
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleSaveProfile = async () => {
    setSaving(true);
    try { const { data } = await api.patch('/users/profile', profileData); updateUser(data.user); toast.success('Profile updated!'); }
    catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.new.length < 6) return toast.error('Minimum 6 characters');
    setSaving(true);
    try { await api.patch('/users/password', { currentPassword: passwords.current, newPassword: passwords.new }); toast.success('Password changed!'); setPasswords({ current: '', new: '', confirm: '' }); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to change password'); }
    setSaving(false);
  };

  const toggleSkill = (skill) => {
    const skills = profileData.profile.skills;
    setProfileData(d => ({ ...d, profile: { ...d.profile, skills: skills.includes(skill) ? skills.filter(s => s !== skill) : [...skills, skill] } }));
  };

  const TABS = [{ id: 'profile', label: 'Profile' }, { id: 'skills', label: 'Skills' }, { id: 'settings', label: 'Settings' }, { id: 'security', label: 'Security' }];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8"><h1 className="font-display font-bold text-3xl text-[#f1f5f9] mb-2">Account Settings</h1><p className="font-body text-[#94a3b8] text-sm">Manage your profile and preferences</p></div>

      <div className="flex items-center gap-2 mb-8 border-b border-[#1e1e2e] pb-4">
        {TABS.map(t => <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-xl font-display font-medium text-sm transition-all ${tab === t.id ? 'bg-[#6366f1] text-white' : 'text-[#94a3b8] hover:text-[#f1f5f9]'}`}>{t.label}</button>)}
      </div>

      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card space-y-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-[#6366f1] text-2xl font-display font-bold">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <p className="font-display font-semibold text-[#f1f5f9]">{user?.name}</p>
              <p className="font-body text-[#94a3b8] text-sm">{user?.email}</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-display capitalize mt-1 inline-block ${user?.role === 'admin' ? 'bg-[#6366f1]/10 text-[#6366f1]' : 'bg-[#0d0d14] border border-[#1e1e2e] text-[#475569]'}`}>{user?.role}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Full Name', type: 'text', val: profileData.name, onChange: e => setProfileData(d => ({ ...d, name: e.target.value })), placeholder: 'John Doe' },
              { key: 'title', label: 'Job Title', type: 'text', val: profileData.profile.title, onChange: e => setProfileData(d => ({ ...d, profile: { ...d.profile, title: e.target.value } })), placeholder: 'Senior Developer' },
              { key: 'exp', label: 'Years of Experience', type: 'number', val: profileData.profile.experience, onChange: e => setProfileData(d => ({ ...d, profile: { ...d.profile, experience: e.target.value } })), placeholder: '4' },
              { key: 'target', label: 'Target Role', type: 'text', val: profileData.profile.targetRole, onChange: e => setProfileData(d => ({ ...d, profile: { ...d.profile, targetRole: e.target.value } })), placeholder: 'Engineering Manager' },
              { key: 'li', label: 'LinkedIn URL', type: 'url', val: profileData.profile.linkedIn, onChange: e => setProfileData(d => ({ ...d, profile: { ...d.profile, linkedIn: e.target.value } })), placeholder: 'https://linkedin.com/in/…' },
              { key: 'gh', label: 'GitHub URL', type: 'url', val: profileData.profile.github, onChange: e => setProfileData(d => ({ ...d, profile: { ...d.profile, github: e.target.value } })), placeholder: 'https://github.com/…' }
            ].map(f => (
              <div key={f.key}><label className="block text-xs font-display font-medium text-[#94a3b8] mb-2 tracking-wider uppercase">{f.label}</label><input type={f.type} className="input-field" placeholder={f.placeholder} value={f.val} onChange={f.onChange} /></div>
            ))}
          </div>
          <div><label className="block text-xs font-display font-medium text-[#94a3b8] mb-2 tracking-wider uppercase">Bio</label><textarea className="input-field resize-none" rows={3} placeholder="Write a short bio…" value={profileData.profile.bio} onChange={e => setProfileData(d => ({ ...d, profile: { ...d.profile, bio: e.target.value } }))} /></div>
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Saving…' : 'Save Profile'}</button>
        </motion.div>
      )}

      {tab === 'skills' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h2 className="font-display font-semibold text-[#f1f5f9] mb-2">Your Skills</h2>
          <p className="font-body text-[#94a3b8] text-sm mb-6">Select skills to personalize your interview questions.</p>
          <div className="flex flex-wrap gap-2 mb-6">{SKILLS_LIST.map(skill => <button key={skill} onClick={() => toggleSkill(skill)} className={`px-3 py-1.5 rounded-xl border text-sm font-display transition-all ${profileData.profile.skills.includes(skill) ? 'border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1]' : 'border-[#1e1e2e] bg-[#0d0d14] text-[#94a3b8] hover:border-[#6366f1]/30'}`}>{skill}</button>)}</div>
          <p className="font-body text-xs text-[#475569] mb-4">{profileData.profile.skills.length} skills selected</p>
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Saving…' : 'Save Skills'}</button>
        </motion.div>
      )}

      {tab === 'settings' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card space-y-6">
          <div>
            <h3 className="font-display font-semibold text-[#f1f5f9] mb-4">Default Interview Difficulty</h3>
            <div className="flex items-center gap-3">{['easy', 'medium', 'hard'].map(d => <button key={d} onClick={() => setProfileData(pd => ({ ...pd, settings: { ...pd.settings, difficulty: d } }))} className={`px-4 py-2 rounded-xl border capitalize text-sm font-display transition-all ${profileData.settings.difficulty === d ? 'border-[#6366f1]/40 bg-[#6366f1]/10 text-[#6366f1]' : 'border-[#1e1e2e] text-[#94a3b8] hover:border-[#6366f1]/30'}`}>{d}</button>)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="font-display font-medium text-[#f1f5f9]">Email Notifications</p><p className="font-body text-[#475569] text-sm">Get notified about performance milestones</p></div>
            <button onClick={() => setProfileData(d => ({ ...d, settings: { ...d.settings, notifications: !d.settings.notifications } }))} className={`w-12 h-6 rounded-full relative transition-all duration-300 ${profileData.settings.notifications ? 'bg-[#6366f1]' : 'bg-[#0d0d14] border border-[#1e1e2e]'}`}><span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${profileData.settings.notifications ? 'left-7' : 'left-1'}`} /></button>
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Saving…' : 'Save Settings'}</button>
        </motion.div>
      )}

      {tab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4">
          <h2 className="font-display font-semibold text-[#f1f5f9] mb-2">Change Password</h2>
          {[{ key: 'current', label: 'Current Password' }, { key: 'new', label: 'New Password' }, { key: 'confirm', label: 'Confirm New Password' }].map(f => (
            <div key={f.key}><label className="block text-xs font-display font-medium text-[#94a3b8] mb-2 tracking-wider uppercase">{f.label}</label><input type="password" className="input-field" placeholder="••••••••" value={passwords[f.key]} onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))} /></div>
          ))}
          <button onClick={handleChangePassword} disabled={saving} className="btn-primary disabled:opacity-60">{saving ? 'Updating…' : 'Update Password'}</button>
        </motion.div>
      )}
    </div>
  );
}
