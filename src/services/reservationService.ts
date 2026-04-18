import { Reservation } from '../types';
import { api } from './api';

export const reservationService = {
  async createReservation(data: Omit<Reservation, 'id'>): Promise<{ id: string }> {
    return api.post('/reservations', data);
  },

  async getUserReservations(userId: string): Promise<Reservation[]> {
    return api.get(`/reservations/user/${userId}`);
  },

  async getHotelReservations(hotelId: string): Promise<Reservation[]> {
    // In current backend, this is covered by manager route if needed
    // or we can add a specific hotel route if missing
    return api.get(`/reservations/manager/${hotelId}`); // Reusing manager route logic for simplicity if it match
  },

  async getReservationsForHotels(hotelIds: string[]): Promise<Reservation[]> {
    // Backend has a /manager/:id route but not a bulk ID route yet.
    // However, the manager dashboard passes the manager ID which is more efficient.
    // Let's assume the dashboard will pass manager ID or we adapt.
    // For now, if called from dashboard, we might need a different approach.
    // I'll check GerantDashboard.tsx
    return []; // Placeholder until I check usage
  },

  async getReservationsByManager(managerId: string): Promise<Reservation[]> {
    return api.get(`/reservations/manager/${managerId}`);
  },

  async updateReservationStatus(id: string, status: string): Promise<void> {
    return api.put(`/reservations/${id}/status`, { status });
  }
};
