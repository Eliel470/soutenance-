import { where, orderBy, limit } from 'firebase/firestore';
import { firestoreService } from './firestoreService';
import { Hotel, Room, Review } from '../types';

export const hotelService = {
  async getHotels(city?: string) {
    const qConstraints: any[] = city ? [where('city', '==', city)] : [];
    qConstraints.push(orderBy('stars', 'desc'));
    return firestoreService.getCollection<Hotel>('hotels', qConstraints);
  },

  async getHotelById(id: string) {
    return firestoreService.getDocument<Hotel>('hotels', id);
  },

  async getRooms(hotelId: string) {
    return firestoreService.getCollection<Room>(`hotels/${hotelId}/rooms`, [where('isAvailable', '==', true)]);
  },

  async getReviews(hotelId: string) {
    return firestoreService.getCollection<Review>('reviews', [
      where('hotelId', '==', hotelId),
      where('isModerated', '==', true),
      orderBy('createdAt', 'desc')
    ]);
  },

  async createHotel(hotelData: Partial<Hotel>) {
    return firestoreService.addDocument('hotels', hotelData);
  },

  async createRoom(hotelId: string, roomData: Partial<Room>) {
    return firestoreService.addDocument(`hotels/${hotelId}/rooms`, {
      ...roomData,
      hotelId,
      isAvailable: true
    });
  },

  async deleteHotel(id: string) {
    return firestoreService.deleteDocument('hotels', id);
  },

  async updateHotel(id: string, data: Partial<Hotel>) {
    return firestoreService.updateDocument('hotels', id, data);
  }
};
