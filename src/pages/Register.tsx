import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, UserPlus, User, ChevronRight, Building2, UserCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types';

const Register: React.FC = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [isForcedRole, setIsForcedRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'gerant') {
      setRole('gerant');
      setIsForcedRole(true);
    } else {
      setRole('client');
      setIsForcedRole(true); // Hide selector for standard register too
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(nom, prenom, email, password, role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l’inscription. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-white rounded-card border border-border-base p-10 shadow-sm relative overflow-hidden">
          {isForcedRole && (
            <div className="absolute top-0 right-0">
              <div className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-1 rotate-45 translate-x-8 translate-y-3">
                Pro
              </div>
            </div>
          )}
          <div className="text-center mb-8">
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
              {role === 'gerant' ? 'Partenariat Hôtelier' : 'Compte Client'}
            </div>
            <h1 className="text-4xl font-black text-text-main tracking-tighter leading-none mb-3">
              {role === 'gerant' ? 'Inscrivez votre Hôtel' : 'Rejoignez HôteEase'}
            </h1>
            <p className="text-sm text-text-muted font-medium">
              {role === 'gerant' ? 'Devenez partenaire et boostez votre visibilité au Bénin.' : 'Créez votre compte voyageur en quelques secondes.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Nom</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Prénom</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    placeholder="Jean"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Mot de passe</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    placeholder="•••••••• (min 6 caractères)"
                  />
                </div>
              </div>

              {!isForcedRole && (
                <div className="md:col-span-2 space-y-3 pt-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Je souhaite être :</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('client')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        role === 'client' 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border-base text-text-muted hover:border-text-muted'
                      }`}
                    >
                      <UserCircle className="h-6 w-6" />
                      <span className="text-xs font-bold">Client</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('gerant')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        role === 'gerant' 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border-base text-text-muted hover:border-text-muted'
                      }`}
                    >
                      <Building2 className="h-6 w-6" />
                      <span className="text-xs font-bold">Gérant d'Hôtel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3.5 rounded-button font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Créer mon compte
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border-base text-center">
            <p className="text-sm text-text-muted font-medium">
              Déjà inscrit ?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline inline-flex items-center">
                Se connecter <ChevronRight className="h-4 w-4" />
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
