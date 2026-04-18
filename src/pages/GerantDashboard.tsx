import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hotelService } from '../services/hotelService';
import { reservationService } from '../services/reservationService';
import { Hotel as HotelType, Reservation } from '../types';
import { 
  Building2, 
  Plus, 
  Loader2, 
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Bed
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const GerantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch hotels managed by this user
      const managedHotels = await hotelService.getManagerHotels(user.id);
      setHotels(managedHotels);

      // Fetch all reservations for these hotels
      const hotelReservations = await reservationService.getReservationsByManager(user.id);
      setReservations(hotelReservations);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleDeleteHotel = async (id: string) => {
    if (window.confirm("Supprimer cet hôtel ?")) {
      await hotelService.deleteHotel(id);
      fetchData();
    }
  };

  const handleUpdateStatus = async (resId: string, status: string) => {
    try {
      await reservationService.updateReservationStatus(resId, status);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Espace Gérant d'Hôtel</div>
          <h1 className="text-4xl font-black text-text-main tracking-tighter">Mon Dashboard</h1>
          <p className="text-text-muted text-sm font-medium">Gérez vos établissements et vos réservations en un seul endroit.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/gerant/setup" className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-button font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 active:scale-95">
            <Plus className="h-4 w-4" /> Ajouter un Établissement
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Hôtels Actifs", value: hotels.length, icon: Building2, color: "indigo" },
          { label: "Réservations", value: reservations.length, icon: Clock, color: "emerald" },
          { label: "En attente", value: reservations.filter(r => r.statut === 'en_attente').length, icon: Clock, color: "amber" },
          { label: "Revenu Estimé", value: "---", icon: Building2, color: "blue" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-border-base shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-text-main">{stat.value}</p>
            </div>
            <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Hotels List */}
        <section className="lg:col-span-1 space-y-6">
          <h2 className="text-lg font-black text-text-main uppercase tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Mes Hôtels
          </h2>
          <div className="space-y-4">
            {hotels.map(hotel => (
              <div key={hotel.id} className="bg-white p-5 rounded-3xl border border-border-base flex items-center justify-between group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-border-base">
                    <img src={`https://picsum.photos/seed/${hotel.id}/100/100`} className="w-full h-full object-cover" alt={hotel.nom} />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main text-sm">{hotel.nom}</h3>
                    <p className="text-[10px] text-text-muted font-medium uppercase">{hotel.adresse}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link 
                    to={`/gerant/hotels/${hotel.id}/rooms`} 
                    className="p-2 hover:bg-emerald-50 text-text-muted hover:text-emerald-600 rounded-lg transition-colors"
                    title="Gérer les chambres"
                  >
                    <Bed className="h-4 w-4" />
                  </Link>
                  <Link to={`/hotels/${hotel.id}`} className="p-2 hover:bg-indigo-50 text-text-muted hover:text-primary rounded-lg transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button onClick={() => handleDeleteHotel(hotel.id)} className="p-2 hover:bg-red-50 text-text-muted hover:text-red-500 rounded-lg transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {hotels.length === 0 && (
              <div className="p-10 border-2 border-dashed border-border-base rounded-3xl text-center text-text-muted italic text-sm">
                Aucun hôtel enregistré.
              </div>
            )}
          </div>
        </section>

        {/* Recent Reservations */}
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-black text-text-main uppercase tracking-tight flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Réservations Récentes
          </h2>
          <div className="bg-white rounded-3xl border border-border-base overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg-base border-b border-border-base">
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Séjour</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest">Statut</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-base">
                {reservations.map(res => (
                  <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-main">{res.client_prenom} {res.client_nom}</span>
                        <span className="text-[10px] text-text-muted font-bold uppercase">{res.hotel_nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-text-main">
                        {format(new Date(res.date_arrivee), 'dd MMM', { locale: fr })} - {format(new Date(res.date_depart), 'dd MMM', { locale: fr })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        res.statut === 'confirmee' ? 'bg-green-50 text-green-600' :
                        res.statut === 'annulee' ? 'bg-red-50 text-red-600' :
                        'bg-yellow-50 text-yellow-600'
                      }`}>
                        {res.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {res.statut === 'en_attente' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(res.id, 'confirmee')}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Confirmer"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(res.id, 'annulee')}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Annuler"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-text-muted italic text-sm">
                      Aucune réservation pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GerantDashboard;
