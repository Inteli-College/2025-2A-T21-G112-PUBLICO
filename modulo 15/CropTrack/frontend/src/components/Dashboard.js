import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import axios from 'axios';
import SpotUploader from './SpotUploader';
import FieldDashboard from './FieldDashboard';
import {
  Plus, MapPin, BarChart3, Trash2, Layers, X, Check, Loader2,
  Leaf, Bug, Eye, Activity, ChevronRight, Search, Filter,
  Globe, Map as MapIcon, ZoomIn, ZoomOut, Info, TrendingUp,
  Calendar, Crosshair
} from 'lucide-react';

// Fix leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ═══════════════════════════════════════════════════════════════
   STYLES — Corporate / Analytical Dashboard
   ═══════════════════════════════════════════════════════════════ */

const C = {
  bg: '#0f1117',
  bgCard: '#181b23',
  bgCardHover: '#1e2230',
  bgSurface: '#232733',
  border: '#2a2e3a',
  borderLight: '#333847',
  text: '#e8eaed',
  textDim: '#8b8fa3',
  textFaint: '#5c6070',
  emerald: '#34d399',
  emeraldDim: '#10b981',
  emeraldBg: 'rgba(52, 211, 153, 0.08)',
  emeraldBorder: 'rgba(52, 211, 153, 0.18)',
  red: '#f87171',
  redDim: '#dc2626',
  redBg: 'rgba(248, 113, 113, 0.08)',
  amber: '#fbbf24',
  amberDim: '#d97706',
  amberBg: 'rgba(251, 191, 36, 0.08)',
  blue: '#60a5fa',
  blueDim: '#3b82f6',
  blueBg: 'rgba(96, 165, 250, 0.08)',
  purple: '#a78bfa',
  purpleBg: 'rgba(167, 139, 250, 0.08)',
  white: '#ffffff',
};

const CROP_META = {
  coffee:    { color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)',  label: 'Coffee' },
  soybean:   { color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)',  label: 'Soybean' },
  corn:      { color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)',  label: 'Corn' },
  sugarcane: { color: '#059669', bg: 'rgba(5, 150, 105, 0.12)',  label: 'Sugarcane' },
};

const CROP_OPTIONS = [
  { key: 'coffee', label: 'Coffee' },
  { key: 'soybean', label: 'Soybean' },
  { key: 'corn', label: 'Corn' },
  { key: 'sugarcane', label: 'Sugarcane' },
];

/* ═══════════════════════════════════════════════════════════════
   MAP SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function MapController({ field }) {
  const map = useMap();
  useEffect(() => {
    if (field && field.polygon_coordinates && field.polygon_coordinates.length > 0) {
      const bounds = L.latLngBounds(field.polygon_coordinates);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 0.8 });
    }
  }, [field, map]);
  return null;
}

function PolygonDrawer({ onComplete, disabled }) {
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
      shapeOptions: { color: C.emerald, fillColor: C.emerald, fillOpacity: 0.3, weight: 3 }
    });
    handlerRef.current = drawHandler;
    if (!disabled) drawHandler.enable();

    const onDrawCreated = (e) => {
      drawnItems.addLayer(e.layer);
      onComplete(e.layer);
    };
    map.on(L.Draw.Event.CREATED, onDrawCreated);

    return () => {
      if (handlerRef.current) handlerRef.current.disable();
      map.off(L.Draw.Event.CREATED, onDrawCreated);
      map.removeLayer(drawnItems);
    };
  }, [map, onComplete, disabled]);

  useEffect(() => {
    if (handlerRef.current && disabled) handlerRef.current.disable();
  }, [disabled]);

  return null;
}

function SpotClickHandler({ onSpotClick }) {
  useMapEvents({ click: (e) => onSpotClick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   MAP MODAL — opens as overlay for polygon drawing or spot placement
   ═══════════════════════════════════════════════════════════════ */

