import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { UserProfile, Review } from '../types';
import { 
  Users, 
  ShieldAlert, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Search,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const [usersData, reviewsData] = await Promise.all([
      firestoreService.getCollection<UserProfile>('users'),
      firestoreService.getCollection<Review>('reviews')
    ]);
    setUsers(usersData);
    setReviews(reviewsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const roles: string[] = ['admin', 'gerant', 'client'];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
    
    if (window.confirm(`Changer le rôle vers ${nextRole} ?`)) {
      await firestoreService.updateDocument('users', userId, { role: nextRole });
      fetchData();
    }
  };

  const handleModerateReview = async (reviewId: string, status: boolean) => {
    await firestoreService.updateDocument('reviews', reviewId, { isModerated: status });
    fetchData();
  };

  const stats = [
    { label: "Utilisateurs", value: users.length, icon: Users, color: "blue" },
    { label: "Avis à modérer", value: reviews.filter(r => !r.isModerated).length, icon: ShieldAlert, color: "red" },
    { label: "Taux Occupation", value: "78%", icon: BarChart3, color: "green" },
  ];

  if (loading) return <div className="p-20 text-center">Initialisation Admin...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">Centre d'Administration</h1>
        <p className="text-gray-500 font-medium italic">Supervision globale de la plateforme GuestHouse.</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-gray-900">{stat.value}</div>
              <div className="text-gray-400 font-bold uppercase text-xs tracking-widest">{stat.label}</div>
            </div>
            <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-3xl`}>
              <stat.icon className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* User Management */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" /> Gestion des Rôles
            </h2>
            <div className="text-xs font-bold text-gray-400 uppercase">{users.length} comptes</div>
          </div>
          <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase pt-6">Utilisateur</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase pt-6 text-center">Rôle Actuel</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase pt-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-50 flex items-center justify-center rounded-xl text-blue-600 font-bold">
                            {u.displayName?.[0]}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{u.displayName}</div>
                            <div className="text-xs text-gray-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          u.role === 'admin' ? 'bg-red-50 text-red-600' :
                          u.role === 'gerant' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleUpdateRole(u.uid, u.role)}
                          className="bg-gray-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors"
                        >
                          Changer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Review Moderation */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-blue-600" /> Modération Avis
            </h2>
            <div className="text-xs font-bold text-gray-400 uppercase">{reviews.length} total</div>
          </div>
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="p-12 text-center text-gray-400 italic bg-white rounded-3xl border border-gray-100">
                Aucun avis pour le moment.
              </div>
            ) : reviews.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-start gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{r.clientName}</span>
                    <span className="text-xs text-gray-400">sur Hôtel ID: {r.hotelId}</span>
                  </div>
                  <div className="flex text-yellow-400 h-3">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                  </div>
                  <p className="text-gray-600 text-sm italic">"{r.comment}"</p>
                </div>
                <div className="flex flex-col gap-2">
                  {!r.isModerated ? (
                    <button 
                      onClick={() => handleModerateReview(r.id!, true)}
                      className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                      title="Approuver"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleModerateReview(r.id!, false)}
                      className="p-2 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition-colors"
                      title="Révoquer"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
