import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import axios from 'axios';
import SpotUploader from './SpotUploader';
import FieldDashboard from './FieldDashboard';
import {
  Plus, Layers, MapPin, BarChart3, Trash2, Globe, Map as MapIcon,
  ZoomIn, ZoomOut, Loader2, X, Info, Square, Hexagon, Check
} from 'lucide-react';
import './MapView.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CROP_STYLES = {
  coffee:     { bg: 'bg-amber-900/10', text: 'text-amber-800', label: 'COFFEE' },
  soybean:    { bg: 'bg-green-100', text: 'text-green-800', label: 'SOYBEAN' },
  corn:       { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'CORN' },
  sugarcane:  { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'SUGARCANE' },
};

const CROP_OPTIONS = [
  { key: 'coffee', label: 'Coffee', dot: 'bg-amber-700' },
  { key: 'soybean', label: 'Soybean', dot: 'bg-green-600' },
  { key: 'corn', label: 'Corn', dot: 'bg-yellow-500' },
  { key: 'sugarcane', label: 'Sugarcane', dot: 'bg-emerald-600' },
];

function MapView() {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [clickedPosition, setClickedPosition] = useState(null);
  const [error, setError] = useState(null);
  const [mapType, setMapType] = useState('satellite');
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showFieldNameModal, setShowFieldNameModal] = useState(false);
  const [pendingFieldData, setPendingFieldData] = useState(null);
  const [fieldNameInput, setFieldNameInput] = useState('');
  const [selectedCropType, setSelectedCropType] = useState('coffee');
  const [savingField, setSavingField] = useState(false);
  const [flyToField, setFlyToField] = useState(null);
  const mapRef = useRef(null);

  const MapController = ({ field }) => {
    const map = useMap();
    useEffect(() => {
      if (field && field.polygon_coordinates && field.polygon_coordinates.length > 0) {
        const bounds = L.latLngBounds(field.polygon_coordinates);
        map.flyToBounds(bounds, { padding: [50, 50], duration: 0.8 });
      }
    }, [field, map]);
    return null;
  };

  useEffect(() => {
    fetchFields();
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await axios.get('/api/models');
      const available = response.data.models.filter(m => m.available);
      setAvailableModels(available);
      if (available.length > 0) setSelectedModel(available[0].name);
    } catch (err) {
      console.error('Error fetching models:', err);
    }
  };

  const fetchFields = async () => {
    try {
      const response = await axios.get('/api/fields');
      setFields(response.data.fields);
    } catch (err) {
      console.error('Error fetching fields:', err);
      setError('Failed to load fields');
    }
  };

  const fetchFieldDetails = async (fieldId) => {
    try {
      const response = await axios.get(`/api/fields/${fieldId}`);
      setSelectedField(response.data);
    } catch (err) {
      console.error('Error fetching field details:', err);
    }
  };

  const fetchDashboardData = async (fieldId) => {
    setDashboardLoading(true);
    try {
      const response = await axios.get(`/api/fields/${fieldId}/analysis-summary`);
      setDashboardData(response.data);
      setShowDashboard(true);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleSpotUploaded = async () => {
    setShowUploader(false);
    setClickedPosition(null);
    if (selectedField) {
      await fetchFieldDetails(selectedField.id);
      // Refresh dashboard data so video analysis results appear
      if (showDashboard) await fetchDashboardData(selectedField.id);
    }
  };

  const getSpotColor = (healthLabel) => {
    const m = { healthy: '#10b981', mildly_stressed: '#d97706', diseased: '#dc2626', pest_damage: '#dc2626', unknown: '#94a3b8' };
    return m[healthLabel] || '#94a3b8';
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (drawingMode === 'spot' && selectedField) {
          setClickedPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
          setShowUploader(true);
        }
      },
    });
    return null;
  };

  const PolygonDrawer = ({ onComplete, onCancel, disabled }) => {
    const map = useMap();
    const handlerRef = useRef(null);
    const drawnItemsRef = useRef(null);

    useEffect(() => {
      if (!map) return;
      const drawnItems = new L.FeatureGroup();
      drawnItemsRef.current = drawnItems;
      map.addLayer(drawnItems);

      const drawHandler = new L.Draw.Polygon(map, {
        allowIntersection: false,
        showArea: true,
        shapeOptions: { color: '#10b981', fillColor: '#10b981', fillOpacity: 0.3, weight: 3 }
      });
      handlerRef.current = drawHandler;
      if (!disabled) { drawHandler.enable(); setIsDrawing(true); }

      const onDrawCreated = (e) => {
        drawnItems.addLayer(e.layer);
        onComplete(e.layer);
      };
      map.on(L.Draw.Event.CREATED, onDrawCreated);

      return () => {
        if (handlerRef.current) handlerRef.current.disable();
        map.off(L.Draw.Event.CREATED, onDrawCreated);
        map.removeLayer(drawnItems);
        setIsDrawing(false);
      };
    }, [map, onComplete]);

    useEffect(() => {
      if (handlerRef.current && disabled) handlerRef.current.disable();
    }, [disabled]);

    return null;
  };

  const cancelDrawing = () => { setDrawingMode(null); setIsDrawing(false); };

  const handlePolygonComplete = (layer) => {
    setIsDrawing(false);
    const latlngs = layer.getLatLngs()[0];
    const coordinates = latlngs.map(ll => [ll.lat, ll.lng]);
    setPendingFieldData({ layer, coordinates });
    setFieldNameInput('');
    setSelectedCropType('coffee');
    setShowFieldNameModal(true);
  };

  const handleSaveField = async () => {
    if (fieldNameInput.trim().length < 3 || !pendingFieldData) return;
    setSavingField(true);
    try {
      await axios.post('/api/fields', {
        name: fieldNameInput.trim(),
        crop_type: selectedCropType,
        polygon_coordinates: pendingFieldData.coordinates
      });
      await fetchFields();
      pendingFieldData.layer.remove();
      setDrawingMode(null);
      setShowFieldNameModal(false);
      setPendingFieldData(null);
      setFieldNameInput('');
    } catch (err) {
      console.error('Error creating field:', err);
      alert(err.response?.data?.error || 'Error creating field');
    } finally {
      setSavingField(false);
    }
  };

  const handleCancelFieldCreation = () => {
    if (pendingFieldData?.layer) pendingFieldData.layer.remove();
    setShowFieldNameModal(false);
    setPendingFieldData(null);
    setFieldNameInput('');
    setDrawingMode(null);
  };

  const handleZoom = (dir) => {
    if (mapRef.current) {
      const map = mapRef.current;
      if (dir === 'in') map.zoomIn();
      else map.zoomOut();
    }
  };

  const cropStyle = (type) => CROP_STYLES[type] || CROP_STYLES.coffee;

  return (
    <div className="mapview-root flex w-full bg-stone-50" style={{ height: '100%' }}>
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col bg-white border-r border-stone-100 overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">Overview</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Fields</h1>
          <p className="text-xs text-stone-400 mt-0.5">Monitor and analyze your crop fields</p>
        </div>

        {/* Create button */}
        <div className="px-4 mb-3">
          <button
            onClick={() => {
              setDrawingMode('field');
              setSelectedField(null);
              setFlyToField(null);
              setShowUploader(false);
              setShowDashboard(false);
            }}
            disabled={drawingMode === 'field'}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              drawingMode === 'field'
                ? 'bg-emerald-500 text-white'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            {drawingMode === 'field' ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            {drawingMode === 'field' ? 'Drawing field...' : 'Create New Field'}
          </button>
        </div>

        {/* Field list */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-2">
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin size={40} className="text-stone-300 mb-3" />
              <p className="text-sm font-medium text-stone-500">No fields created yet</p>
              <p className="text-xs text-stone-400 mt-1">Click "Create New Field" and draw a polygon on the map</p>
            </div>
          ) : (
            fields.map(field => {
              const cs = cropStyle(field.crop_type);
              const isSelected = selectedField?.id === field.id;
              return (
                <div
                  key={field.id}
                  onClick={async () => {
                    setSelectedField(field);
                    setFlyToField(field);
                    setDrawingMode(null);
                    setShowDashboard(false);
                    await fetchFieldDetails(field.id);
                  }}
                  className={`relative rounded-xl border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                      : 'bg-white border-stone-100 hover:border-stone-200'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-stone-800">{field.name}</h3>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cs.bg} ${cs.text}`}>
                      {cs.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <MapPin size={12} /> {field.spot_count || 0} spots
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected field detail panel */}
        {selectedField && (
          <div className="border-t border-stone-100 bg-stone-50 px-4 py-4 space-y-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600">Selected</span>
              </div>
              <p className="text-sm font-semibold text-stone-900 mt-0.5 italic">{selectedField.name}</p>
            </div>

            {selectedField.metrics && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2.5 border border-stone-100">
                  <div className="flex items-center gap-1 text-stone-400 mb-0.5">
                    <Square size={10} />
                    <span className="text-[10px] uppercase tracking-wide font-medium">Area</span>
                  </div>
                  <span className="text-sm font-semibold text-stone-800 font-mono">
                    {selectedField.metrics.area_hectares >= 1
                      ? `${selectedField.metrics.area_hectares.toFixed(2)} ha`
                      : `${selectedField.metrics.area_sqm.toFixed(0)} m²`}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-stone-100">
                  <div className="flex items-center gap-1 text-stone-400 mb-0.5">
                    <Hexagon size={10} />
                    <span className="text-[10px] uppercase tracking-wide font-medium">Perimeter</span>
                  </div>
                  <span className="text-sm font-semibold text-stone-800 font-mono">
                    {selectedField.metrics.perimeter_m >= 1000
                      ? `${(selectedField.metrics.perimeter_m / 1000).toFixed(2)} km`
                      : `${selectedField.metrics.perimeter_m.toFixed(0)} m`}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => { setDrawingMode('spot'); setShowUploader(false); }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                drawingMode === 'spot'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              <MapPin size={16} />
              Add Analysis Spot
            </button>
            <button
              onClick={() => fetchDashboardData(selectedField.id)}
              disabled={dashboardLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-all disabled:opacity-50"
            >
              <BarChart3 size={16} />
              {dashboardLoading ? 'Loading...' : 'View Dashboard'}
            </button>
            <button
              onClick={async () => {
                if (window.confirm('Delete this field and all its spots?')) {
                  try {
                    await axios.delete(`/api/fields/${selectedField.id}`);
                    await fetchFields();
                    setSelectedField(null);
                    setShowDashboard(false);
                    setDrawingMode(null);
                  } catch (err) { alert('Error deleting field'); }
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={14} />
              Delete Field
            </button>
          </div>
        )}
      </aside>

      {/* ── Map Panel ── */}
      <div className="relative flex-1" style={{ minHeight: 0 }}>

        {/* Top-left pill: system status */}
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-stone-900/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Sistema online
          {selectedModel && <span className="text-stone-400 ml-1">· {selectedModel}</span>}
        </div>

        {/* Top-right: map controls */}
        <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
          {/* Satellite / Street toggle */}
          <div className="flex rounded-xl overflow-hidden border border-stone-200 shadow-sm">
            <button
              onClick={() => setMapType('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
                mapType === 'satellite' ? 'bg-white text-stone-900' : 'bg-stone-100 text-stone-500 hover:text-stone-700'
              }`}
            >
              <Globe size={14} /> Satellite
            </button>
            <button
              onClick={() => setMapType('street')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
                mapType === 'street' ? 'bg-white text-stone-900' : 'bg-stone-100 text-stone-500 hover:text-stone-700'
              }`}
            >
              <MapIcon size={14} /> Street
            </button>
          </div>
          {/* Zoom */}
          <div className="flex flex-col rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-white">
            <button onClick={() => handleZoom('in')} className="px-2 py-1.5 text-stone-600 hover:bg-stone-50 transition-colors border-b border-stone-100">
              <ZoomIn size={16} />
            </button>
            <button onClick={() => handleZoom('out')} className="px-2 py-1.5 text-stone-600 hover:bg-stone-50 transition-colors">
              <ZoomOut size={16} />
            </button>
          </div>
        </div>

        {/* Drawing / Spot mode banner */}
        {drawingMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-stone-900/90 backdrop-blur-sm text-white pl-3 pr-2 py-2.5 rounded-2xl shadow-lg">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              drawingMode === 'field' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}>
              {drawingMode === 'field' ? <Layers size={20} /> : <MapPin size={20} />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {drawingMode === 'field'
                  ? (isDrawing ? 'Drawing Field' : 'Starting...')
                  : 'Adding Analysis Spot'}
              </span>
              <span className="text-xs text-stone-400">
                {drawingMode === 'field'
                  ? (isDrawing ? 'Click to add points. Close by clicking the first point.' : 'Preparing drawing mode...')
                  : 'Click inside the field boundary to place a spot'}
              </span>
            </div>
            {drawingMode === 'field' && (
              <div className="flex items-center gap-1 text-xs text-stone-400 px-2">
                <Info size={12} /> Min. 3 points
              </div>
            )}
            <button onClick={cancelDrawing} className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Leaflet map */}
        <MapContainer
          center={[-23.5505, -46.6333]}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
        >
          {mapType === 'satellite' ? (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
          )}

          <MapController field={flyToField} />

          {drawingMode === 'field' && (
            <PolygonDrawer
              onComplete={handlePolygonComplete}
              onCancel={cancelDrawing}
              disabled={showFieldNameModal}
            />
          )}

          {drawingMode === 'spot' && <MapClickHandler />}

          {fields.map(field => (
            <Polygon
              key={field.id}
              positions={field.polygon_coordinates}
              pathOptions={{
                color: selectedField?.id === field.id ? '#10b981' : '#22c55e',
                fillColor: 'rgba(16,185,129,0.25)',
                fillOpacity: selectedField?.id === field.id ? 0.4 : 0.2,
                weight: selectedField?.id === field.id ? 3 : 2,
                dashArray: drawingMode === 'spot' && selectedField?.id === field.id ? '5, 10' : null
              }}
              interactive={drawingMode !== 'spot'}
              bubblingMouseEvents={drawingMode === 'spot'}
              eventHandlers={drawingMode !== 'spot' ? {
                click: () => {
                  setSelectedField(field);
                  setFlyToField(field);
                  setShowDashboard(false);
                  setDrawingMode(null);
                  fetchFieldDetails(field.id);
                }
              } : {}}
            />
          ))}

          {selectedField?.spots?.map(spot => {
            const label = spot.analysis?.health_assessment?.label || spot.analysis?.health_label || 'unknown';
            return (
              <CircleMarker
                key={spot.id}
                center={[spot.latitude, spot.longitude]}
                radius={8}
                pathOptions={{ fillColor: getSpotColor(label), fillOpacity: 1, color: '#fff', weight: 2 }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Spot #{spot.id}</p>
                    {spot.analysis ? (
                      <>
                        <p>Status: {label}</p>
                        <p>Confidence: {((spot.analysis.health_assessment?.confidence || spot.analysis?.confidence || 0) * 100).toFixed(1)}%</p>
                        <p>AI Engine: CropTrack Vision</p>
                      </>
                    ) : (
                      <p>No analysis available</p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Spot Upload Modal */}
        {showUploader && clickedPosition && selectedField && (
          <div className="absolute inset-0 z-[2000] bg-black/30 backdrop-blur-sm flex items-center justify-center" style={{ padding: '20px 0' }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
              <div className="flex items-center gap-3 px-5 pt-5 pb-3" style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-900">Análise do Talhão</h3>
                  <p className="text-xs text-stone-400">Envie a foto da folha para diagnóstico por IA</p>
                </div>
              </div>
              <div className="px-5 pb-5">
                <SpotUploader
                  fieldId={selectedField.id}
                  latitude={clickedPosition.lat}
                  longitude={clickedPosition.lng}
                  onUploadComplete={handleSpotUploaded}
                  onCancel={() => { setShowUploader(false); setClickedPosition(null); }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Modal */}
        {showDashboard && selectedField && dashboardData && (
          <FieldDashboard
            field={selectedField}
            data={dashboardData}
            onClose={() => setShowDashboard(false)}
          />
        )}

        {/* Field Name Modal */}
        {showFieldNameModal && (
          <div
            className="absolute inset-0 z-[2000] bg-black/30 backdrop-blur-sm flex items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && handleCancelFieldCreation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Green progress bar */}
              <div className="h-[2px] bg-emerald-500" />

              <div className="px-6 pt-5 pb-5 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">Name Your Field</h3>
                    <p className="text-xs text-stone-400">Enter a name and select the crop type</p>
                  </div>
                </div>

                {/* Field name input */}
                <div>
                  <label htmlFor="field-name" className="block text-xs font-medium text-stone-500 mb-1.5">Field Name</label>
                  <input
                    id="field-name"
                    type="text"
                    placeholder="e.g., North Coffee Plantation"
                    value={fieldNameInput}
                    onChange={(e) => setFieldNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') handleSaveField();
                      if (e.key === 'Escape') handleCancelFieldCreation();
                    }}
                    onKeyUp={(e) => e.stopPropagation()}
                    onKeyPress={(e) => e.stopPropagation()}
                    autoFocus
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                  />
                  <p className={`text-xs mt-1 ${fieldNameInput.trim().length >= 3 ? 'text-emerald-600' : 'text-stone-400'}`}>
                    {fieldNameInput.trim().length < 3
                      ? `Minimum 3 characters (${fieldNameInput.trim().length}/3)`
                      : 'Valid name'}
                  </p>
                </div>

                {/* Crop type grid */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Crop Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CROP_OPTIONS.map(crop => (
                      <button
                        key={crop.key}
                        onClick={() => setSelectedCropType(crop.key)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          selectedCropType === crop.key
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${crop.dot}`} />
                        {crop.label}
                        {selectedCropType === crop.key && <Check size={14} className="ml-auto text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCancelFieldCreation}
                    disabled={savingField}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveField}
                    disabled={fieldNameInput.trim().length < 3 || savingField}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    {savingField ? (
                      <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    ) : (
                      'Create Field'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapView;
