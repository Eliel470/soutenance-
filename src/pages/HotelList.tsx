import React, { useEffect, useState } from 'react';
import { hotelService } from '../services/hotelService';
import { Hotel } from '../types';
import { Star, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { formatPrice } from '../lib/utils';
import { motion } from 'motion/react';

const HotelList: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const cityQuery = searchParams.get('city');

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      const data = await hotelService.getHotels(cityQuery || undefined);
      setHotels(data);
      setLoading(false);
    };
    fetchHotels();
  }, [cityQuery]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="bg-gray-200 h-64 rounded-3xl" />
              <div className="h-6 bg-gray-200 w-3/4 rounded" />
              <div className="h-4 bg-gray-200 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
            {cityQuery ? `Hôtels à ${cityQuery}` : 'Explorer nos résidences'}
          </h1>
          <p className="text-sm text-text-muted font-bold uppercase tracking-widest leading-none pt-1">Découvrez {hotels.length} établissements</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher une destination..." 
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-border-base rounded-button text-sm focus:ring-1 focus:ring-primary outline-none transition-shadow"
            />
          </div>
          <button className="p-2.5 bg-white border border-border-base rounded-button hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="h-5 w-5 text-text-muted" />
          </button>
        </div>
      </div>

      {hotels.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-card border border-border-base border-dashed space-y-4">
          <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-text-muted opacity-40">
            <Search className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-text-main">Aucun hôtel trouvé</h2>
          <p className="text-sm text-text-muted">La recherche n'a retourné aucun résultat pour cette ville.</p>
          <Link to="/hotels" className="inline-block text-primary font-bold text-sm hover:underline">Voir tous les hôtels</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {hotels.map((hotel, index) => (
            <motion.div
              key={hotel.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-card overflow-hidden border border-border-base shadow-sm hover:shadow-lg transition-all duration-400 flex flex-col"
            >
              <div className="relative h-60 overflow-hidden bg-gray-100">
                <img 
                  src={hotel.images?.[0] || 'https://picsum.photos/seed/hotel/800/600'} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={hotel.name}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-white/95 backdrop-blur shadow-sm px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-black text-[10px] uppercase tracking-tighter">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span>{hotel.stars} ÉToiles</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                    {hotel.city}
                  </div>
                  <h3 className="text-xl font-extrabold text-text-main leading-tight group-hover:text-primary transition-colors">
                    {hotel.name}
                  </h3>
                  <p className="text-text-muted text-xs font-medium leading-relaxed line-clamp-2 pt-2">
                    {hotel.description}
                  </p>
                </div>

                <div className="pt-4 flex items-end justify-between border-t border-border-base/40">
                   <div className="space-y-0.5">
                     <span className="block text-[10px] text-text-muted font-black uppercase tracking-widest">À partir de</span>
                     <span className="text-lg font-black text-text-main">{formatPrice(95)}</span>
                   </div>
                   <Link 
                    to={`/hotels/${hotel.id}`} 
                    className="bg-primary text-white px-5 py-2.5 rounded-button text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                   >
                     Voir l'hôtel
                   </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelList;
