import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, LogIn, ChevronRight, UserCircle, Building2, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '../types';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      
      // Verification of role matching
      const user = (await import('../firebase')).auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profileRole = userDoc.data().role;
          if (profileRole !== selectedRole) {
            await logout();
            setError(`Ce compte n'est pas un compte ${selectedRole === 'admin' ? 'Administrateur' : selectedRole === 'gerant' ? 'Gérant' : 'Client'}.`);
            setLoading(false);
            return;
          }
        }
      }
      
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email ou mot de passe incorrect.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives infructueuses. Votre compte est temporairement bloqué. Veuillez réessayer plus tard ou réinitialiser votre mot de passe.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('La connexion par email n’est pas activée. Veuillez l’activer dans la console Firebase (Authentication > Sign-in method).');
      } else {
        setError('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
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
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-card border border-border-base p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Accès Sécurisé</div>
            <h1 className="text-3xl font-black text-text-main tracking-tight">Connexion</h1>
            <p className="text-sm text-text-muted mt-2">Choisissez votre rôle puis connectez-vous</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold animate-shake">
                {error}
              </div>
            )}

            {/* Role Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Se connecter en tant que :</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'client' as UserRole, label: 'Client', icon: UserCircle },
                  { id: 'gerant' as UserRole, label: 'Gérant', icon: Building2 },
                  { id: 'admin' as UserRole, label: 'Admin', icon: Shield },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      selectedRole === role.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border-base text-text-muted hover:border-text-muted'
                    }`}
                  >
                    <role.icon className="h-5 w-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Mot de passe</label>
                  <a href="#" className="text-[10px] font-bold text-primary hover:underline">Oublié ?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-border-base rounded-button focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
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
                  <LogIn className="h-4 w-4" /> Se Connecter
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border-base text-center">
            <p className="text-sm text-text-muted font-medium">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline inline-flex items-center">
                Créer un compte <ChevronRight className="h-4 w-4" />
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
