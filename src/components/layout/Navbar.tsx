import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Hotel, User, LogOut, LayoutDashboard, Search, CalendarCheck2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, isGerant, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-border-base sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-primary p-2 rounded-lg transition-transform group-hover:scale-110">
                <Hotel className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-extrabold text-text-main">
                HôteEase
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/hotels" className="text-text-muted hover:text-primary flex items-center gap-1 transition-colors">
                <Search className="h-4 w-4" /> Parcourir
              </Link>
              {user && (
                <Link to="/my-reservations" className="text-text-muted hover:text-primary flex items-center gap-1 transition-colors">
                  <CalendarCheck2 className="h-4 w-4" /> Mes Voyages
                </Link>
              )}
              {isGerant && (
                <Link to="/gerant/dashboard" className="text-text-muted hover:text-primary flex items-center gap-1 transition-colors">
                  <LayoutDashboard className="h-4 w-4" /> Gérant
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin/dashboard" className="text-text-muted hover:text-primary transition-colors">Admin</Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!user && (
              <Link
                to="/register?role=gerant"
                className="hidden lg:flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-button text-sm font-bold hover:bg-primary hover:text-white transition-all whitespace-nowrap"
              >
                Ajouter mon établissement
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="user-pill hidden sm:flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-border-base transition-shadow hover:shadow-sm">
                  <div className="user-avatar w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
                    {profile?.displayName?.substring(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-main leading-none uppercase tracking-wide">
                      {profile?.displayName}
                    </span>
                    <span className="text-[10px] text-text-muted font-medium uppercase tracking-tighter">{profile?.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-text-muted px-4 py-2 rounded-button text-sm font-bold hover:text-primary transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-6 py-2 rounded-button text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
