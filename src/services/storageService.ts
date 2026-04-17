import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export const storageService = {
  async uploadHotelImage(hotelId: string, file: File) {
    const filename = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `hotels/${hotelId}/${filename}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  async deleteImage(url: string) {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  }
};
