export type UserRole = 'admin' | 'gerant' | 'client';

export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  phone?: string;
  created_at?: any;
}

export interface Hotel {
  id: string;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  description: string;
  gerant_id: string;
  created_at?: any;
  stars?: number;
  images?: string[];
}

export interface Room {
  id: string;
  hotel_id: string;
  numero: string;
  type: string;
  prix: number;
  capacite: number;
  statut: 'libre' | 'occupée' | 'maintenance';
  description: string;
  image?: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  chambre_id: string;
  hotel_id: string;
  date_arrivee: string;
  date_depart: string;
  statut: 'en_attente' | 'confirmee' | 'annulee';
  demande_speciale?: string;
  hotel_nom?: string;
  chambre_type?: string;
  chambre_prix?: number;
  client_nom?: string;
  client_prenom?: string;
}

export interface AmenityOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Review {
  id: string;
  chambre_id: string;
  user_id: string;
  nom: string;
  prenom: string;
  note: number;
  commentaire: string;
  created_at: any;
}
