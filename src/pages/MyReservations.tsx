import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reservationService } from '../services/reservationService';
import { hotelService } from '../services/hotelService';
import { Reservation, Hotel } from '../types';
import { Calendar, CreditCard, MapPin, XCircle, Clock, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MyReservations: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<(Reservation & { hotel?: Hotel })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!user) return;
      setLoading(true);
      const resData = await reservationService.getUserReservations(user.uid);
      
      // Fetch hotel details for each reservation
      const detailedRes = await Promise.all(resData.map(async (res) => {
        const hotel = await hotelService.getHotelById(res.hotelId);
        return { ...res, hotel: hotel || undefined };
      }));
      
      setReservations(detailedRes);
      setLoading(false);
    };
    fetchReservations();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment annuler cette réservation ?")) {
      await reservationService.cancelReservation(id);
      // Refresh
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    }
  };

  if (loading) return <div className="p-20 text-center">Chargement de vos séjours...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">Mes Réservations</h1>
        <p className="text-gray-500 font-medium tracking-wide prose">Historique complet de vos séjours et réservations en cours.</p>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white p-20 rounded-[40px] text-center border border-gray-100 shadow-sm space-y-4">
          <Calendar className="h-12 w-12 text-gray-200 mx-auto" />
          <h2 className="text-xl font-bold">Aucune réservation trouvée</h2>
          <p className="text-gray-500">Vous n'avez pas encore effectué de réservation sur notre plateforme.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reservations.map((res) => (
            <div key={res.id} className="bg-white border border-gray-100 rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow">
              <div className="md:w-64 h-48 md:h-auto overflow-hidden">
                <img src={res.hotel?.images?.[0] || 'https://picsum.photos/seed/res/400/400'} className="w-full h-full object-cover" alt="Hotel" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-grow p-8 flex flex-col justify-between space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-gray-900">{res.hotel?.name || 'Hôtel inconnu'}</h3>
                    <p className="text-gray-500 flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" /> {res.hotel?.city}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                    res.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                    res.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    'bg-yellow-50 text-yellow-600'
                  }`}>
                    {res.status === 'confirmed' ? <CheckCircle2 className="h-4 w-4" /> : 
                     res.status === 'cancelled' ? <XCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    {res.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-gray-50">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Séjour</div>
                    <div className="text-sm font-bold text-gray-700">du {format(new Date(res.startDate), 'dd MMM', { locale: fr })}</div>
                    <div className="text-sm font-bold text-gray-700">au {format(new Date(res.endDate), 'dd MMM', { locale: fr })}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Voyageurs</div>
                    <div className="text-sm font-bold text-gray-700">{res.guestsCount} personnes</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Prix Total</div>
                    <div className="text-sm font-bold text-blue-600">{formatPrice(res.totalPrice)}</div>
                  </div>
                  <div className="flex items-end justify-end">
                    {res.status === 'pending' && (
                      <button 
                        onClick={() => handleCancel(res.id)}
                        className="text-red-500 font-bold text-xs hover:underline uppercase"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReservations;
