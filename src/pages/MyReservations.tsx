import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reservationService } from '../services/reservationService';
import { Reservation } from '../types';
import { 
  Calendar, 
  MapPin, 
  XCircle, 
  Clock, 
  CheckCircle2, 
  Download, 
  Star, 
  Loader2,
  AlertCircle,
  MessageSquare,
  Send,
  X
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { formatPrice } from '../lib/utils';
import { reviewService } from '../services/reviewService';
import { hotelService } from '../services/hotelService';

const MyReservations: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchReservations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const resData = await reservationService.getUserReservations(user.id);
      setReservations(resData);
    } catch (err) {
      setError("Impossible de charger vos réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (window.confirm("Voulez-vous vraiment annuler cette réservation ?")) {
      try {
        await reservationService.updateReservationStatus(id, 'annulee');
        // Mise à jour locale pour éviter le re-chargement complet
        setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: 'annulee' } : r));
      } catch (err) {
        alert("Erreur lors de l'annulation. Veuillez réessayer.");
      }
    }
  };

  const calculateTotal = (res: Reservation) => {
    if (!res.chambre_prix) return 0;
    const days = differenceInDays(new Date(res.date_depart), new Date(res.date_arrivee));
    const totalDays = days <= 0 ? 1 : days;
    return totalDays * res.chambre_prix;
  };

  const isStayFinished = (dateDepart: string) => {
    return new Date(dateDepart) < new Date();
  };

  const handleDownloadInvoice = (res: Reservation) => {
    alert(`Génération de la facture pour le séjour à ${res.hotel_nom}...\n(Fonctionnalité de simulation pour la soutenance)`);
  };

  const handleOpenReviewModal = (res: Reservation) => {
    setSelectedReservation(res);
    setRating(5);
    setComment('');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedReservation) return;

    setIsSubmittingReview(true);
    try {
      if (!selectedReservation.hotel_id) {
         throw new Error("ID de l'hôtel manquant");
      }

      await reviewService.addReview({
        chambre_id: selectedReservation.chambre_id,
        user_id: user.id,
        note: rating,
        commentaire: comment
      });

      alert("Merci ! Votre avis a été enregistré.");
      setIsReviewModalOpen(false);
    } catch (err) {
      alert("Erreur lors de l'enregistrement de l'avis.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-text-muted font-bold text-xs uppercase tracking-widest">Chargement de vos voyages...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border-base pb-10">
        <div className="space-y-2">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Carnet de Voyage</div>
          <h1 className="text-5xl font-black text-text-main tracking-tighter leading-none">Mes Réservations</h1>
          <p className="text-text-muted text-sm font-medium">Gérez vos séjours passés et à venir dans tout le Bénin.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-border-base shadow-sm">
          <div className="text-right">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Total Séjours</p>
            <p className="text-lg font-black text-text-main">{reservations.length}</p>
          </div>
          <div className="h-8 w-px bg-border-base mx-2" />
          <Calendar className="h-5 w-5 text-primary" />
        </div>
      </header>

      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="bg-white p-32 rounded-[3rem] text-center border-2 border-dashed border-border-base space-y-6">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-text-muted/30">
            <Calendar className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-text-main">Aucun voyage prévu ?</h2>
            <p className="text-text-muted text-sm max-w-xs mx-auto">Explorez nos hôtels partenaires et commencez votre aventure béninoise dès aujourd'hui.</p>
          </div>
          <div className="pt-4">
            <a href="/hotels" className="inline-flex px-8 py-3 bg-primary text-white rounded-button font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/10 active:scale-95">
               Parcourir les hôtels
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-8">
          {reservations.map((res, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={res.id} 
              className="bg-white border border-border-base rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="lg:w-80 h-64 lg:h-auto overflow-hidden relative">
                <img 
                  src={`https://picsum.photos/seed/hotel-${res.id}/800/600`} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={res.hotel_nom} 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="flex-grow p-10 flex flex-col justify-between space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-3xl font-black text-text-main tracking-tighter">{res.hotel_nom}</h3>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        res.statut === 'confirmee' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        res.statut === 'annulee' ? 'bg-red-50 text-red-600 border border-red-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {res.statut === 'confirmee' ? <CheckCircle2 className="h-3 w-3" /> : 
                         res.statut === 'annulee' ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {res.statut}
                      </div>
                    </div>
                    <p className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                      <Star className="h-3 w-3 fill-primary" /> {res.chambre_type}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Montant Total</p>
                    <p className="text-2xl font-black text-text-main">{formatPrice(calculateTotal(res))}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-border-base items-end">
                  <div>
                    <div className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" /> Période
                    </div>
                    <div className="text-sm font-bold text-text-main flex flex-col">
                      <span>du {format(new Date(res.date_arrivee), 'dd MMMM yyyy', { locale: fr })}</span>
                      <span className="text-text-muted text-[10px]">au {format(new Date(res.date_depart), 'dd MMMM yyyy', { locale: fr })}</span>
                    </div>
                  </div>

                  <div className="md:col-span-3 flex flex-wrap justify-end gap-3">
                    {/* Annonce pour la soutenance: Simulation de facture */}
                    <button 
                      onClick={() => handleDownloadInvoice(res)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-text-main border border-border-base rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
                    >
                      <Download className="h-3.5 w-3.5" /> Facture
                    </button>

                    {/* Laisser un avis si le séjour est terminé */}
                    {isStayFinished(res.date_depart) && res.statut === 'confirmee' && (
                      <button 
                        onClick={() => handleOpenReviewModal(res)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all active:scale-95"
                      >
                        <Star className="h-3.5 w-3.5" /> Laisser un avis
                      </button>
                    )}

                    {/* Annulation si en attente */}
                    {res.statut === 'en_attente' && (
                      <button 
                        onClick={() => handleCancel(res.id)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Annuler mon séjour
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && selectedReservation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-text-main/60 backdrop-blur-sm"
              onClick={() => setIsReviewModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Partage d'expérience</div>
                  <h3 className="text-3xl font-black text-text-main tracking-tight">Donnez votre avis</h3>
                  <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Sur votre séjour à {selectedReservation.hotel_nom}</p>
                </div>
                <button 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-text-muted" />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block text-center">Quelle note donneriez-vous ?</label>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          className={`h-10 w-10 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Votre commentaire</label>
                  <textarea 
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-6 bg-bg-base border border-border-base rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all placeholder:text-text-muted/40"
                    placeholder="Qu'avez-vous particulièrement apprécié ? (confort, service, emplacement...)"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-5 bg-amber-500 text-white rounded-button font-black text-xs uppercase tracking-widest hover:bg-amber-600 shadow-xl shadow-amber-900/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isSubmittingReview ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Envoyer mon avis
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyReservations;
