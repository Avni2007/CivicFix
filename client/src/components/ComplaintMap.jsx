import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Eye, Layers, Flame, MapPin } from 'lucide-react';

const createColorMarker = (priority) => {
  let color = '#10b981'; // LOW emerald
  if (priority === 'CRITICAL') color = '#f43f5e'; // rose
  if (priority === 'HIGH') color = '#f97316'; // orange
  if (priority === 'MEDIUM') color = '#f59e0b'; // amber

  const svgHtml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svgHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 6, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function ComplaintMap({ complaints = [], height = "500px", center, zoom }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('markers'); // 'markers' | 'heatmap'

  // Default to Pan-India center coordinates if not specified
  const mapCenter = center || (complaints.length === 1 && complaints[0].location?.lat
    ? [complaints[0].location.lat, complaints[0].location.lng]
    : [22.9734, 78.6569]);
  
  const mapZoom = zoom || (complaints.length === 1 ? 13 : 5);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl" style={{ height }}>
      
      {/* Layer Toggle Control */}
      <div className="absolute top-4 right-4 z-[1000] glass-panel rounded-xl p-1.5 flex gap-1 shadow-lg border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setViewMode('markers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            viewMode === 'markers' ? 'bg-sky-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> Markers
        </button>
        <button
          onClick={() => setViewMode('heatmap')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            viewMode === 'heatmap' ? 'bg-rose-600 text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5" /> Heatmap Density
        </button>
      </div>

      <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
        <MapViewController center={mapCenter} zoom={mapZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {viewMode === 'markers' && complaints.map(c => {
          if (!c.location || !c.location.lat || !c.location.lng) return null;
          return (
            <Marker 
              key={c._id} 
              position={[c.location.lat, c.location.lng]} 
              icon={createColorMarker(c.priority)}
            >
              <Popup className="custom-popup">
                <div className="p-1 space-y-2 max-w-xs font-sans">
                  {c.images && c.images.length > 0 && (
                    <img 
                      src={c.images[0]} 
                      alt={c.title} 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-sky-600 dark:text-sky-400 font-mono">{c.complaintId}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h4 className="font-bold text-xs line-clamp-1 text-slate-900">{c.title}</h4>
                  <div className="flex items-center justify-between">
                    <StatusBadge status={c.status} />
                    <span className="text-[10px] text-slate-500">{c.category}</span>
                  </div>
                  {c.location?.city && (
                    <p className="text-[10px] text-slate-400 truncate">{c.location.city}, {c.location.state || 'India'}</p>
                  )}
                  <button
                    onClick={() => navigate(`/complaints/${c._id}`)}
                    className="w-full mt-1 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Heatmap Density Circles Representation */}
        {viewMode === 'heatmap' && complaints.map(c => {
          if (!c.location || !c.location.lat || !c.location.lng) return null;
          const radius = c.priority === 'CRITICAL' ? 35 : (c.priority === 'HIGH' ? 25 : 15);
          const color = c.priority === 'CRITICAL' ? '#f43f5e' : (c.priority === 'HIGH' ? '#f97316' : '#f59e0b');

          return (
            <CircleMarker
              key={c._id}
              center={[c.location.lat, c.location.lng]}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.35,
                weight: 1
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