function MapModal({ mode, fields, targetField, onPolygonComplete, onSpotClick, onClose }) {
  const [mapType, setMapType] = useState('satellite');
  const mapRef = useRef(null);

  const handleZoom = (dir) => {
    if (mapRef.current) {
      if (dir === 'in') mapRef.current.zoomIn();
      else mapRef.current.zoomOut();
    }
  };

  const getSpotColor = (label) => {
    const m = { healthy: '#10b981', mildly_stressed: '#d97706', diseased: '#dc2626', pest_damage: '#dc2626', detected: '#0891b2', unknown: '#94a3b8' };
    return m[label] || '#94a3b8';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 1200, height: '80vh',
        borderRadius: 20, overflow: 'hidden', position: 'relative',
        border: `1px solid ${C.border}`, boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
          background: 'rgba(15,17,23,0.92)', backdropFilter: 'blur(12px)',
          padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: mode === 'polygon' ? C.emeraldBg : C.amberBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: mode === 'polygon' ? C.emerald : C.amber,
            }}>
              {mode === 'polygon' ? <Layers size={18} /> : <Crosshair size={18} />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                {mode === 'polygon' ? 'Draw Field Boundary' : 'Place Analysis Spot'}
              </div>
              <div style={{ fontSize: 12, color: C.textDim }}>
                {mode === 'polygon'
                  ? 'Click to add points. Close by clicking the first point.'
                  : 'Click inside the field boundary to place a spot.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Map type toggle */}
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <button onClick={() => setMapType('satellite')} style={{
                padding: '6px 12px', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                background: mapType === 'satellite' ? C.bgSurface : C.bg,
                color: mapType === 'satellite' ? C.text : C.textDim,
              }}>
                <Globe size={13} /> Satellite
              </button>
              <button onClick={() => setMapType('street')} style={{
                padding: '6px 12px', border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
                background: mapType === 'street' ? C.bgSurface : C.bg,
                color: mapType === 'street' ? C.text : C.textDim,
              }}>
                <MapIcon size={13} /> Street
              </button>
            </div>
            {/* Zoom */}
            <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <button onClick={() => handleZoom('in')} style={{ padding: '4px 8px', border: 'none', background: C.bg, color: C.textDim, cursor: 'pointer' }}>
                <ZoomIn size={14} />
              </button>
              <button onClick={() => handleZoom('out')} style={{ padding: '4px 8px', border: 'none', background: C.bg, color: C.textDim, cursor: 'pointer', borderTop: `1px solid ${C.border}` }}>
                <ZoomOut size={14} />
              </button>
            </div>
            {/* Close */}
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: 10, border: `1px solid ${C.border}`,
              background: C.bg, color: C.textDim, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Leaflet map */}
        <MapContainer
          center={targetField?.polygon_coordinates?.[0] || [-23.5505, -46.6333]}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={false}
        >
          {mapType === 'satellite' ? (
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="&copy; Esri" maxZoom={19} />
          ) : (
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          )}

          {targetField && <MapController field={targetField} />}

          {mode === 'polygon' && (
            <PolygonDrawer onComplete={onPolygonComplete} disabled={false} />
          )}

          {mode === 'spot' && (
            <SpotClickHandler onSpotClick={onSpotClick} />
          )}

          {/* Render all existing fields */}
          {fields.map(field => (
            <Polygon
              key={field.id}
              positions={field.polygon_coordinates}
              pathOptions={{
                color: targetField?.id === field.id ? C.emerald : '#22c55e',
                fillColor: 'rgba(16,185,129,0.25)',
                fillOpacity: targetField?.id === field.id ? 0.4 : 0.2,
                weight: targetField?.id === field.id ? 3 : 2,
                dashArray: mode === 'spot' && targetField?.id === field.id ? '5, 10' : null,
              }}
              interactive={false}
              bubblingMouseEvents={true}
            />
          ))}

          {/* Render spots for target field */}
          {targetField?.spots?.map(spot => {
            const label = spot.analysis?.health_assessment?.label || spot.analysis?.health_label || 'unknown';
            return (
              <CircleMarker
                key={spot.id}
                center={[spot.latitude, spot.longitude]}
                radius={8}
                pathOptions={{ fillColor: getSpotColor(label), fillOpacity: 1, color: '#fff', weight: 2 }}
              >
                <Popup>
                  <div style={{ fontSize: 13 }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>Spot #{spot.id}</p>
                    {spot.analysis ? (
                      <>
                        <p>Status: {label}</p>
                        <p>Confidence: {((spot.analysis.health_assessment?.confidence || spot.analysis?.confidence || 0) * 100).toFixed(1)}%</p>
                      </>
                    ) : <p>No analysis</p>}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function Dashboard() {
  // --- State ---
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [fieldDetail, setFieldDetail] = useState(null);
  const [fieldSummaries, setFieldSummaries] = useState({});
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Create field flow (wizard)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [createName, setCreateName] = useState('');
  const [createCrop, setCreateCrop] = useState('coffee');
  const [createSoilType, setCreateSoilType] = useState('');
  const [createSoilTreatment, setCreateSoilTreatment] = useState('');
  const [createPlantingDate, setCreatePlantingDate] = useState('');
  const [createIrrigation, setCreateIrrigation] = useState('');
  const [createPlantSpacing, setCreatePlantSpacing] = useState('');
  const [createEstimatedPlants, setCreateEstimatedPlants] = useState('');
  const [createNotes, setCreateNotes] = useState('');
  const [showMapForPolygon, setShowMapForPolygon] = useState(false);
  const [pendingPolygonLayer, setPendingPolygonLayer] = useState(null);
  const [savingField, setSavingField] = useState(false);

  // Spot flow
  const [showMapForSpot, setShowMapForSpot] = useState(false);
  const [clickedSpotPos, setClickedSpotPos] = useState(null);
  const [showSpotUploader, setShowSpotUploader] = useState(false);

  // Dashboard modal
  const [showFieldDashboard, setShowFieldDashboard] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // --- Data fetching ---
  useEffect(() => {
    fetchFields();
    fetchModels();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/fields');
      const allFields = response.data.fields || [];
      setFields(allFields);
      // Fetch summaries for each field
      allFields.forEach(f => fetchSummary(f.id));
    } catch (err) {
      console.error('Error fetching fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (fieldId) => {
    try {
      const response = await axios.get(`/api/fields/${fieldId}/analysis-summary`);
      setFieldSummaries(prev => ({ ...prev, [fieldId]: response.data }));
    } catch (err) {
      // Field may have no spots yet
      setFieldSummaries(prev => ({ ...prev, [fieldId]: null }));
    }
  };

  const fetchFieldDetail = async (fieldId) => {
    try {
      const response = await axios.get(`/api/fields/${fieldId}`);
      setFieldDetail(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching field detail:', err);
      return null;
    }
  };

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

  // --- Computed stats ---
  const globalStats = useMemo(() => {
    let totalSpots = 0, totalDetections = 0, healthyCount = 0, totalAnalyzed = 0;
    let allClasses = {};

    fields.forEach(f => {
      totalSpots += f.spot_count || 0;
      const s = fieldSummaries[f.id];
      if (s) {
        totalDetections += s.total_detections || 0;
        const dist = s.health_distribution || {};
        healthyCount += dist.healthy || 0;
        totalAnalyzed += s.total_spots || 0;
        const diseases = s.diseases_found || {};
        const pests = s.pests_found || {};
        const other = s.other_classes || {};
        Object.entries({ ...diseases, ...pests, ...other }).forEach(([cls, count]) => {
          allClasses[cls] = (allClasses[cls] || 0) + count;
        });
      }
    });

    const avgHealth = totalAnalyzed > 0 ? Math.round((healthyCount / totalAnalyzed) * 100) : 0;

    return { totalSpots, totalDetections, avgHealth, totalAnalyzed, allClasses };
  }, [fields, fieldSummaries]);

  // --- Filtered fields ---
  const filteredFields = useMemo(() => {
    if (!searchQuery.trim()) return fields;
    const q = searchQuery.toLowerCase();
    return fields.filter(f =>
      f.name.toLowerCase().includes(q) ||
      (f.crop_type || '').toLowerCase().includes(q)
    );
  }, [fields, searchQuery]);

  // --- Refs to avoid stale closures in map callbacks ---
  const createNameRef = useRef(createName);
  const createCropRef = useRef(createCrop);
  const createFieldDataRef = useRef({});
  useEffect(() => { createNameRef.current = createName; }, [createName]);
  useEffect(() => { createCropRef.current = createCrop; }, [createCrop]);
  useEffect(() => {
    createFieldDataRef.current = {
      soil_type: createSoilType, soil_treatment: createSoilTreatment,
      planting_date: createPlantingDate, irrigation_type: createIrrigation,
      plant_spacing: createPlantSpacing,
      estimated_plants: createEstimatedPlants ? parseInt(createEstimatedPlants) : null,
      notes: createNotes,
    };
  }, [createSoilType, createSoilTreatment, createPlantingDate, createIrrigation, createPlantSpacing, createEstimatedPlants, createNotes]);

  // --- Create field handlers ---
  const handleCreateFieldSubmit = () => {
    if (createName.trim().length < 3) return;
    setShowCreateModal(false);
    setCreateStep(1);
    setShowMapForPolygon(true);
  };

  const resetCreateForm = () => {
    setCreateName('');
    setCreateCrop('coffee');
    setCreateSoilType('');
    setCreateSoilTreatment('');
    setCreatePlantingDate('');
    setCreateIrrigation('');
    setCreatePlantSpacing('');
    setCreateEstimatedPlants('');
    setCreateNotes('');
    setCreateStep(1);
  };

  const handlePolygonComplete = useCallback((layer) => {
    setPendingPolygonLayer(layer);
    const latlngs = layer.getLatLngs()[0];
    const coordinates = latlngs.map(ll => [ll.lat, ll.lng]);
    const name = createNameRef.current;
    const crop = createCropRef.current;
    const extra = createFieldDataRef.current;
    (async () => {
      setSavingField(true);
      try {
        await axios.post('/api/fields', {
          name: name.trim(),
          crop_type: crop,
          polygon_coordinates: coordinates,
          ...extra,
        });
        layer.remove();
        setShowMapForPolygon(false);
        setPendingPolygonLayer(null);
        resetCreateForm();
        await fetchFields();
      } catch (err) {
        console.error('Error creating field:', err);
        alert(err.response?.data?.error || 'Error creating field');
      } finally {
        setSavingField(false);
      }
    })();
  }, []);

  // --- Spot handlers ---
  const handleAddSpot = async (field) => {
    const detail = await fetchFieldDetail(field.id);
    setSelectedField(detail || field);
    setShowMapForSpot(true);
  };

  const handleSpotMapClick = (pos) => {
    setClickedSpotPos(pos);
    setShowMapForSpot(false);
    setShowSpotUploader(true);
  };

  const handleSpotUploaded = async () => {
    setShowSpotUploader(false);
    setClickedSpotPos(null);
    if (selectedField) {
      await fetchFieldDetail(selectedField.id);
      await fetchSummary(selectedField.id);
    }
    await fetchFields();
  };

  // --- Dashboard handler ---
  const handleViewDashboard = async (field) => {
    try {
      const [detail, summary] = await Promise.all([
        fetchFieldDetail(field.id),
        axios.get(`/api/fields/${field.id}/analysis-summary`),
      ]);
      setSelectedField(detail || field);
      setDashboardData(summary.data);
      setShowFieldDashboard(true);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  // --- Delete handler ---
  const handleDeleteField = async (field) => {
    if (!window.confirm(`Delete "${field.name}" and all its spots?`)) return;
    try {
      await axios.delete(`/api/fields/${field.id}`);
      setSelectedField(null);
      setFieldDetail(null);
      await fetchFields();
    } catch (err) {
      alert('Error deleting field');
    }
  };

  // --- Field card health info ---
  const getFieldHealth = (fieldId) => {
    const s = fieldSummaries[fieldId];
    if (!s || !s.total_spots) return { rate: null, label: 'No data', color: C.textFaint };
    const dist = s.health_distribution || {};
    const healthy = dist.healthy || 0;
    const rate = Math.round((healthy / s.total_spots) * 100);
    if (rate >= 80) return { rate, label: `${rate}% Healthy`, color: C.emerald };
    if (rate >= 50) return { rate, label: `${rate}% Health`, color: C.amber };
    return { rate, label: `${rate}% Health`, color: C.red };
  };

  // ─── RENDER ───

  return (
    <div className="dashboard-root" style={{
      minHeight: '100%', background: C.bg, color: C.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .dash-card:hover { background: ${C.bgCardHover} !important; border-color: ${C.borderLight} !important; }
        .dash-stat:hover { border-color: ${C.borderLight} !important; transform: translateY(-2px); }
        .dash-field-card:hover { border-color: ${C.emeraldBorder} !important; transform: translateY(-2px); }
        .dash-field-card { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        .dash-stat { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        .dash-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .dash-btn { transition: all 0.2s ease; }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <div style={{
        padding: '32px 40px 24px',
        borderBottom: `1px solid ${C.border}`,
        background: C.bg,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.emerald, boxShadow: `0 0 8px ${C.emeraldDim}` }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.emerald }}>
                  Sistema Online
                </span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>
                Field Operations
              </h1>
              <p style={{ fontSize: 14, color: C.textDim, margin: '4px 0 0', lineHeight: 1.5 }}>
                Monitor crop health, manage fields, and run AI-powered analysis.
              </p>
            </div>
            <button
              className="dash-btn"
              onClick={() => { setShowCreateModal(true); setCreateName(''); setCreateCrop('coffee'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 12, border: 'none',
                background: C.emerald, color: C.bg, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              <Plus size={18} /> New Field
            </button>
          </div>

          {/* ═══ STATS ROW ═══ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { icon: <Layers size={18} />, label: 'Total Fields', value: fields.length, color: C.emerald, bg: C.emeraldBg },
              { icon: <MapPin size={18} />, label: 'Analysis Spots', value: globalStats.totalSpots, color: C.blue, bg: C.blueBg },
              { icon: <Eye size={18} />, label: 'Total Detections', value: globalStats.totalDetections, color: C.purple, bg: C.purpleBg },
              { icon: <Activity size={18} />, label: 'Avg Health Rate', value: `${globalStats.avgHealth}%`, color: globalStats.avgHealth >= 70 ? C.emerald : globalStats.avgHealth >= 40 ? C.amber : C.red, bg: globalStats.avgHealth >= 70 ? C.emeraldBg : globalStats.avgHealth >= 40 ? C.amberBg : C.redBg },
            ].map((stat, i) => (
              <div key={i} className="dash-stat" style={{
                background: C.bgCard, borderRadius: 14, padding: '20px 22px',
                border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden',
                animation: `fadeIn 0.4s ease ${i * 0.08}s both`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: C.textDim, letterSpacing: '0.02em' }}>{stat.label}</span>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: stat.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color,
                  }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', fontFeatureSettings: "'tnum'" }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ padding: '28px 40px 40px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Search + Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: '0 16px', height: 44,
          }}>
            <Search size={16} style={{ color: C.textFaint, flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, border: 'none', background: 'transparent', outline: 'none',
                fontSize: 14, color: C.text, fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '0 14px', height: 44, borderRadius: 12,
            background: C.bgCard, border: `1px solid ${C.border}`,
            fontSize: 13, color: C.textDim, fontWeight: 500,
          }}>
            <Filter size={14} />
            {fields.length} field{fields.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Detection class breakdown (if any) */}
        {Object.keys(globalStats.allClasses).length > 0 && (
          <div style={{
            background: C.bgCard, borderRadius: 14, border: `1px solid ${C.border}`,
            padding: 24, marginBottom: 24, animation: 'fadeIn 0.4s ease 0.3s both',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Detection Overview</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                  {globalStats.totalDetections} total across {Object.keys(globalStats.allClasses).length} classes
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(globalStats.allClasses)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 12)
                .map(([cls, count]) => {
                  const maxCount = Math.max(...Object.values(globalStats.allClasses));
                  const intensity = Math.max(0.3, count / maxCount);
                  return (
                    <div key={cls} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: C.bgSurface, borderRadius: 10, padding: '10px 14px',
                      border: `1px solid ${C.border}`, flex: '1 1 auto', minWidth: 180,
                    }}>
                      <div style={{
                        width: 6, height: 28, borderRadius: 3,
                        background: C.emerald, opacity: intensity,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cls.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFeatureSettings: "'tnum'" }}>
                        {count}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ═══ FIELD CARDS GRID ═══ */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <Loader2 size={32} style={{ color: C.emerald, animation: 'pulse 1.5s ease infinite' }} />
            <p style={{ color: C.textDim, marginTop: 16, fontSize: 14 }}>Loading fields...</p>
          </div>
        ) : filteredFields.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            background: C.bgCard, borderRadius: 16, border: `1px dashed ${C.border}`,
          }}>
            <Layers size={48} style={{ color: C.textFaint, marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: '0 0 8px' }}>
              {searchQuery ? 'No fields match your search' : 'No fields created yet'}
            </h3>
            <p style={{ fontSize: 14, color: C.textDim, margin: '0 0 24px' }}>
              {searchQuery ? 'Try a different search term.' : 'Create your first field to start monitoring crops.'}
            </p>
            {!searchQuery && (
              <button
                className="dash-btn"
                onClick={() => { setShowCreateModal(true); setCreateName(''); setCreateCrop('coffee'); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 28px', borderRadius: 12, border: 'none',
                  background: C.emerald, color: C.bg, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Plus size={18} /> Create First Field
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))', gap: 16 }}>
            {filteredFields.map((field, idx) => {
              const crop = CROP_META[field.crop_type] || CROP_META.coffee;
              const health = getFieldHealth(field.id);
              const summary = fieldSummaries[field.id];
              const detections = summary?.total_detections || 0;
              const spots = field.spot_count || 0;

              return (
                <div
                  key={field.id}
                  className="dash-field-card"
                  style={{
                    background: C.bgCard, borderRadius: 16, border: `1px solid ${C.border}`,
                    overflow: 'hidden', cursor: 'pointer', position: 'relative',
                    animation: `slideUp 0.35s ease ${idx * 0.05}s both`,
                  }}
                >
                  {/* Card header */}
                  <div style={{ padding: '20px 22px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0, letterSpacing: '-0.01em' }}>
                          {field.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                          <span style={{
                            fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                            padding: '3px 10px', borderRadius: 6, color: crop.color, background: crop.bg,
                          }}>
                            {crop.label}
                          </span>
                          {field.created_at && (
                            <span style={{ fontSize: 11, color: C.textFaint, display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Calendar size={10} />
                              {new Date(field.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {health.rate !== null && (
                        <div style={{
                          width: 48, height: 48, borderRadius: 12,
                          background: health.color === C.emerald ? C.emeraldBg : health.color === C.amber ? C.amberBg : C.redBg,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: health.color, lineHeight: 1 }}>{health.rate}</span>
                          <span style={{ fontSize: 9, fontWeight: 500, color: health.color, opacity: 0.7 }}>%</span>
                        </div>
                      )}
                    </div>

                    {/* Mini stats row */}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.textDim }}>
                        <MapPin size={13} style={{ color: C.blue }} /> {spots} spot{spots !== 1 ? 's' : ''}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.textDim }}>
                        <Eye size={13} style={{ color: C.purple }} /> {detections} detection{detections !== 1 ? 's' : ''}
                      </div>
                      {summary?.health_distribution?.diseased > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: C.red }}>
                          <Bug size={13} /> {summary.health_distribution.diseased} diseased
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Health bar */}
                  {health.rate !== null && (
                    <div style={{ padding: '0 22px', marginBottom: 16 }}>
                      <div style={{ height: 4, borderRadius: 2, background: C.bgSurface, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 2, width: `${health.rate}%`,
                          background: health.color === C.emerald
                            ? `linear-gradient(90deg, ${C.emeraldDim}, ${C.emerald})`
                            : health.color === C.amber
                            ? `linear-gradient(90deg, ${C.amberDim}, ${C.amber})`
                            : `linear-gradient(90deg, ${C.redDim}, ${C.red})`,
                          transition: 'width 0.8s ease',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{
                    display: 'flex', borderTop: `1px solid ${C.border}`,
                  }}>
                    <button
                      className="dash-btn"
                      onClick={(e) => { e.stopPropagation(); handleAddSpot(field); }}
                      style={{
                        flex: 1, padding: '12px 0', border: 'none', borderRight: `1px solid ${C.border}`,
                        background: 'transparent', color: C.emerald, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <Crosshair size={14} /> Add Spot
                    </button>
                    <button
                      className="dash-btn"
                      onClick={(e) => { e.stopPropagation(); handleViewDashboard(field); }}
                      style={{
                        flex: 1, padding: '12px 0', border: 'none', borderRight: `1px solid ${C.border}`,
                        background: 'transparent', color: C.blue, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <BarChart3 size={14} /> Analytics
                    </button>
                    <button
                      className="dash-btn"
                      onClick={(e) => { e.stopPropagation(); handleDeleteField(field); }}
                      style={{
                        flex: 0, padding: '12px 16px', border: 'none',
                        background: 'transparent', color: C.textFaint, fontSize: 12,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
           MODALS
         ═══════════════════════════════════════════════════════════ */}

      {/* CREATE FIELD MODAL — multi-step wizard */}
      {showCreateModal && (() => {
        const totalSteps = 3;
        const stepTitles = ['Field Info', 'Soil & Planting', 'Irrigation & Notes'];
        const canNext = createStep === 1 ? createName.trim().length >= 3
          : createStep === 2 ? true
          : true;
        const inputStyle = {
          width: '100%', padding: '12px 16px', borderRadius: 10, fontSize: 14,
          border: `1px solid ${C.border}`, background: C.bg, color: C.text,
          outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        };
        const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 8, letterSpacing: '0.03em' };
        const selectStyle = { ...inputStyle, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' };

        return (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 8000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={(e) => e.target === e.currentTarget && (setShowCreateModal(false), resetCreateForm())}
        >
          <div style={{
            background: C.bgCard, borderRadius: 20, width: '100%', maxWidth: 480,
            border: `1px solid ${C.border}`, overflow: 'hidden',
            animation: 'slideUp 0.3s ease',
          }}>
            {/* Progress bar */}
            <div style={{ height: 3, background: C.bgSurface }}>
              <div style={{ height: '100%', width: `${(createStep / totalSteps) * 100}%`, background: C.emerald, transition: 'width 0.3s ease', borderRadius: 2 }} />
            </div>

            <div style={{ padding: '28px 28px 24px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: C.emeraldBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.emerald,
                }}>
                  <Plus size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: 0 }}>Create New Field</h3>
                  <p style={{ fontSize: 13, color: C.textDim, margin: '2px 0 0' }}>Step {createStep} of {totalSteps} — {stepTitles[createStep - 1]}</p>
                </div>
              </div>

              {/* Step indicators */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {stepTitles.map((title, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                      background: createStep > i + 1 ? C.emerald : createStep === i + 1 ? C.emeraldBg : C.bgSurface,
                      color: createStep > i + 1 ? C.bg : createStep === i + 1 ? C.emerald : C.textFaint,
                      border: createStep === i + 1 ? `2px solid ${C.emerald}` : '2px solid transparent',
                    }}>
                      {createStep > i + 1 ? <Check size={14} /> : i + 1}
                    </div>
                    <span style={{ fontSize: 11, color: createStep >= i + 1 ? C.textDim : C.textFaint, fontWeight: 500, textAlign: 'center' }}>{title}</span>
                  </div>
                ))}
              </div>

              {/* STEP 1: Field Info */}
              {createStep === 1 && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Field Name</label>
                    <input
                      type="text"
                      placeholder="e.g., North Coffee Plantation"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter' && canNext) setCreateStep(2); if (e.key === 'Escape') setShowCreateModal(false); }}
                      onKeyUp={(e) => e.stopPropagation()}
                      onKeyPress={(e) => e.stopPropagation()}
                      autoFocus
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = C.emerald}
                      onBlur={(e) => e.target.style.borderColor = C.border}
                    />
                    <p style={{ fontSize: 12, color: createName.trim().length >= 3 ? C.emerald : C.textFaint, marginTop: 6 }}>
                      {createName.trim().length < 3 ? `Min. 3 characters (${createName.trim().length}/3)` : 'Valid name'}
                    </p>
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={labelStyle}>Crop Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {CROP_OPTIONS.map(crop => {
                        const meta = CROP_META[crop.key];
                        const selected = createCrop === crop.key;
                        return (
                          <button
                            key={crop.key}
                            onClick={() => setCreateCrop(crop.key)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                              border: `1px solid ${selected ? C.emerald : C.border}`,
                              background: selected ? C.emeraldBg : C.bg,
                              color: selected ? C.emerald : C.textDim,
                              fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s',
                            }}
                          >
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />
                            {crop.label}
                            {selected && <Check size={14} style={{ marginLeft: 'auto' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: Soil & Planting */}
              {createStep === 2 && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Soil Type</label>
                    <select value={createSoilType} onChange={(e) => setCreateSoilType(e.target.value)} style={selectStyle}>
                      <option value="">Select soil type...</option>
                      <option value="clay">Clay (Argiloso)</option>
                      <option value="sandy">Sandy (Arenoso)</option>
                      <option value="loam">Loam (Franco)</option>
                      <option value="silt">Silt (Siltoso)</option>
                      <option value="clay_loam">Clay Loam (Franco-argiloso)</option>
                      <option value="sandy_loam">Sandy Loam (Franco-arenoso)</option>
                      <option value="red_latosol">Red Latosol (Latossolo Vermelho)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Soil Treatment / Fertilization</label>
                    <select value={createSoilTreatment} onChange={(e) => setCreateSoilTreatment(e.target.value)} style={selectStyle}>
                      <option value="">Select treatment...</option>
                      <option value="liming">Liming (Calagem)</option>
                      <option value="npk">NPK Fertilization</option>
                      <option value="organic">Organic Compost</option>
                      <option value="gypsum">Gypsum (Gessagem)</option>
                      <option value="liming_npk">Liming + NPK</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                    <div>
                      <label style={labelStyle}>Planting Date</label>
                      <input
                        type="date"
                        value={createPlantingDate}
                        onChange={(e) => setCreatePlantingDate(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Plant Spacing</label>
                      <input
                        type="text"
                        placeholder="e.g., 3x1.5m"
                        value={createPlantSpacing}
                        onChange={(e) => setCreatePlantSpacing(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                        onKeyUp={(e) => e.stopPropagation()}
                        onKeyPress={(e) => e.stopPropagation()}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 3: Irrigation & Notes */}
              {createStep === 3 && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Irrigation Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[
                        { key: 'rain_fed', label: 'Rain-fed', icon: '🌧' },
                        { key: 'drip', label: 'Drip', icon: '💧' },
                        { key: 'sprinkler', label: 'Sprinkler', icon: '🔄' },
                        { key: 'pivot', label: 'Center Pivot', icon: '🎯' },
                      ].map(opt => {
                        const selected = createIrrigation === opt.key;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => setCreateIrrigation(opt.key)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                              border: `1px solid ${selected ? C.emerald : C.border}`,
                              background: selected ? C.emeraldBg : C.bg,
                              color: selected ? C.emerald : C.textDim,
                              fontSize: 13, fontWeight: 500, fontFamily: 'inherit', transition: 'all 0.2s',
                            }}
                          >
                            <span>{opt.icon}</span> {opt.label}
                            {selected && <Check size={14} style={{ marginLeft: 'auto' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Estimated Number of Plants</label>
                    <input
                      type="number"
                      placeholder="e.g., 5000"
                      value={createEstimatedPlants}
                      onChange={(e) => setCreateEstimatedPlants(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onKeyPress={(e) => e.stopPropagation()}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <label style={labelStyle}>Additional Notes</label>
                    <textarea
                      placeholder="Any relevant info about this field..."
                      value={createNotes}
                      onChange={(e) => setCreateNotes(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onKeyUp={(e) => e.stopPropagation()}
                      onKeyPress={(e) => e.stopPropagation()}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
                    />
                  </div>
                </>
              )}

              {/* Navigation buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => {
                    if (createStep === 1) { setShowCreateModal(false); resetCreateForm(); }
                    else setCreateStep(s => s - 1);
                  }}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 10,
                    border: `1px solid ${C.border}`, background: 'transparent',
                    color: C.textDim, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {createStep === 1 ? 'Cancel' : 'Back'}
                </button>
                {createStep < totalSteps ? (
                  <button
                    onClick={() => setCreateStep(s => s + 1)}
                    disabled={!canNext}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
                      background: canNext ? C.emerald : C.bgSurface,
                      color: canNext ? C.bg : C.textFaint,
                      fontSize: 14, fontWeight: 600, cursor: canNext ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleCreateFieldSubmit}
                    disabled={!canNext}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
                      background: canNext ? C.emerald : C.bgSurface,
                      color: canNext ? C.bg : C.textFaint,
                      fontSize: 14, fontWeight: 600, cursor: canNext ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    Draw on Map <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* MAP MODAL — polygon drawing */}
      {showMapForPolygon && (
        <MapModal
          mode="polygon"
          fields={fields}
          targetField={null}
          onPolygonComplete={handlePolygonComplete}
          onSpotClick={() => {}}
          onClose={() => { setShowMapForPolygon(false); setPendingPolygonLayer(null); }}
        />
      )}

      {/* MAP MODAL — spot placement */}
      {showMapForSpot && selectedField && (
        <MapModal
          mode="spot"
          fields={fields}
          targetField={selectedField}
          onPolygonComplete={() => {}}
          onSpotClick={handleSpotMapClick}
          onClose={() => setShowMapForSpot(false)}
        />
      )}

      {/* SPOT UPLOADER MODAL */}
      {showSpotUploader && clickedSpotPos && selectedField && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9500,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSpotUploader(false);
              setClickedSpotPos(null);
            }
          }}
        >
          <div style={{
            background: C.bgCard, borderRadius: 20, width: '100%', maxWidth: 440,
            maxHeight: 'calc(100vh - 80px)', overflowY: 'auto',
            boxShadow: '0 40px 80px rgba(0,0,0,0.5)', border: `1px solid ${C.border}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '20px 24px 12px',
              position: 'sticky', top: 0, background: C.bgCard, zIndex: 1, borderRadius: '20px 20px 0 0',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, background: C.emeraldBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.emerald,
              }}>
                <Layers size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0 }}>Análise do Talhão</h3>
                <p style={{ fontSize: 12, color: C.textDim, margin: '2px 0 0' }}>
                  {selectedField.name} &middot; {clickedSpotPos.lat.toFixed(4)}, {clickedSpotPos.lng.toFixed(4)}
                </p>
              </div>
            </div>
            <div style={{ padding: '0 24px 24px' }}>
              <SpotUploader
                fieldId={selectedField.id}
                latitude={clickedSpotPos.lat}
                longitude={clickedSpotPos.lng}
                onUploadComplete={handleSpotUploaded}
                onCancel={() => { setShowSpotUploader(false); setClickedSpotPos(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* FIELD DASHBOARD MODAL */}
      {showFieldDashboard && selectedField && dashboardData && (
        <FieldDashboard
          field={selectedField}
          data={dashboardData}
          onClose={() => setShowFieldDashboard(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
