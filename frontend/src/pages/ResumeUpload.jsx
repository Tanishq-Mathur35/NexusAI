import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../api/axios.js';

export default function ResumeUpload() {
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const fetchResumes = async () => {
    try { const { data } = await api.get('/resume'); setResumes(data.resumes || []); } catch {}
  };

  useEffect(() => { fetchResumes(); }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      return toast.error('Only PDF or DOCX files accepted');
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('resume', file);
      const { data } = await api.post('/resume/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded and analyzed!');
      setResumes(p => [data.resume, ...p]);
      setSelected(data.resume);
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed'); }
    setUploading(false);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/resume/${id}`);
      toast.success('Deleted');
      setResumes(p => p.filter(r => r._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-[#f1f5f9] mb-2">Resume Manager</h1>
        <p className="font-body text-[#94a3b8] text-sm">Upload and analyze your resume with AI-powered parsing.</p>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 mb-8 ${dragging ? 'border-[#6366f1] bg-[#6366f1]/10 scale-[1.01]' : 'border-[#1e1e2e] bg-[#0d0d14] hover:border-[#6366f1]/50 hover:bg-[#12121c]'} ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full" />
            <p className="font-display font-medium text-[#6366f1]">Uploading & analyzing with AI…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-3xl text-[#6366f1]">◧</div>
            <p className="font-display font-semibold text-[#f1f5f9] text-lg">Drop your resume here</p>
            <p className="font-body text-[#94a3b8] text-sm">or click to browse · PDF or DOCX · Max 5MB</p>
          </div>
        )}
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-10 text-[#475569] font-body text-sm">No resumes uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h2 className="font-display font-semibold text-[#f1f5f9] mb-3">Uploaded Resumes</h2>
            {resumes.map(r => (
              <motion.div key={r._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => setSelected(r)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selected?._id === r._id ? 'border-[#6366f1]/40 bg-[#6366f1]/10' : 'border-[#1e1e2e] bg-[#0d0d14] hover:bg-[#12121c]'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-medium text-sm text-[#f1f5f9] truncate">{r.fileName}</p>
                    <p className="font-body text-xs text-[#475569] mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                    {r.parsedData?.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.parsedData.skills.slice(0, 3).map((s, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-[#6366f1]/10 text-[#6366f1] text-xs font-mono">{s}</span>)}
                        {r.parsedData.skills.length > 3 && <span className="text-xs text-[#475569]">+{r.parsedData.skills.length - 3}</span>}
                      </div>
                    )}
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDelete(r._id); }} className="text-[#475569] hover:text-[#f43f5e] transition-colors text-sm flex-shrink-0">⊗</button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div key={selected._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="card">
                    <h2 className="font-display font-semibold text-[#f1f5f9] mb-4">Parsed Resume Data</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {[['Name', selected.parsedData?.name], ['Email', selected.parsedData?.email], ['Location', selected.parsedData?.location], ['Experience', selected.parsedData?.totalExperience ? `${selected.parsedData.totalExperience} yrs` : 'N/A']].map(([k, v]) => v ? (
                        <div key={k}><p className="font-body text-xs text-[#475569] mb-0.5">{k}</p><p className="font-display font-medium text-sm text-[#f1f5f9]">{v}</p></div>
                      ) : null)}
                    </div>
                    {selected.parsedData?.skills?.length > 0 && (
                      <div className="mb-4">
                        <p className="font-body text-xs text-[#475569] mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">{selected.parsedData.skills.map((s, i) => <span key={i} className="px-2 py-1 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#6366f1] text-xs font-mono">{s}</span>)}</div>
                      </div>
                    )}
                    {selected.parsedData?.experience?.length > 0 && (
                      <div>
                        <p className="font-body text-xs text-[#475569] mb-2">Experience</p>
                        <div className="space-y-2">{selected.parsedData.experience.map((ex, i) => (
                          <div key={i} className="p-3 rounded-xl bg-void border border-[#1e1e2e]">
                            <div className="flex items-center justify-between">
                              <p className="font-display font-medium text-sm text-[#f1f5f9]">{ex.role}</p>
                              <span className="font-mono text-xs text-[#475569]">{ex.duration}</span>
                            </div>
                            <p className="font-body text-xs text-[#6366f1]">{ex.company}</p>
                            {ex.description && <p className="font-body text-xs text-[#94a3b8] mt-1 leading-relaxed">{ex.description.slice(0, 140)}{ex.description.length > 140 ? '…' : ''}</p>}
                          </div>
                        ))}</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card flex flex-col items-center justify-center h-64 text-center">
                  <div className="text-5xl opacity-20 mb-3">◧</div>
                  <p className="font-body text-[#475569] text-sm">Select a resume to view details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
