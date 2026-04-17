import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Building2, 
  MapPin, 
  Info, 
  Plus, 
  Loader2, 
  ArrowRight,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { hotelService } from '../services/hotelService';

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const CreateHotel: React.FC = () => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: 'Cotonou',
    stars: 3,
  });

  const [position, setPosition] = useState<L.LatLng | null>(new L.LatLng(6.365, 2.418)); // Default Cotonou

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await hotelService.createHotel({
        ...formData,
        managerId: user.uid,
        images: ["https://picsum.photos/seed/newhotel/800/600"],
        amenities: ["WiFi"],
        coordinates: position ? { lat: position.lat, lng: position.lng } : undefined,
      });
      navigate('/gerant/dashboard');
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création de l'hôtel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
            Configuration initiale
          </div>
          <h1 className="text-4xl font-black text-text-main tracking-tight">Créez votre premier hôtel</h1>
          <p className="text-text-muted max-w-lg mx-auto font-medium">
            Pour commencer en tant que gérant, vous devez enregistrer au moins un établissement sur la plateforme.
          </p>
        </header>

        {/* Steps Path */}
        <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-1 items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step >= i ? 'bg-primary text-white' : 'bg-gray-200 text-text-muted'
              }`}>
                {i}
              </div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                step > i ? 'bg-primary' : 'bg-gray-200'
              }`} />
            </div>
          ))}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
            step === 3 ? 'bg-primary text-white' : 'bg-gray-200 text-text-muted'
          }`}>
            3
          </div>
        </div>

        <div className="bg-white rounded-card border border-border-base shadow-2xl overflow-hidden relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 space-y-8"
              >
                <div className="flex items-center gap-3 border-b border-border-base pb-6">
                  <div className="p-3 bg-indigo-50 text-primary rounded-xl">
                    <Info className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-text-main">Détails généraux</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Nom de l'établissement</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                      placeholder="Ex: Bénin Royal Hôtel"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                      placeholder="Décrivez votre hôtel, ses services et son ambiance..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Étoiles</label>
                    <select 
                      value={formData.stars}
                      onChange={(e) => setFormData({...formData, stars: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-gray-50 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                    >
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Étoiles</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    disabled={!formData.name || !formData.description}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-button font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    Suivant <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-10 space-y-8"
              >
                <div className="flex items-center gap-3 border-b border-border-base pb-6">
                  <div className="p-3 bg-indigo-50 text-primary rounded-xl">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-text-main">Localisation exacte</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Ville</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Adresse physique</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                      placeholder="Ex: Rue du Commerce, Ganhi"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1 flex justify-between">
                    <span>Cliquez sur la carte pour définir la position</span>
                    {position && <span className="text-primary italic font-bold">Position définie ✓</span>}
                  </label>
                  <div className="h-[300px] rounded-xl overflow-hidden border border-border-base z-0">
                    <MapContainer center={[6.365, 2.418]} zoom={13} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-4 text-text-muted font-bold text-xs uppercase tracking-widest hover:text-text-main transition-colors"
                  >
                    Retour
                  </button>
                  <button
                    disabled={!formData.address || !position}
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-button font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    Finaliser & Publier
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CreateHotel;
