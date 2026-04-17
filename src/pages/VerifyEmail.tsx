import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, LogOut, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

const VerifyEmail: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.emailVerified) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRefresh = async () => {
    setChecking(true);
    await refreshUser();
    setChecking(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-card border border-border-base p-10 shadow-xl text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="relative">
            <div className="p-5 bg-primary/10 rounded-full animate-pulse">
              <Mail className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
              <RefreshCw className="h-4 w-4 text-primary animate-spin-slow" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-text-main tracking-tight">Vérifiez votre email</h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Un lien de confirmation a été envoyé à : <br />
            <span className="font-bold text-text-main">{user?.email}</span>
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-border-base space-y-4">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Procédure</p>
          <ol className="text-left space-y-3">
            {[
              "Consultez votre boîte de réception",
              "Cliquez sur le lien de confirmation",
              "Revenez ici et cliquez sur 'J'ai vérifié'"
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-xs font-bold text-text-main">
                <span className="bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="w-full bg-primary text-white py-4 rounded-button font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {checking ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Vérification...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" /> J'ai vérifié mon email
              </>
            )}
          </button>
          
          <button
            onClick={() => logout()}
            className="w-full bg-white text-text-muted py-3 rounded-button font-black uppercase tracking-widest text-[10px] border border-border-base hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" /> Se déconnecter
          </button>
        </div>

        <p className="text-[10px] text-text-muted font-medium">
          Vous n'avez pas reçu l'email ? Regardez dans vos courriers indésirables (spams).
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
