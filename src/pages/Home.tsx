import React from 'react';
import { ArrowRight, Star, ShieldCheck, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden bg-text-main">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1549294413-26f195200c16?q=80&w=1920&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
            alt="Benin Luxury Hotel"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-text-main/20 to-text-main/80" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 space-y-10">
          <div className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">L'excellence de l'hospitalité au Bénin</div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
            Escales <span className="underline decoration-primary decoration-8 underline-offset-8 italic">Béninoises</span>.
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
            Découvrez une sélection exclusive de résidences et hôtels de luxe, du sud balnéaire au nord mythique du Bénin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link 
              to="/hotels" 
              className="px-10 py-4 bg-primary text-white rounded-button font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 active:scale-95"
            >
              Explorer les hôtels <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-10">
        {[
          { icon: ShieldCheck, title: "Paiement Sécurisé", desc: "Transactions protégées par cryptage SSL de pointe." },
          { icon: Star, title: "Qualité Garantie", desc: "Inspection régulière de chaque établissement partenaire." },
          { icon: Clock, title: "Réservation Instantanée", desc: "Confirmation temps-réelle sans attente inutile." },
        ].map((feature, i) => (
          <div key={i} className="group p-10 bg-white rounded-card border border-border-base transition-all hover:border-primary/30 hover:shadow-xl">
            <div className="p-4 bg-bg-base rounded-2xl text-primary w-fit mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-text-main uppercase tracking-tight mb-2">{feature.title}</h3>
            <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Featured Destinations */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border-base pb-8">
          <div className="space-y-1">
            <div className="text-[10px] font-black text-primary uppercase tracking-widest">Inspiration Locale</div>
            <h2 className="text-4xl font-black text-text-main tracking-tight">Nos Villes Phares</h2>
          </div>
          <Link to="/hotels" className="text-text-muted text-xs font-black uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
            Voir tout le catalogue Bénin <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { name: 'Cotonou', seed: 'cotonou' },
            { name: 'Ouidah', seed: 'ouidah' },
            { name: 'Grand-Popo', seed: 'shack' },
            { name: 'Natitingou', seed: 'mountain' }
          ].map((city, i) => (
            <Link key={i} to={`/hotels?city=${city.name}`} className="group relative h-[400px] rounded-card overflow-hidden border border-border-base transition-all hover:shadow-2xl">
              <img 
                src={`https://picsum.photos/seed/${city.seed}/600/800`} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                alt={city.name}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-text-main/90 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-8 left-8 text-white space-y-1">
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">0{i+1}</div>
                <h3 className="text-3xl font-black tracking-tighter">{city.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
