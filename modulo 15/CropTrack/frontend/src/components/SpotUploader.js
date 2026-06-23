import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useVideoJob } from '../roles/VideoJobContext';

const S = {
  tabs: {
    display: 'flex', borderRadius: 10, overflow: 'hidden', marginBottom: 16,
    border: '1px solid #2a2e3a',
  },
  tab: (active) => ({
    flex: 1, padding: '10px 0', border: 'none', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s',
    background: active ? '#34d399' : '#181b23',
    color: active ? '#0f1117' : '#8b8fa3',
  }),
  steps: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  step: (active, done) => ({
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600,
    color: done ? '#34d399' : active ? '#e8eaed' : '#5c6070',
  }),
  stepDot: (active, done) => ({
    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: done || active ? '#0f1117' : '#8b8fa3',
    background: done ? '#34d399' : active ? '#10b981' : '#2a2e3a',
  }),
  stepLine: { flex: 1, height: 2, background: '#2a2e3a', borderRadius: 1 },
  infoRow: { display: 'flex', gap: 12, marginBottom: 12 },
  infoCard: {
    flex: 1, padding: '10px 12px', background: '#0f1117', borderRadius: 10,
    border: '1px solid #2a2e3a', fontSize: 13, minWidth: 0,
  },
  infoLabel: { fontSize: 11, color: '#8b8fa3', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 },
  infoValue: { fontSize: 13, color: '#e8eaed', fontWeight: 500 },
  select: {
    width: '100%', padding: '6px 8px', border: '1px solid #2a2e3a', borderRadius: 6,
    fontSize: 13, background: '#0f1117', color: '#e8eaed', marginTop: 4, cursor: 'pointer',
  },
  dropzone: {
    border: '2px dashed #2a2e3a', borderRadius: 12, padding: 20,
    textAlign: 'center', cursor: 'pointer', marginBottom: 12, background: '#0f1117',
    display: 'block',
  },
  fileInput: { display: 'none' },
  previewImg: { maxWidth: '100%', maxHeight: 200, borderRadius: 10, objectFit: 'contain' },
  previewVideo: { maxWidth: '100%', maxHeight: 220, borderRadius: 10, background: '#000' },
  textarea: {
    width: '100%', padding: '10px 12px', border: '1px solid #2a2e3a', borderRadius: 10,
    fontSize: 13, resize: 'vertical', fontFamily: 'inherit', minHeight: 60, boxSizing: 'border-box',
    background: '#0f1117', color: '#e8eaed',
  },
  notesLabel: {
    fontSize: 13, fontWeight: 600, color: '#8b8fa3', display: 'flex',
    alignItems: 'center', gap: 6, marginBottom: 6, marginTop: 4,
  },
  error: {
    background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10,
    padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 12,
  },
  btnPrimary: (disabled) => ({
    width: '100%', padding: '12px 0', border: 'none', borderRadius: 10,
    background: disabled ? '#2a2e3a' : '#10b981', color: disabled ? '#5c6070' : '#0f1117',
    fontSize: 15, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 12,
  }),
  btnSecondary: {
    width: '100%', padding: '10px 0', border: '1px solid #2a2e3a', borderRadius: 10,
    background: 'transparent', color: '#8b8fa3', fontSize: 14, fontWeight: 500,
    cursor: 'pointer', marginTop: 8,
  },
  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 20 },
  spinner: {
    width: 32, height: 32, border: '3px solid #2a2e3a', borderTop: '3px solid #10b981',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  resultCenter: { textAlign: 'center', marginBottom: 16 },
  resultImg: { maxWidth: '100%', borderRadius: 12, marginBottom: 16 },
  statusCard: (bg, border) => ({
    background: bg, border: `2px solid ${border}`, borderRadius: 12,
    padding: 16, textAlign: 'center', marginBottom: 16,
  }),
  statusLabel: (color) => ({ fontSize: 20, fontWeight: 700, color, textTransform: 'capitalize' }),
  confBar: { height: 8, background: '#2a2e3a', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  confFill: (w, color) => ({ height: '100%', width: `${w}%`, background: color, borderRadius: 4 }),
  detRow: {
    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
    borderBottom: '1px solid #2a2e3a', fontSize: 14, color: '#e8eaed',
  },
  metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#8b8fa3', marginTop: 4 },
};

function SpotUploader({ fieldId, latitude, longitude, onUploadComplete, onCancel, initialMode = 'image' }) {
  const [mode, setMode] = useState(initialMode); // 'image' or 'video'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadStep, setUploadStep] = useState(1);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const videoRef = useRef(null);

  // Video analysis runs as a background job (VideoJobContext) so the user can
  // close this window and be notified when it's ready.
  const { job, startJob } = useVideoJob();
  const [myJobId, setMyJobId] = useState(null);
  const myJob = job && job.id === myJobId ? job : null;
  const videoProcessing = myJob?.status === 'processing';
  const videoResultUrl = myJob?.status === 'done' ? myJob.resultUrl : null;
  const videoStats = myJob?.status === 'done' ? myJob.stats : null;
  const videoError = myJob?.status === 'error' ? (myJob.error || 'Falha ao processar o vídeo.') : null;

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get('/api/models');
        const models = response.data.models.filter(m => m.available);
        setAvailableModels(models);
        const saved = localStorage.getItem('croptrack_selected_model');
        if (saved && models.some(m => m.name === saved)) {
          setSelectedModel(saved);
        } else if (models.length > 0) {
          setSelectedModel(models[0].name);
        }
      } catch (err) {
        console.error('Error fetching models:', err);
      }
    };
    fetchModels();
  }, []);

  const handleModelChange = (e) => {
    const val = e.target.value;
    setSelectedModel(val);
    localStorage.setItem('croptrack_selected_model', val);
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setAnalysisResult(null);
    setMyJobId(null);

    if (f.type.startsWith('image/')) {
      setMode('image');
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(f);
    } else if (f.type.startsWith('video/')) {
      setMode('video');
      setPreview(URL.createObjectURL(f));
    } else {
      setError('Unsupported file type. Use JPG, PNG, WEBP, MP4, or MOV.');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) { setError('Please select a file'); return; }
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    setMyJobId(null);
    setUploadStep(2);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadStep(3);

      if (mode === 'image') {
        // Image: create spot via field API
        const formData = new FormData();
        formData.append('image', file);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        formData.append('notes', notes);
        formData.append('device', navigator.userAgent);
        if (selectedModel) formData.append('model', selectedModel);

        const response = await axios.post(`/api/fields/${fieldId}/spots`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        });
        setUploadStep(4);
        setAnalysisResult(response.data);
      } else {
        // Video: kick off a background job. The user can close this window —
        // the job keeps running and a toast pops when it's ready.
        const jobId = await startJob(file, {
          detector: selectedModel || 'coffee_yolo_v1',
          confidence: 0.15,
          skipFrames: 3,
        });
        setMyJobId(jobId);
        setUploadStep(4);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || err.message || 'Error processing file. Try again.');
      setUploadStep(1);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (l) => ({
    healthy: '#059669', mildly_stressed: '#d97706', diseased: '#dc2626',
    pest_damage: '#dc2626', nutrient_deficiency: '#7c3aed', detected: '#0891b2',
  }[l] || '#64748b');

  const getHealthBg = (l) => ({
    healthy: 'rgba(52,211,153,0.08)', mildly_stressed: 'rgba(251,191,36,0.08)', diseased: 'rgba(248,113,113,0.08)',
    pest_damage: 'rgba(248,113,113,0.08)', nutrient_deficiency: 'rgba(167,139,250,0.08)', detected: 'rgba(6,182,212,0.08)',
  }[l] || 'rgba(100,116,139,0.08)');

  const PT_LABELS = {
    healthy: 'Saudável', diseased: 'Doente', pest_damage: 'Dano por praga',
    mildly_stressed: 'Levemente estressada', nutrient_deficiency: 'Deficiência nutricional',
    detected: 'Detectado', unknown: 'Indefinido',
    leaf_rust: 'Ferrugem', brown_eye_spot: 'Cercosporiose',
    leaf_miner: 'Bicho-mineiro', red_spider_mite: 'Ácaro-vermelho',
  };
  const fmt = (l) => PT_LABELS[l] || l.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // --- VIDEO PROCESSING VIEW ---
  if (videoProcessing) {
    return (
      <div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={S.resultCenter}>
          <div style={{ ...S.spinner, margin: '0 auto' }} />
          <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 12, color: '#e8eaed' }}>
            Vídeo em análise{myJob?.progress ? ` · ${myJob.progress}%` : ''}
          </h3>
          <p style={{ fontSize: 14, color: '#8b8fa3', marginTop: 8, lineHeight: 1.5 }}>
            Pode fechar esta janela — em instantes seu vídeo estará pronto e avisaremos quando terminar.
          </p>
        </div>
        <button style={S.btnPrimary(false)} onClick={onCancel}>Fechar</button>
      </div>
    );
  }

  // --- VIDEO RESULT VIEW ---
  if (videoResultUrl) {
    return (
      <div>
        <div style={S.resultCenter}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 8, color: '#e8eaed' }}>Análise de vídeo concluída</h3>
        </div>
        <video
          src={videoResultUrl}
          controls
          autoPlay
          style={{ width: '100%', borderRadius: 12, marginBottom: 16, background: '#000' }}
        />

        {/* Detection stats */}
        {videoStats && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, background: 'rgba(52,211,153,0.08)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#34d399' }}>{videoStats.totalDetections}</div>
                <div style={{ fontSize: 11, color: '#8b8fa3', fontWeight: 600 }}>Total Detections</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(96,165,250,0.08)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#60a5fa' }}>{videoStats.framesAnalyzed}</div>
                <div style={{ fontSize: 11, color: '#8b8fa3', fontWeight: 600 }}>Frames Analyzed</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(167,139,250,0.08)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#a78bfa' }}>{Object.keys(videoStats.classes).length}</div>
                <div style={{ fontSize: 11, color: '#8b8fa3', fontWeight: 600 }}>Classes Found</div>
              </div>
            </div>
            {Object.keys(videoStats.classes).length > 0 && (
              <div>
                {Object.entries(videoStats.classes).sort((a, b) => b[1] - a[1]).map(([cls, count]) => (
                  <div key={cls} style={S.detRow}>
                    <span style={{ color: '#e8eaed' }}>{cls.replace(/_/g, ' ')}</span>
                    <span style={{ fontWeight: 600, color: '#8b8fa3' }}>{count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <a
          href={videoResultUrl}
          download="analyzed_video.mp4"
          style={{ ...S.btnPrimary(false), textDecoration: 'none', background: '#232733', color: '#e8eaed' }}
        >
          Download Video
        </a>
        <button style={S.btnPrimary(false)} onClick={async () => {
          // Save video analysis to database so it appears in the dashboard
          try {
            await axios.post(`/api/fields/${fieldId}/video-analysis`, {
              latitude,
              longitude,
              notes,
              classes: videoStats?.classes || {},
              totalDetections: videoStats?.totalDetections || 0,
              model: selectedModel,
            });
          } catch (err) {
            console.error('Error saving video analysis:', err);
          }
          // Hand the analyzed video up so the gestor can review it.
          onUploadComplete({ videoUrl: videoResultUrl, videoStats });
        }}>
          Concluído
        </button>
      </div>
    );
  }

  // --- IMAGE RESULT VIEW ---
  if (analysisResult) {
    const analysis = analysisResult.analysis;
    const healthLabel = analysisResult.health_assessment?.label || analysis?.health_label || 'unknown';
    const confidence = analysisResult.health_assessment?.confidence ?? analysis?.confidence ?? 0;
    const detections = analysisResult.detections || [];
    const annotatedImage = analysisResult.annotated_image;
    const hColor = getHealthColor(healthLabel);

    return (
      <div>
        <div style={S.resultCenter}>
          {healthLabel === 'healthy' ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 8, color: '#e8eaed' }}>Análise concluída</h3>
        </div>

        {annotatedImage && <img src={annotatedImage} alt="Annotated" style={S.resultImg} />}

        <div style={S.statusCard(getHealthBg(healthLabel), hColor)}>
          <div style={S.statusLabel(hColor)}>{fmt(healthLabel)}</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>Confiança</div>
          <div style={S.confBar}><div style={S.confFill(confidence * 100, hColor)} /></div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{(confidence * 100).toFixed(1)}%</div>
        </div>

        {detections.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#e8eaed' }}>
              {detections.length} detecç{detections.length > 1 ? 'ões' : 'ão'}
            </div>
            {detections.map((det, i) => (
              <div key={i} style={S.detRow}>
                <span>{fmt(det.class)}</span>
                <span style={{ fontWeight: 600 }}>{(det.confidence * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}

        <div style={S.metaRow}>
          <span>AI Engine: CropTrack Vision</span>
          <span>Loc: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
        </div>

        <button style={S.btnPrimary(false)} onClick={() => onUploadComplete(analysisResult)}>
          Concluído
        </button>
      </div>
    );
  }

  // --- UPLOAD VIEW ---
  return (
    <div>
      {/* Image / Video tabs */}
      <div style={S.tabs}>
        <button style={S.tab(mode === 'image')} onClick={() => { setMode('image'); setFile(null); setPreview(null); setError(null); }}>
          Imagem
        </button>
        <button style={S.tab(mode === 'video')} onClick={() => { setMode('video'); setFile(null); setPreview(null); setError(null); }}>
          Vídeo
        </button>
      </div>

      {/* Steps */}
      <div style={S.steps}>
        {[['Selecionar', 1], ['Enviar', 2], ['Analisar', 3]].map(([label, n], i) => (
          <React.Fragment key={n}>
            {i > 0 && <div style={S.stepLine} />}
            <div style={S.step(uploadStep >= n, uploadStep > n)}>
              <div style={S.stepDot(uploadStep >= n, uploadStep > n)}>{n}</div>
              <span>{label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Location + Model */}
      <div style={S.infoRow}>
        <div style={S.infoCard}>
          <div style={S.infoLabel}>Local</div>
          <div style={S.infoValue}>{latitude.toFixed(4)}, {longitude.toFixed(4)}</div>
        </div>
        <div style={S.infoCard}>
          <div style={S.infoLabel}>Modelo</div>
          <select style={S.select} value={selectedModel} onChange={handleModelChange} disabled={loading}>
            {availableModels.length === 0 ? (
              <option value="">Carregando...</option>
            ) : (
              availableModels.map(m => (
                <option key={m.name} value={m.name}>{m.label || m.name}</option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Dropzone */}
      <label style={S.dropzone}>
        <input
          type="file"
          accept={mode === 'image' ? 'image/*' : 'video/*'}
          onChange={handleFileSelect}
          disabled={loading}
          style={S.fileInput}
        />
        {preview && mode === 'image' ? (
          <img src={preview} alt="Preview" style={S.previewImg} />
        ) : preview && mode === 'video' ? (
          <video src={preview} ref={videoRef} style={S.previewVideo} controls muted />
        ) : (
          <div>
            <div style={{ color: '#5c6070', marginBottom: 8 }}>
              {mode === 'image' ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              ) : (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                  <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
                  <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/>
                  <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
                  <line x1="17" y1="17" x2="22" y2="17"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#e8eaed', display: 'block' }}>
              Enviar {mode === 'image' ? 'foto da folha' : 'vídeo do talhão'}
            </span>
            <span style={{ fontSize: 13, color: '#8b8fa3', display: 'block', marginTop: 4 }}>
              Toque para escolher ou arraste aqui
            </span>
            <span style={{ fontSize: 11, color: '#5c6070', display: 'block', marginTop: 4 }}>
              {mode === 'image' ? 'JPG, PNG ou WEBP até 10MB' : 'MP4 ou MOV até 50MB'}
            </span>
          </div>
        )}
      </label>

      {/* Notes */}
      <div style={{ marginBottom: 8 }}>
        <div style={S.notesLabel}>Observações de campo (opcional)</div>
        <textarea
          style={S.textarea}
          placeholder="Descreva sintomas visíveis, condições do tempo..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
          rows={2}
        />
      </div>

      {(error || videoError) && <div style={S.error}>{error || videoError}</div>}

      {loading && (
        <div style={S.loading}>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <div style={S.spinner} />
          <span style={{ fontSize: 14, color: '#8b8fa3' }}>
            {uploadStep === 2 ? 'Enviando...' : 'Analisando...'}
          </span>
        </div>
      )}

      <button style={S.btnPrimary(!file || loading)} onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Processando...' : `Analisar ${mode === 'image' ? 'imagem' : 'vídeo'}`}
      </button>
      <button style={S.btnSecondary} onClick={onCancel} disabled={loading}>Cancelar</button>
    </div>
  );
}

export default SpotUploader;
