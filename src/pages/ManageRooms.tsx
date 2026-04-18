import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hotelService } from '../services/hotelService';
import { Room, Hotel } from '../types';
import { formatPrice } from '../lib/utils';
import { 
  Bed, 
  Plus, 
  Trash2, 
  Settings2, 
  ChevronLeft, 
  Loader2,
  Users,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ManageRooms: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    numero: '',
    type: 'Standard',
    prix: 0,
    capacite: 2,
    description: '',
    statut: 'libre'
  });

  const fetchRooms = async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const h = await hotelService.getHotelById(hotelId);
      setHotel(h);
      const r = await hotelService.getRooms(hotelId);
      setRooms(r);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotelId]);

  const handleOpenModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        numero: room.numero,
        type: room.type,
        prix: room.prix,
        capacite: room.capacite,
        description: room.description || '',
        statut: room.statut
      });
    } else {
      setEditingRoom(null);
      setFormData({
        numero: '',
        type: 'Standard',
        prix: 0,
        capacite: 2,
        description: '',
        statut: 'libre'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelId) return;

    try {
      if (editingRoom) {
        await hotelService.updateRoom(hotelId, editingRoom.id, formData);
      } else {
        await hotelService.addRoom(hotelId, formData);
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer cette chambre ?")) {
      try {
        await hotelService.deleteRoom(hotelId, id);
        fetchRooms();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-base">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <header className="space-y-6">
        <Link to="/gerant/dashboard" className="inline-flex items-center gap-2 text-text-muted hover:text-primary font-bold text-xs uppercase tracking-widest transition-colors mb-4">
          <ChevronLeft className="h-4 w-4" /> Retour Dashboard
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{hotel?.nom}</div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter leading-none">Gestion des Chambres</h1>
            <p className="text-text-muted text-sm font-medium">Définissez vos types de chambres, vos prix et vos capacités.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-text-main text-white rounded-button font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95"
          >
            <Plus className="h-4 w-4" /> Nouvelle Chambre
          </button>
        </div>
      </header>

      {/* Rooms Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <motion.div 
            layout
            key={room.id} 
            className="bg-white rounded-[2.5rem] border border-border-base overflow-hidden flex flex-col shadow-sm group hover:border-primary/20 transition-all hover:shadow-2xl hover:shadow-primary/5"
          >
            <div className="relative h-48 bg-gray-50 overflow-hidden">
              <img 
                src={room.image || `https://picsum.photos/seed/room-${room.id}/600/400`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={room.type} 
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-widest ${
                  room.statut === 'libre' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {room.statut}
                </span>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleOpenModal(room)}
                  className="p-2 bg-white/90 backdrop-blur-sm text-text-muted hover:text-primary rounded-xl transition-all hover:scale-110 shadow-sm"
                >
                  <Settings2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(room.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm text-text-muted hover:text-red-500 rounded-xl transition-all hover:scale-110 shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-text-main tracking-tight leading-none mb-2">{room.type}</h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> N°{room.numero}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {room.capacite} Personnes</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary leading-none">{formatPrice(room.prix)}</span>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">par nuit</p>
                </div>
              </div>
              
              <p className="text-sm text-text-muted leading-relaxed flex-grow">
                {room.description || "Aucune description fournie pour cette chambre."}
              </p>
            </div>
          </motion.div>
        ))}
        
        {rooms.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3 py-32 flex flex-col items-center justify-center bg-gray-50/50 border-2 border-dashed border-border-base rounded-[3rem] text-center space-y-4">
            <div className="bg-white p-6 rounded-full shadow-sm text-text-muted/30">
              <Bed className="h-12 w-12" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-text-main">Aucune chambre répertoriée</p>
              <p className="text-sm text-text-muted">Commencez par ajouter votre premier type de chambre.</p>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="mt-4 px-6 py-3 bg-white border border-border-base rounded-button text-xs font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
            >
              Ajouter une chambre
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-text-main/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="px-10 py-8 border-b border-border-base">
                <h2 className="text-2xl font-black text-text-main tracking-tight">
                  {editingRoom ? 'Modifier la Chambre' : 'Nouvelle Chambre'}
                </h2>
                <p className="text-sm text-text-muted font-medium mt-1">Saisissez les informations techniques de l'hébergement.</p>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Numéro / Nom</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-5 py-3.5 bg-bg-base border border-border-base rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                      placeholder="Ex: 101 ou A-1"
                      value={formData.numero}
                      onChange={(e) => setFormData({...formData, numero: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Type de Chambre</label>
                    <select
                      className="w-full px-5 py-3.5 bg-bg-base border border-border-base rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold appearance-none"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option>Standard</option>
                      <option>Double</option>
                      <option>Suite Junior</option>
                      <option>Suite Royale</option>
                      <option>Hôtel Case (Bénin)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Prix par Nuit (XOF)</label>
                    <div className="relative">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                      <input 
                        required
                        type="number"
                        className="w-full pl-11 pr-5 py-3.5 bg-bg-base border border-border-base rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                        placeholder="25000"
                        value={formData.prix}
                        onChange={(e) => setFormData({...formData, prix: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Capacité (Personnes)</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                      <input 
                        required
                        type="number"
                        className="w-full pl-11 pr-5 py-3.5 bg-bg-base border border-border-base rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                        placeholder="2"
                        value={formData.capacite}
                        onChange={(e) => setFormData({...formData, capacite: parseInt(e.target.value) || 1})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Description & Services</label>
                  <textarea 
                    rows={3}
                    className="w-full px-5 py-4 bg-bg-base border border-border-base rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium leading-relaxed"
                    placeholder="Lits king size, TV 4K, douche à l'italienne..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 border border-border-base text-text-muted rounded-button font-black text-xs uppercase tracking-widest hover:bg-bg-base transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white rounded-button font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageRooms;
