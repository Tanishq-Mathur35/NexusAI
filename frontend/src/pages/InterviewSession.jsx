import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import useInterviewStore from '../store/interviewStore.js';
import api from '../api/axios.js';

const EC = { neutral:'#94a3b8', confident:'#10b981', nervous:'#f59e0b', happy:'#6366f1', confused:'#f43f5e' };
const EE = { neutral:'😐', confident:'😊', nervous:'😰', happy:'😁', confused:'🤔' };
const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { submitAnswer, completeInterview, isLoading } = useInterviewStore();
  const [interview, setInterview] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [emotionTimeline, setEmotionTimeline] = useState([]);
  const [fullTranscript, setFullTranscript] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const videoRef = useRef(null); const streamRef = useRef(null); const recRef = useRef(null);
  const qTimerRef = useRef(null); const totalTimerRef = useRef(null); const emoRef = useRef(null);

  useEffect(() => {
    api.get(`/interviews/${id}`).then(({data}) => setInterview(data.interview)).catch(() => { toast.error('Not found'); navigate('/dashboard'); });
  }, [id]);

  useEffect(() => { totalTimerRef.current = setInterval(()=>setTotalTime(t=>t+1),1000); return ()=>clearInterval(totalTimerRef.current); }, []);
  useEffect(() => { setTimeSpent(0); clearInterval(qTimerRef.current); if(interview) qTimerRef.current=setInterval(()=>setTimeSpent(t=>t+1),1000); return ()=>clearInterval(qTimerRef.current); }, [currentQ, interview]);

  const simulateEmotion = useCallback(() => {
    const es = ['neutral','confident','nervous','happy','confused'];
    const ws = [0.35,0.28,0.20,0.12,0.05];
    const r = Math.random(); let cum=0, e='neutral';
    for(let i=0;i<ws.length;i++){cum+=ws[i];if(r<cum){e=es[i];break;}}
    setCurrentEmotion(e);
    setEmotionTimeline(prev=>[...prev,{timestamp:Date.now(),emotion:e,confidence:Math.round(55+Math.random()*40)}]);
  }, []);

  useEffect(() => { if(isCameraOn) emoRef.current=setInterval(simulateEmotion,3000); else clearInterval(emoRef.current); return ()=>clearInterval(emoRef.current); }, [isCameraOn, simulateEmotion]);

  const startCamera = async () => {
    try { const s=await navigator.mediaDevices.getUserMedia({video:true,audio:false}); streamRef.current=s; if(videoRef.current) videoRef.current.srcObject=s; setIsCameraOn(true); setCameraError(false); }
    catch { setCameraError(true); toast.error('Camera access denied'); }
  };
  const stopCamera = () => { streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null; setIsCameraOn(false); };

  const startListening = () => {
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return toast.error('Speech recognition not supported');
    const r=new SR(); r.continuous=true; r.interimResults=true; r.lang='en-US';
    r.onresult=(e)=>{ let f=''; for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal){f+=e.results[i][0].transcript+' ';}} if(f){setAnswer(p=>p+f);setFullTranscript(p=>p+f);} };
    r.onerror=()=>setIsListening(false); r.onend=()=>setIsListening(false);
    r.start(); recRef.current=r; setIsListening(true);
  };
  const stopListening = () => { recRef.current?.stop(); setIsListening(false); };

  const handleSubmit = async () => {
    if(!answer.trim()) return toast.error('Please provide an answer');
    const q=interview.questions[currentQ];
    const r=await submitAnswer(q.id,answer,timeSpent);
    if(r.success){setEvaluation(r.evaluation);setShowFeedback(true);} else toast.error(r.error||'Failed to submit');
  };

  const handleNext = () => {
    setShowFeedback(false); setEvaluation(null); setAnswer('');
    if(currentQ+1>=interview.questions.length) handleComplete();
    else setCurrentQ(q=>q+1);
  };

  const handleComplete = async () => {
    setIsCompleting(true); stopCamera(); stopListening(); clearInterval(totalTimerRef.current);
    const r=await completeInterview(emotionTimeline,fullTranscript);
    if(r.success){toast.success('Interview completed!');navigate(`/interview/report/${id}`);}
    else{toast.error(r.error||'Failed');setIsCompleting(false);}
  };

  if(!interview) return <div className="min-h-screen bg-void flex items-center justify-center"><motion.div animate={{rotate:360}} transition={{duration:2,repeat:Infinity,ease:'linear'}} className="w-12 h-12 border-2 border-[#6366f1]/30 border-t-[#6366f1] rounded-full" /></div>;
  const q=interview.questions[currentQ];
  const progress=(currentQ/interview.questions.length)*100;

  return (
    <div className="min-h-screen bg-void p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f43f5e]/10 border border-[#f43f5e]/30">
              <span className="w-2 h-2 rounded-full bg-[#f43f5e] animate-pulse" /><span className="font-mono text-xs text-[#f43f5e]">LIVE</span>
            </div>
            <span className="font-display font-semibold text-[#f1f5f9] capitalize">{interview.domain} Interview</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[#94a3b8] text-sm">{fmt(totalTime)}</span>
            <span className="font-display text-sm text-[#94a3b8]">Q {currentQ+1}/{interview.questions.length}</span>
            <button onClick={handleComplete} disabled={isCompleting} className="px-4 py-2 rounded-xl border border-[#f43f5e]/40 text-[#f43f5e] hover:bg-[#f43f5e]/10 text-sm font-display transition-all disabled:opacity-50">{isCompleting?'Finishing…':'End Interview'}</button>
          </div>
        </div>

        <div className="h-1 bg-[#0d0d14] rounded-full mb-6 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-[#6366f1] to-[#06b6d4] rounded-full" initial={{width:'0%'}} animate={{width:`${progress}%`}} transition={{duration:0.5}} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div key={currentQ} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="card-glow">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#6366f1] flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0">{currentQ+1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#6366f1] text-xs font-display capitalize">{q.type}</span>
                    <span className="font-mono text-[#475569] text-xs">{fmt(timeSpent)}</span>
                  </div>
                  <p className="font-body text-[#f1f5f9] text-lg leading-relaxed">{q.question}</p>
                </div>
              </div>
              <AnimatePresence mode="wait">
                {!showFeedback ? (
                  <motion.div key="ans" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <div className="relative">
                      <textarea value={answer} onChange={e=>setAnswer(e.target.value)} rows={6} placeholder="Type your answer or use the microphone…" className="input-field resize-none pr-12 font-body text-sm" />
                      {isListening && <div className="absolute top-3 right-3 flex items-center gap-0.5">{[1,2,3].map(i=><motion.div key={i} animate={{scaleY:[0.4,1,0.4]}} transition={{duration:0.6,repeat:Infinity,delay:i*0.15}} className="w-1 bg-[#f43f5e] rounded-full" style={{height:16}} />)}</div>}
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <button onClick={isListening?stopListening:startListening} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-display transition-all ${isListening?'border-[#f43f5e]/40 bg-[#f43f5e]/10 text-[#f43f5e]':'border-[#1e1e2e] bg-[#0d0d14] text-[#94a3b8] hover:border-[#6366f1]/40 hover:text-[#f1f5f9]'}`}>{isListening?<><span>⏹</span>Stop</>:<><span>🎙</span>Speak</>}</button>
                      <button onClick={()=>setAnswer('')} className="px-4 py-2.5 rounded-xl border border-[#1e1e2e] bg-[#0d0d14] text-[#94a3b8] hover:text-[#f1f5f9] text-sm font-display transition-all">Clear</button>
                      <button onClick={handleSubmit} disabled={isLoading||!answer.trim()} className="btn-primary ml-auto flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm">{isLoading?'Evaluating…':'Submit Answer →'}</button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="fb" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0d0d14] border border-[#1e1e2e]">
                      <div className="flex-shrink-0 text-center">
                        <div className={`font-display font-bold text-3xl ${evaluation?.score>=70?'text-[#10b981]':evaluation?.score>=50?'text-[#f59e0b]':'text-[#f43f5e]'}`}>{evaluation?.score||0}</div>
                        <div className="font-body text-xs text-[#475569]">/ 100</div>
                      </div>
                      <p className="font-body text-[#94a3b8] text-sm leading-relaxed flex-1">{evaluation?.feedback}</p>
                    </div>
                    {evaluation?.followUp && <div className="p-3 rounded-xl bg-[#6366f1]/5 border border-[#6366f1]/20"><p className="font-display text-xs text-[#6366f1] font-medium mb-1">Follow-up:</p><p className="font-body text-[#94a3b8] text-sm">{evaluation.followUp}</p></div>}
                    <button onClick={handleNext} className="btn-primary w-full flex items-center justify-center gap-2">{currentQ+1>=interview.questions.length?'Finish Interview ✓':'Next Question →'}</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-sm text-[#f1f5f9]">Camera Feed</h3>
                <button onClick={isCameraOn?stopCamera:startCamera} className={`text-xs px-3 py-1 rounded-full font-display font-medium transition-all ${isCameraOn?'bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e]':'bg-[#6366f1]/10 border border-[#6366f1]/30 text-[#6366f1]'}`}>{isCameraOn?'Stop':'Start'}</button>
              </div>
              <div className="aspect-video rounded-xl bg-[#0d0d14] border border-[#1e1e2e] overflow-hidden relative">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {!isCameraOn && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"><div className="text-4xl opacity-20">📷</div><p className="font-body text-[#475569] text-xs">{cameraError?'Access denied':'Camera off'}</p></div>}
                {isCameraOn && <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full glass text-xs font-mono"><span style={{color:EC[currentEmotion]}}>{EE[currentEmotion]}</span><span className="text-[#94a3b8] capitalize">{currentEmotion}</span></div>}
              </div>
            </div>

            <div className="card">
              <h3 className="font-display font-semibold text-sm text-[#f1f5f9] mb-3">Questions</h3>
              <div className="space-y-1.5">
                {interview.questions.map((_, i) => (
                  <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${i===currentQ?'bg-[#6366f1]/10 border border-[#6366f1]/20':i<currentQ?'opacity-50':'opacity-40'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-display font-bold flex-shrink-0 ${i<currentQ?'bg-[#10b981] text-white':i===currentQ?'bg-[#6366f1] text-white':'bg-[#1e1e2e] text-[#475569]'}`}>{i<currentQ?'✓':i+1}</span>
                    <span className="text-[#94a3b8] capitalize">{interview.questions[i].type}</span>
                  </div>
                ))}
              </div>
            </div>

            {emotionTimeline.length > 0 && (
              <div className="card">
                <h3 className="font-display font-semibold text-sm text-[#f1f5f9] mb-3">Emotion Log</h3>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {emotionTimeline.slice(-6).reverse().map((e,i)=>(
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span style={{color:EC[e.emotion]}}>{EE[e.emotion]}</span>
                      <span className="text-[#94a3b8] capitalize flex-1">{e.emotion}</span>
                      <span className="font-mono text-[#475569]">{Math.round(e.confidence)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
