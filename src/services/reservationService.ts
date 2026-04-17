import { where, orderBy } from 'firebase/firestore';
import { firestoreService } from './firestoreService';
import { Reservation } from '../types';

export const reservationService = {
  async createReservation(data: Partial<Reservation>) {
    return firestoreService.addDocument('reservations', {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  },

  async getUserReservations(userId: string) {
    return firestoreService.getCollection<Reservation>('reservations', [
      where('clientId', '==', userId),
      orderBy('createdAt', 'desc')
    ]);
  },

  async getHotelReservations(hotelId: string) {
    return firestoreService.getCollection<Reservation>('reservations', [
      where('hotelId', '==', hotelId),
      orderBy('createdAt', 'desc')
    ]);
  },

  async cancelReservation(id: string) {
    return firestoreService.updateDocument('reservations', id, { status: 'cancelled' });
  },

  async confirmReservation(id: string) {
    return firestoreService.updateDocument('reservations', id, { status: 'confirmed' });
  }
};
