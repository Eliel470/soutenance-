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
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'gerant') {
      setRole('gerant');
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
      await register(email, password, displayName, role);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà associée à un compte. Veuillez vous connecter ou utiliser une autre adresse.');
      } else if (err.code === 'auth/invalid-email') {
        setError('L’adresse email n’est pas valide.');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('L’inscription par email n’est pas activée. Veuillez l’activer dans la console Firebase (Authentication > Sign-in method).');
      } else {
        setError('Une erreur est survenue lors de l’inscription. Veuillez réessayer.');
      }
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
        <div className="bg-white rounded-card border border-border-base p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Inscription Gratuite</div>
            <h1 className="text-3xl font-black text-text-main tracking-tight">Rejoignez-nous</h1>
            <p className="text-sm text-text-muted mt-2">Créez votre compte en quelques secondes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Nom Complet</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    placeholder="Jean Dupont"
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

              <div className="md:col-span-2 space-y-3">
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
