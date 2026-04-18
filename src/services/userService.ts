import { UserProfile, UserRole } from '../types';
import { api } from './api';

export const userService = {
  async getAllUsers(): Promise<UserProfile[]> {
    return api.get('/admin/users');
  },

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    return api.put(`/admin/users/${userId}/role`, { role });
  }
};
