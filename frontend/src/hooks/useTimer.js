import { useState, useRef, useCallback, useEffect } from 'react';
export function useTimer({ autoStart = false } = {}) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (running) intervalRef.current = setInterval(() => setElapsed(t => t + 1), 1000);
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running]);
  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => { setRunning(false); setElapsed(0); }, []);
  const restart = useCallback(() => { setElapsed(0); setRunning(true); }, []);
  const format = useCallback((s = elapsed) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`, [elapsed]);
  return { elapsed, running, start, pause, reset, restart, format };
}
