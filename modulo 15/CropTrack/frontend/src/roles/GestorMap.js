import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const STATUS = {
  liberado: { color: '#34d399', label: 'Liberado' },
  coletado: { color: '#f59e0b', label: 'Coletado' },
  validado: { color: '#60a5fa', label: 'Validado' },
};

// Clique no mapa (fora do modo desenho) → libera um spot ali
function ClickToRelease({ active, onRelease }) {
  useMapEvents({ click: (e) => { if (active) onRelease(e.latlng.lat, e.latlng.lng); } });
  return null;
}

// Recentraliza ao trocar de talhão/fazenda
function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom(), { animate: true });
  }, [map, center]);
  return null;
}

// Desenho do polígono do talhão (leaflet-draw)
function AreaDrawer({ active, onComplete }) {
  const map = useMap();
  const handlerRef = useRef(null);

  useEffect(() => {
    if (!map || !active) return undefined;
    const drawn = new L.FeatureGroup();
    map.addLayer(drawn);
    const handler = new L.Draw.Polygon(map, {
      allowIntersection: false,
      showArea: true,
      shapeOptions: { color: '#34d399', fillColor: '#34d399', fillOpacity: 0.12, weight: 3 },
    });
    handlerRef.current = handler;
    handler.enable();

    const onCreated = (e) => {
      const ll = e.layer.getLatLngs()[0].map((p) => [p.lat, p.lng]);
      onComplete(ll);
    };
    map.on(L.Draw.Event.CREATED, onCreated);

    return () => {
      if (handlerRef.current) handlerRef.current.disable();
      map.off(L.Draw.Event.CREATED, onCreated);
      map.removeLayer(drawn);
    };
  }, [map, active, onComplete]);

  return null;
}

export default function GestorMap({ spots, area, center, drawing, onRelease, onAreaComplete }) {
  return (
    <MapContainer
      center={center || [-21.1350, -44.2621]}
      zoom={16}
      zoomControl={false}
      attributionControl={false}
      doubleClickZoom={false}
      style={{ height: '100%', width: '100%', background: '#0e0f15', cursor: drawing ? 'crosshair' : 'pointer' }}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        maxZoom={19}
      />

      {area && area.length > 2 && (
        <Polygon positions={area} pathOptions={{ color: '#34d399', weight: 2, fillOpacity: 0.06 }} />
      )}

      <Recenter center={center} />
      <ClickToRelease active={!drawing} onRelease={onRelease} />
      <AreaDrawer active={drawing} onComplete={onAreaComplete} />

      {spots.filter((s) => s.lat && s.lng).map((s) => {
        const st = STATUS[s.status] || STATUS.liberado;
        return (
          <CircleMarker
            key={s.id}
            center={[s.lat, s.lng]}
            radius={7}
            pathOptions={{ color: '#0e0f15', weight: 2, fillColor: st.color, fillOpacity: 1 }}
          >
            <Tooltip direction="top" offset={[0, -6]}>{s.point} · {st.label}</Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
