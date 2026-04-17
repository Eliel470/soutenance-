import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hotelService } from '../services/hotelService';
import { reservationService } from '../services/reservationService';
import { Hotel as HotelType, Reservation, Room } from '../types';
import { 
  Building2, 
  CalendarCheck2, 
  Plus, 
  TrendingUp, 
  Loader2, 
  Database,
  Trash2,
  ExternalLink,
  Users,
  Image as ImageIcon
} from 'lucide-react';
import { seedDatabase } from '../services/seedService';
import { formatPrice } from '../lib/utils';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Modal from '../components/common/Modal';
import PhotoManager from '../components/hotel/PhotoManager';

const GerantDashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotelForPhotos, setSelectedHotelForPhotos] = useState<HotelType | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [hotelsData, reservationsData] = await Promise.all([
      hotelService.getHotels(), // In real app, filter by managerId: where('managerId', '==', user.uid)
      reservationService.getUserReservations(user.uid) // Placeholder, should fetch hotel reservations
    ]);
    
    // Filter hotels to show only those managed by current gérant
    const managedHotels = hotelsData.filter(h => h.managerId === user.uid);
    setHotels(managedHotels);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSeed = async () => {
    await seedDatabase();
    fetchData();
  };

  const handleDeleteHotel = async (id: string) => {
    if (window.confirm("Supprimer cet hôtel ?")) {
      await hotelService.deleteHotel(id);
      fetchData();
    }
  };

  const stats = [
    { label: "Mes Hôtels", value: hotels.length, icon: Building2, color: "blue" },
    { label: "Réservations", value: reservations.length, icon: CalendarCheck2, color: "green" },
    { label: "Chambres Totales", value: hotels.length * 2, icon: TrendingUp, color: "indigo" }, // Estimate
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Système Informatique / Soutenance Licence</div>
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Vue d'ensemble Gérant</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSeed}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-border-base text-text-muted rounded-button font-bold hover:bg-gray-50 transition-all text-sm"
          >
            <Database className="h-4 w-4" /> Initialiser Demo
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-button font-bold hover:bg-indigo-700 transition-all shadow-sm text-sm">
            <Plus className="h-4 w-4" /> Ajouter un Hôtel
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="stats-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Revenu Total (Mois)", value: "12 450,00 €", change: "↑ 12% vs mois dernier", color: "emerald" },
          { label: "Réservations Actives", value: "42", change: "8 arrivées aujourd'hui", color: "indigo" },
          { label: "Taux d'Occupation", value: "84.2%", change: "+5.4% ce weekend", color: "indigo" },
          { label: "Avis Clients", value: "4.8 / 5", change: "12 nouveaux avis", color: "amber" },
        ].map((stat, i) => (
          <div key={i} className="stat-card bg-white p-6 rounded-card border border-border-base transition-shadow hover:shadow-md">
            <p className="stat-label text-xs font-bold text-text-muted uppercase tracking-wider mb-2">{stat.label}</p>
            <p className="stat-value text-2xl font-black text-text-main">{stat.value}</p>
            <p className={`stat-change text-[11px] font-bold mt-2 text-${stat.color}-600`}>{stat.change}</p>
          </div>
        ))}
      </section>

      {/* Hotel Management */}
      <section className="content-card bg-white rounded-card border border-border-base overflow-hidden flex flex-col shadow-sm">
        <div className="card-header p-6 border-b border-border-base flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Dernières Réservations
          </h2>
          <button className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-button hover:bg-indigo-700 transition-colors">
            Exporter .XLSX
          </button>
        </div>
        
        <div className="table-container overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-base">
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-base">ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-base">Hôtel</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-base">Ville</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-base">Statut</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-base text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {hotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-primary">#{hotel.id.substring(0, 6)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border-base">
                        <img src={hotel.images?.[0]} className="w-full h-full object-cover" alt={hotel.name} />
                      </div>
                      <span className="font-bold text-text-main text-sm">{hotel.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted font-medium">{hotel.city}</td>
                  <td className="px-6 py-4">
                    <span className="badge-success bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Actif
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedHotelForPhotos(hotel)}
                        className="p-2 hover:bg-emerald-50 text-text-muted hover:text-emerald-600 rounded-lg transition-colors"
                        title="Gérer les photos"
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                      <Link to={`/hotels/${hotel.id}`} className="p-2 hover:bg-indigo-50 text-text-muted hover:text-primary rounded-lg transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button onClick={() => handleDeleteHotel(hotel.id)} className="p-2 hover:bg-red-50 text-text-muted hover:text-red-500 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {hotels.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-text-muted italic">
                      <Building2 className="h-12 w-12 opacity-20" />
                      Aucune donnée disponible. Initialisez la démo pour commencer.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Photo Management Modal */}
      <Modal
        isOpen={selectedHotelForPhotos !== null}
        onClose={() => setSelectedHotelForPhotos(null)}
        title={`Photos - ${selectedHotelForPhotos?.name}`}
      >
        {selectedHotelForPhotos && (
          <PhotoManager 
            hotel={selectedHotelForPhotos} 
            onUpdate={fetchData} 
          />
        )}
      </Modal>
    </div>
  );
};

export default GerantDashboard;
