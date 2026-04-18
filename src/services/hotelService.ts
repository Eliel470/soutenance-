import { Hotel, Room } from '../types';
import { api } from './api';

export const hotelService = {
  async getHotels(city?: string): Promise<Hotel[]> {
    return api.get(city ? `/hotels?city=${city}` : '/hotels');
  },

  async getManagerHotels(managerId: string): Promise<Hotel[]> {
    return api.get(`/manager/${managerId}/hotels`);
  },

  async getHotelById(id: string): Promise<Hotel | null> {
    try {
      return await api.get(`/hotels/${id}`);
    } catch (e) {
      return null;
    }
  },

  async getRooms(hotelId: string, checkin?: string, checkout?: string): Promise<Room[]> {
    let url = `/hotels/${hotelId}/rooms`;
    if (checkin && checkout) {
      url += `?checkin=${checkin}&checkout=${checkout}`;
    }
    return api.get(url);
  },

  async createHotel(hotelData: Omit<Hotel, 'id'>): Promise<{ id: string }> {
    return api.post('/hotels', hotelData);
  },

  async updateHotel(id: string, data: Partial<Hotel>): Promise<void> {
    return api.put(`/hotels/${id}`, data);
  },

  async deleteHotel(id: string): Promise<void> {
    return api.delete(`/hotels/${id}`);
  },

  async addRoom(hotelId: string, roomData: Omit<Room, 'id' | 'hotel_id'>): Promise<{ id: string }> {
    return api.post(`/hotels/${hotelId}/rooms`, roomData);
  },

  async updateRoom(hotelId: string, roomId: string, data: Partial<Room>): Promise<void> {
    return api.put(`/hotels/rooms/${roomId}`, data);
  },

  async deleteRoom(hotelId: string, roomId: string): Promise<void> {
    return api.delete(`/hotels/rooms/${roomId}`);
  }
};
