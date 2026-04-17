export type UserRole = 'admin' | 'gerant' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  photoURL?: string;
  phone?: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  managerId: string; // Gerant UID
  images: string[];
  amenities: string[];
  stars: number;
  createdAt: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Room {
  id: string;
  hotelId: string;
  type: string; // Suite, Double, etc.
  pricePerNight: number;
  capacity: number;
  description: string;
  images: string[];
  isAvailable: boolean;
  amenities: string[];
}

export interface Reservation {
  id: string;
  clientId: string;
  hotelId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  guestsCount: number;
  options: string[]; // Pivot: reservation_option
}

export interface AmenityOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Review {
  id: string;
  hotelId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment: string;
  isModerated: boolean;
  createdAt: string;
}
