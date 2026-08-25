import { useState, useRef, useCallback, useEffect } from 'react';
export function useCamera({ videoRef } = {}) {
  const [isOn, setIsOn] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const start = useCallback(async (constraints = { video: true, audio: false }) => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef?.current) videoRef.current.srcObject = stream;
      setIsOn(true); return stream;
    } catch (err) {
      setError(err.name === 'NotAllowedError' ? 'Camera access denied.' : 'Camera unavailable.');
      return null;
    }
  }, [videoRef]);
  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
    if (videoRef?.current) videoRef.current.srcObject = null;
    setIsOn(false); setIsRecording(false);
  }, [videoRef]);
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.start(1000); recorderRef.current = recorder; setIsRecording(true);
  }, []);
  const stopRecording = useCallback(() => new Promise(resolve => {
    if (!recorderRef.current) return resolve(null);
    recorderRef.current.onstop = () => resolve(new Blob(chunksRef.current, { type: 'video/webm' }));
    recorderRef.current.stop(); setIsRecording(false);
  }), []);
  useEffect(() => () => stop(), [stop]);
  return { isOn, error, isRecording, start, stop, startRecording, stopRecording, stream: streamRef };
}
