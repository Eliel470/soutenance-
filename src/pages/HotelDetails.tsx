import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hotelService } from '../services/hotelService';
import { Hotel, Room } from '../types';
import { Star, MapPin, Check, Info, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { reservationService } from '../services/reservationService';

const HotelDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [stayDays, setStayDays] = useState(0);

  const calculateStay = () => {
    if (!startDate || !endDate || !bookingRoom) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      setStayDays(days);
      setTotalPrice(bookingRoom.pricePerNight * days);
    } else {
      setStayDays(0);
      setTotalPrice(0);
    }
  };

  useEffect(() => {
    calculateStay();
  }, [startDate, endDate, bookingRoom]);

  const validateDates = () => {
    if (stayDays <= 0) {
      alert("La date de fin doit être après la date de début.");
      return false;
    }
    return true;
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !hotel || !bookingRoom || !startDate || !endDate) return;
    if (validateDates()) {
      setIsConfirming(true);
    }
  };

  const handleFinalConfirm = async () => {
    if (!user || !hotel || !bookingRoom) return;
    setBookingLoading(true);
    try {
      await reservationService.createReservation({
        clientId: user.uid,
        hotelId: hotel.id,
        roomId: bookingRoom.id,
        startDate,
        endDate,
        totalPrice,
        guestsCount: bookingRoom.capacity,
      });
      alert("Réservation effectuée avec succès !");
      setBookingRoom(null);
      setIsConfirming(false);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la réservation.");
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      const [hotelData, roomsData] = await Promise.all([
        hotelService.getHotelById(id),
        hotelService.getRooms(id)
      ]);
      setHotel(hotelData);
      setRooms(roomsData);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-20 text-center animate-pulse">Chargement des détails...</div>;
  if (!hotel) return <div className="p-20 text-center">Hôtel introuvable.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <Link to="/hotels" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest">
        <ArrowLeft className="h-4 w-4" /> Retour à l'exploration
      </Link>

      {/* Header */}
      <section className="grid md:grid-cols-2 gap-16 items-start">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="ml-2 text-[10px] font-black text-text-muted uppercase tracking-widest">{hotel.stars} Étoiles</span>
            </div>
            <h1 className="text-5xl font-black text-text-main tracking-tighter leading-tight">{hotel.name}</h1>
            <p className="flex items-center gap-2 text-text-muted text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" /> {hotel.address}, {hotel.city}
            </p>
          </div>

          <p className="text-lg text-text-muted leading-relaxed font-medium border-l-4 border-primary/20 pl-6">
            {hotel.description}
          </p>
          
          <div className="flex flex-wrap gap-3 pt-4">
            {hotel.amenities?.map((am, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-border-base text-text-main rounded-button text-xs font-bold uppercase tracking-wide shadow-sm">
                <Check className="h-3 w-3 text-emerald-500" /> {am}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-card overflow-hidden border border-border-base shadow-2xl h-[500px] group">
          <img 
            src={hotel.images?.[0] || 'https://picsum.photos/seed/hotelhero/1200/800'} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt={hotel.name}
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Rooms Section */}
      <section className="space-y-10 pt-16 border-t border-border-base">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-[10px] font-black text-primary uppercase tracking-widest">Configuration</div>
            <h2 className="text-3xl font-black text-text-main tracking-tight">Hébergements</h2>
          </div>
          <div className="text-text-muted font-bold text-xs uppercase tracking-widest">{rooms.length} Suites disponibles</div>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-card p-6 border border-border-base flex flex-col sm:flex-row gap-8 hover:shadow-xl transition-all group">
              <div className="sm:w-1/3 h-56 rounded-2xl overflow-hidden shrink-0 border border-border-base">
                <img 
                  src={room.images?.[0] || 'https://picsum.photos/seed/room/400/300'} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={room.type} 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div className="flex-grow flex flex-col justify-between py-2">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-text-main uppercase tracking-tight">{room.type}</h3>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-base rounded-lg text-text-muted text-[10px] font-bold uppercase">
                      <Users className="h-3 w-3" /> {room.capacity} Pers.
                    </div>
                  </div>
                  <p className="text-text-muted text-xs font-medium leading-relaxed line-clamp-3">
                    {room.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-border-base/40">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-primary leading-none">{formatPrice(room.pricePerNight)}</span>
                    <span className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">Par nuitée</span>
                  </div>
                  {(!profile || profile.role === 'client') && (
                    <button 
                      onClick={() => setBookingRoom(room)}
                      className="bg-primary text-white px-8 py-3 rounded-button text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                    >
                      Réserver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {bookingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-main/80 backdrop-blur-md" onClick={() => { setBookingRoom(null); setIsConfirming(false); }} />
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative bg-white rounded-card p-10 max-w-lg w-full shadow-2xl space-y-8"
          >
            {!isConfirming ? (
              <>
                <div className="space-y-3">
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest">Configuration de séjour</div>
                  <h3 className="text-3xl font-black text-text-main tracking-tight">Réserver {bookingRoom.type}</h3>
                  <p className="text-sm text-text-muted font-medium">Définissez vos dates de séjour pour {hotel.name}.</p>
                </div>

                <form onSubmit={handleInitialSubmit} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Date d'Arrivée</label>
                      <input 
                        type="date" 
                        required
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-4 bg-bg-base border border-border-base rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Date de Départ</label>
                      <input 
                        type="date" 
                        required
                        value={endDate}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-4 bg-bg-base border border-border-base rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  {!user && (
                    <div className="p-4 bg-indigo-50 rounded-xl text-primary text-xs font-bold flex gap-3 items-center border border-indigo-100 uppercase tracking-tight">
                      <Info className="h-4 w-4 shrink-0" />
                      Authentification requise pour valider
                    </div>
                  )}

                  <div className="pt-8 flex flex-col sm:flex-row gap-4 items-center border-t border-border-base/60">
                    <button 
                      type="button"
                      onClick={() => setBookingRoom(null)}
                      className="flex-1 text-text-muted font-black text-xs uppercase tracking-widest hover:text-text-main transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit"
                      disabled={!user || !startDate || !endDate}
                      className="flex-[2] bg-primary text-white py-4 px-8 rounded-button font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-900/10 active:scale-95"
                    >
                      Vérifier les détails
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // SUMMARY VIEW
              <div className="space-y-8">
                <div className="space-y-3 text-center border-b border-border-base pb-8">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-black text-text-main tracking-tight">Valider mon séjour</h3>
                  <p className="text-xs text-text-muted font-black uppercase tracking-widest">Une dernière vérification avant confirmation</p>
                </div>

                <div className="bg-bg-base border border-border-base rounded-2xl overflow-hidden divide-y divide-border-base/50">
                  <div className="p-6 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Chambre</p>
                      <p className="font-black text-text-main uppercase">{bookingRoom.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Hôtel</p>
                      <p className="font-bold text-text-main">{hotel.name}</p>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Arrivée</p>
                      <p className="font-bold text-text-main">{new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Départ</p>
                      <p className="font-bold text-text-main">{new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-primary/5 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Durée : {stayDays} nuits</p>
                      <p className="text-2xl font-black text-primary">{formatPrice(totalPrice)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleFinalConfirm}
                    disabled={bookingLoading}
                    className="w-full bg-primary text-white py-5 rounded-button font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Traitement en cours...
                      </>
                    ) : 'Confirmer et Payer'}
                  </button>
                  <button 
                    onClick={() => setIsConfirming(false)}
                    className="w-full text-text-muted py-2 font-black text-[10px] uppercase tracking-widest hover:text-text-main transition-colors"
                  >
                    Corriger les informations
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;
