import { Review } from '../types';
import { api } from './api';

export const reviewService = {
  async getHotelReviews(hotelId: string): Promise<Review[]> {
    return api.get(`/reviews/hotel/${hotelId}`);
  },

  async addReview(review: Omit<Review, 'id' | 'created_at' | 'nom' | 'prenom'>): Promise<string> {
    const res = await api.post('/reviews', review);
    return res.id;
  }
};
