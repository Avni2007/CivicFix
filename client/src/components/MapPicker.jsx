import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { MapPin, Search, Navigation, Loader2 } from 'lucide-react';

// Custom Leaflet Pin Icon
const pinIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function MapEventsHandler({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      onSelectLocation(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function MapPicker({ locationData, onChangeLocation }) {
  const [position, setPosition] = useState([locationData.lat || 28.6139, locationData.lng || 77.2090]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (locationData.lat && locationData.lng) {
      setPosition([locationData.lat, locationData.lng]);
    }
  }, [locationData.lat, locationData.lng]);

  const fetchAddressFromCoords = async (lat, lng) => {
    setGeocoding(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (res.data) {
        const address = res.data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        const city = res.data.address?.city || res.data.address?.town || res.data.address?.state || 'Metro City';
        const area = res.data.address?.suburb || res.data.address?.neighbourhood || 'Central Area';
        
        onChangeLocation({ address, lat, lng, city, area });
      }
    } catch (err) {
      onChangeLocation({
        address: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        lat,
        lng,
        city: 'Metro City',
        area: 'Selected Zone'
      });
    } finally {
      setGeocoding(false);
    }
  };

  const handleSelectLocation = (lat, lng) => {
    setPosition([lat, lng]);
    fetchAddressFromCoords(lat, lng);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      if (res.data && res.data.length > 0) {
        const first = res.data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        handleSelectLocation(lat, lng);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleSelectLocation(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => alert('Could not get current location: ' + err.message)
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Geolocation Button */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search street, landmark or area name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
          >
            {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleCurrentLocation}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
        >
          <Navigation className="w-3.5 h-3.5" /> Use My Location
        </button>
      </div>

      {/* Map Container */}
      <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner relative">
        <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={position} />
          <Marker position={position} icon={pinIcon} />
          <MapEventsHandler onSelectLocation={handleSelectLocation} />
        </MapContainer>

        {geocoding && (
          <div className="absolute top-3 right-3 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-lg shadow border text-xs font-semibold flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" /> Fetching address...
          </div>
        )}
      </div>

      {/* Coordinates readout */}
      <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center gap-2 truncate pr-2">
          <MapPin className="w-4 h-4 text-sky-500 shrink-0" />
          <span className="font-medium truncate">{locationData.address || 'Click on map to select location'}</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          Lat: {position[0].toFixed(5)} | Lng: {position[1].toFixed(5)}
        </div>
      </div>
    </div>
  );
}
