import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useVideoJob } from '../roles/VideoJobContext';
import '../App.css';

function VideoAnalyzer() {
  // Video job lives in VideoJobContext so it survives navigation; read it first
  // so we can land back on the Vídeo tab when a job is in flight or finished.
  const { job, startJob, reset: resetJob } = useVideoJob();

  const [selectedDetector, setSelectedDetector] = useState('coffee_yolo_v1');
  const [availableModels, setAvailableModels] = useState([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);
  const [mode, setMode] = useState(job ? 'video' : 'image'); // 'image' or 'video'

  // Image mode state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [annotatedImage, setAnnotatedImage] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [summary, setSummary] = useState(null);

  // Only the not-yet-submitted file preview is local here.
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const videoProcessing = job?.status === 'processing';
  const analyzedVideoUrl = job?.status === 'done' ? job.resultUrl : null;
  const videoError = job?.status === 'error' ? (job.error || 'Falha ao analisar o vídeo.') : null;

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/models');
      const available = response.data.models.filter(m => m.available);
      setAvailableModels(available);
      if (available.length > 0 && !available.find(m => m.name === selectedDetector)) {
        setSelectedDetector(available[0].name);
      }
    } catch (err) {
      setError('Failed to fetch models');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setAnnotatedImage(null);
      setBoxes([]);
      setSummary(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      resetJob();
      setSelectedVideo(file);
      setError(null);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);
    setProgress('Analisando a imagem...');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('detector', selectedDetector);
      formData.append('confidence_threshold', confidenceThreshold);

      const response = await axios.post('/api/analyze-frame', formData);
      setAnnotatedImage(response.data.annotated_image);
      setBoxes(response.data.detections || []);
      setSummary(response.data.summary);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze image');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const analyzeVideo = async () => {
    if (!selectedVideo) return;
    setError(null);
    try {
      // Fire-and-forget: the job runs in the background (VideoJobContext) and
      // the user is free to navigate away — a toast pops when it finishes.
      await startJob(selectedVideo, {
        detector: selectedDetector,
        confidence: confidenceThreshold,
        skipFrames: 5,
      });
    } catch (err) {
      setError('Não foi possível iniciar a análise do vídeo.');
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnnotatedImage(null);
    setBoxes([]);
    setSummary(null);
    setSelectedVideo(null);
    setVideoPreview(null);
    resetJob();
    setError(null);
  };

  const getClassColor = (cls) => {
    const colors = {
      'healthy': '#22c55e',
      'brown_eye_spot': '#f97316',
      'leaf_rust': '#ef4444',
      'leaf_miner': '#a855f7',
      'red_spider_mite': '#dc2626',
      'Corn Gray leaf spot': '#fb923c',
      'Corn leaf blight': '#f87171',
      'Corn rust leaf': '#ef4444',
      'Tomato Early blight leaf': '#dc2626',
      'Tomato Septoria leaf spot': '#c084fc',
      'Tomato leaf bacterial spot': '#a855f7',
      'Tomato leaf late blight': '#b91c1c',
      'Tomato leaf mosaic virus': '#06b6d4',
      'Tomato leaf yellow virus': '#eab308',
      'Tomato mold leaf': '#22c55e',
      'Tomato two spotted spider mites leaf': '#e11d48',
      'Potato leaf early blight': '#ea580c',
      'Potato leaf late blight': '#dc2626',
      'Apple Scab Leaf': '#65a30d',
      'Apple rust leaf': '#f59e0b',
      'grape leaf black rot': '#7c3aed',
      'Squash Powdery mildew leaf': '#d97706',
      'Soyabean leaf': '#16a34a',
      'Bell_pepper leaf spot': '#0891b2',
    };
    return colors[cls] || '#6b7280';
  };

  // Friendly PT labels for the field user (no technical class keys)
  const PT_LABELS = {
    healthy: 'Saudável',
    leaf_rust: 'Ferrugem',
    brown_eye_spot: 'Cercosporiose',
    leaf_miner: 'Bicho-mineiro',
    red_spider_mite: 'Ácaro-vermelho',
  };
  const getClassLabel = (cls) => PT_LABELS[cls] || cls.replace(/_/g, ' ');

  return (
    <div className="App">
      <div className="container">
        <div className="main-content-card">

          {/* Mode Toggle */}
          <div className="ga-modes">
            <button
              className={`ga-mode ${mode === 'image' ? 'active' : ''}`}
              onClick={() => { setMode('image'); handleReset(); }}
            >
              Imagem
            </button>
            <button
              className={`ga-mode ${mode === 'video' ? 'active' : ''}`}
              onClick={() => { setMode('video'); handleReset(); }}
            >
              Vídeo
            </button>
          </div>

          {/* Upload Area */}
          <div className="upload-section">
            <div className="upload-area">
              {mode === 'image' && imagePreview ? (
                <div className="image-preview-container">
                  <img src={annotatedImage || imagePreview} alt="Preview" className="image-preview" />
                  <button className="remove-image-btn" onClick={handleReset} title="Remove">x</button>
                </div>
              ) : mode === 'video' && (videoPreview || job) ? (
                <div className="image-preview-container">
                  {analyzedVideoUrl ? (
                    <video src={analyzedVideoUrl} controls className="image-preview" />
                  ) : videoPreview ? (
                    <video src={videoPreview} controls className="image-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      <p>{job?.filename || 'Vídeo'}</p>
                    </div>
                  )}
                  {videoProcessing && (
                    <div className="ga-video-progress">
                      <span className="ga-spinner" />
                      <span>Processando… {job?.progress ? `${job.progress}%` : ''}</span>
                      <small>Você pode sair desta tela — avisamos quando terminar.</small>
                    </div>
                  )}
                  <button className="remove-image-btn" onClick={handleReset} title="Remove">×</button>
                </div>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    accept={mode === 'image' ? 'image/*' : 'video/*'}
                    onChange={mode === 'image' ? handleImageSelect : handleVideoSelect}
                    className="file-input"
                  />
                  <div className="upload-placeholder">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {mode === 'video' ? (
                        <>
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </>
                      ) : (
                        <>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </>
                      )}
                    </svg>
                    <p>{mode === 'video' ? 'Toque para enviar um vídeo' : 'Toque para enviar uma foto da folha'}</p>
                    <span>{mode === 'video' ? 'Formatos: MP4, AVI, MOV' : 'Formatos: JPG, PNG, WEBP'}</span>
                  </div>
                </label>
              )}
            </div>

            {/* Settings */}
            <div className="ga-settings">
              <div className="model-selector">
                <label htmlFor="detector-select">Modelo</label>
                <select
                  id="detector-select"
                  value={selectedDetector}
                  onChange={(e) => setSelectedDetector(e.target.value)}
                  className="model-select"
                  disabled={loading || videoProcessing}
                >
                  {availableModels.map(m => (
                    <option key={m.name} value={m.name}>
                      {m.label || m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="model-selector">
                <label htmlFor="conf-select">Confiança mínima</label>
                <select
                  id="conf-select"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="model-select"
                  disabled={loading || videoProcessing}
                >
                  <option value={0.15}>15%</option>
                  <option value={0.25}>25% (padrão)</option>
                  <option value={0.5}>50%</option>
                  <option value={0.7}>70%</option>
                </select>
              </div>
            </div>

            <button
              className="predict-btn"
              onClick={mode === 'image' ? analyzeImage : analyzeVideo}
              disabled={
                mode === 'image'
                  ? loading || !selectedImage
                  : videoProcessing || !selectedVideo
              }
            >
              <span>
                {mode === 'image'
                  ? (loading ? progress || 'Processando...' : 'Analisar imagem')
                  : (videoProcessing
                      ? `Processando${job?.progress ? ` ${job.progress}%` : '…'}`
                      : 'Analisar vídeo')}
              </span>
            </button>
          </div>

          {(error || videoError) && (
            <div className="error-message">
              <span>!</span> {error || videoError}
            </div>
          )}

          {/* Results: Image mode */}
          {summary && (
            <div className="prediction-results">
              <h2>Resultado da análise</h2>

              {/* Summary Cards */}
              <div className="ga-summary">
                <div className="ga-summary-card healthy">
                  <div className="ga-summary-number">{summary.total_detections}</div>
                  <div className="ga-summary-label">Total de detecções</div>
                </div>
                <div className="ga-summary-card diseased">
                  <div className="ga-summary-number">{summary.disease_detections}</div>
                  <div className="ga-summary-label">Doenças</div>
                </div>
                <div className="ga-summary-card ratio">
                  <div className="ga-summary-number">{summary.pest_detections}</div>
                  <div className="ga-summary-label">Pragas</div>
                </div>
              </div>

              {/* Legend — dynamic from actual detections */}
              <div className="ga-legend">
                {[...new Set(boxes.map(d => d.class))].map(cls => (
                  <div key={cls} className="ga-legend-item">
                    <span className="ga-legend-dot" style={{ background: getClassColor(cls) }} />
                    <span>{getClassLabel(cls)}</span>
                  </div>
                ))}
              </div>

              {/* Detection Details */}
              {boxes.length > 0 ? (
                <div className="all-predictions">
                  <h3>Detecções ({boxes.length})</h3>
                  <div className="probability-list">
                    {boxes.map((det, index) => (
                      <div key={index} className="probability-item">
                        <div className="probability-header">
                          <span className="class-name ga-patch-label">
                            <span className="ga-legend-dot" style={{ background: getClassColor(det.class) }} />
                            {getClassLabel(det.class)}
                          </span>
                          <span className="probability-value">
                            {(det.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="probability-bar-container">
                          <div
                            className="probability-bar"
                            style={{
                              width: `${det.confidence * 100}%`,
                              background: getClassColor(det.class)
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="all-predictions">
                  <h3>Nenhuma doença ou praga detectada</h3>
                  <p style={{ opacity: 0.6, fontSize: 14 }}>A folha parece saudável — nenhuma detecção relevante.</p>
                </div>
              )}

              <div className="model-info">
                AI Engine: CropTrack Vision
              </div>
            </div>
          )}

          {/* Download button for video */}
          {analyzedVideoUrl && (
            <div className="ga-download">
              <a href={analyzedVideoUrl} download="analyzed_video.mp4">
                Baixar vídeo analisado
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoAnalyzer;
