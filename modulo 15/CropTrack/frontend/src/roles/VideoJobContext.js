import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

// Background video-analysis job. Lives above the Router so the job keeps
// running (and polling) while the user navigates away from the scan screen.
// When it finishes we surface a toast (and a browser notification if allowed).

const Ctx = createContext(null);

const POLL_MS = 2000;

export function VideoJobProvider({ children }) {
  // job: { id, filename, status: 'processing'|'done'|'error',
  //        progress, resultUrl, stats, error }  — or null when idle.
  const [job, setJob] = useState(null);
  // Set when a job just finished so a global toast can pop; cleared on dismiss.
  const [notice, setNotice] = useState(null); // { type: 'done'|'error', filename, stats, error }
  // History of finished videos, newest first — shown on the gestor dashboard.
  const [analyzedVideos, setAnalyzedVideos] = useState([]); // [{ id, filename, url, stats }]
  const pollRef = useRef(null);
  const resultUrlRef = useRef(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const revokeResult = () => {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  };

  // Fetch the finished video and expose it as an object URL.
  const fetchResult = useCallback(async (jobId, filename) => {
    try {
      const res = await axios.get(`/api/analyze-video/result/${jobId}`, {
        responseType: 'blob',
        timeout: 600000,
      });
      let classes = {};
      try { classes = JSON.parse(res.headers['x-classes'] || '{}'); } catch (_) { classes = {}; }
      const stats = {
        totalDetections: Number(res.headers['x-total-detections'] || 0),
        framesAnalyzed: Number(res.headers['x-frames-analyzed'] || 0),
        totalFrames: Number(res.headers['x-total-frames'] || 0),
        classes,
      };
      // Don't revoke the previous result URL: it may have been handed off to a
      // collected spot for the gestor to review. Let it outlive this job.
      const url = URL.createObjectURL(new Blob([res.data], { type: 'video/mp4' }));
      resultUrlRef.current = url;
      setJob((j) => (j && j.id === jobId
        ? { ...j, status: 'done', progress: 100, resultUrl: url, stats }
        : j));
      setAnalyzedVideos((list) => [{ id: jobId, filename, url, stats }, ...list]);
      setNotice({ type: 'done', filename, stats });
      pushBrowserNotification('Análise concluída', `O vídeo "${filename}" terminou de ser analisado.`);
    } catch (err) {
      setJob((j) => (j && j.id === jobId ? { ...j, status: 'error', error: 'Falha ao baixar o vídeo analisado.' } : j));
      setNotice({ type: 'error', filename, error: 'Falha ao baixar o vídeo analisado.' });
    }
  }, []);

  // Poll the job status until it leaves the 'processing' state.
  useEffect(() => {
    if (!job || job.status !== 'processing') {
      stopPolling();
      return;
    }
    const jobId = job.id;
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/analyze-video/status/${jobId}`);
        if (data.status === 'processing') {
          setJob((j) => (j && j.id === jobId ? { ...j, progress: data.progress || 0 } : j));
        } else if (data.status === 'done') {
          stopPolling();
          fetchResult(jobId, data.filename);
        } else if (data.status === 'error') {
          stopPolling();
          setJob((j) => (j && j.id === jobId ? { ...j, status: 'error', error: data.error } : j));
          setNotice({ type: 'error', filename: data.filename, error: data.error || 'Falha no processamento.' });
        }
      } catch (err) {
        // Transient network/poll error — keep trying on the next tick.
      }
    }, POLL_MS);
    return stopPolling;
  }, [job, fetchResult]);

  // Clean up timers / object URLs on unmount.
  useEffect(() => () => { stopPolling(); revokeResult(); }, []);

  // Kick off a new analysis. Returns the job_id (or throws).
  const startJob = useCallback(async (file, { detector, confidence, skipFrames = 5 }) => {
    // Keep any prior result URL alive — it may be in use by a collected spot.
    requestNotificationPermission();

    const formData = new FormData();
    formData.append('video', file);
    formData.append('detector', detector);
    formData.append('confidence_threshold', confidence);
    formData.append('skip_frames', skipFrames);

    const { data } = await axios.post('/api/analyze-video', formData);
    setNotice(null);
    setJob({
      id: data.job_id,
      filename: file.name,
      status: 'processing',
      progress: 0,
      resultUrl: null,
      stats: null,
      error: null,
    });
    return data.job_id;
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    revokeResult();
    setJob(null);
    setNotice(null);
  }, []);

  const dismissNotice = useCallback(() => setNotice(null), []);

  return (
    <Ctx.Provider value={{ job, notice, analyzedVideos, startJob, reset, dismissNotice }}>
      {children}
    </Ctx.Provider>
  );
}

export function useVideoJob() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useVideoJob must be used within VideoJobProvider');
  return ctx;
}

/* -- Browser notifications (best-effort; in-app toast is the real fallback) -- */

function requestNotificationPermission() {
  try {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  } catch (_) { /* unsupported */ }
}

function pushBrowserNotification(title, body) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch (_) { /* unsupported */ }
}
