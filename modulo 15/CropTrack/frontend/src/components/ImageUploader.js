import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function ImageUploader() {
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [classNames, setClassNames] = useState([]);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/models');
      console.log('Models response:', response.data);

      const available = response.data.models.filter(m => m.available);
      setAvailableModels(available);

      if (available.length > 0 && available[0].class_names) {
        setClassNames(available[0].class_names);
      } else {
        setClassNames([]);
      }

      if (available.length > 0) {
        setSelectedModel(available[0].name);
      } else {
        setError('No models available. Please check the backend.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch available models';
      setError(errorMsg);
      console.error('Error fetching models:', err);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setSelectedImage(file);
      setPrediction(null);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePredict = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }
    if (!selectedModel) {
      setError('Please select a model first');
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('model', selectedModel);

      const response = await axios.post('/api/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setPrediction(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to make prediction. Please try again.'
      );
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="App">
      <div className="container">
        <div className="main-content-card">
          <div className="upload-section">
            <div className="upload-area">
              {imagePreview ? (
                <div className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="image-preview"
                  />
                  <button
                    className="remove-image-btn"
                    onClick={handleReset}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="file-input"
                  />
                  <div className="upload-placeholder">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p>Click to upload a leaf image</p>
                    <span>Supported formats: JPG, PNG, WEBP</span>
                  </div>
                </label>
              )}
            </div>

            {availableModels.length > 0 && (
              <div className="model-badge">
                <span className="model-badge-label">Model</span>
                <span className="model-badge-name">{availableModels[0].name}</span>
                <span className="model-badge-sub">{availableModels[0].num_classes}-class ensemble · JMuBEN</span>
              </div>
            )}

            <button
              className="predict-btn"
              onClick={handlePredict}
              disabled={!selectedImage || !selectedModel || loading}
            >
              {loading ? 'Analyzing Image...' : 'Analyze Image'}
            </button>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠</span> {error}
            </div>
          )}

          {prediction && (
            <div className="prediction-results">
              <h2>Analysis Results</h2>

              {prediction.annotated_image && (
                <div className="main-prediction">
                  <img
                    src={prediction.annotated_image}
                    alt="Annotated detections"
                    className="image-preview"
                    style={{ maxWidth: '100%', borderRadius: 12 }}
                  />
                </div>
              )}

              <div className="all-predictions">
                <h3>
                  {prediction.num_detections > 0
                    ? `${prediction.num_detections} detection${prediction.num_detections > 1 ? 's' : ''}`
                    : 'No disease or pest detected'}
                </h3>
                {prediction.detections && prediction.detections.length > 0 ? (
                  <div className="probability-list">
                    {prediction.detections.map((det, index) => (
                      <div key={index} className="probability-item">
                        <div className="probability-header">
                          <span className="class-name">{det.class.replace(/_/g, ' ')}</span>
                          <span className="probability-value">
                            {(det.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="probability-bar-container">
                          <div
                            className="probability-bar"
                            style={{ width: `${det.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ opacity: 0.7 }}>
                    No diseases or pests detected above the confidence threshold.
                  </p>
                )}
              </div>

              <div className="model-info">
                AI Engine: CropTrack Vision
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageUploader;
