import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Hotel } from '../../types';
import { hotelService } from '../../services/hotelService';
import { motion } from 'motion/react';

interface PhotoManagerProps {
  hotel: Hotel;
  onUpdate: () => void;
}

const PhotoManager: React.FC<PhotoManagerProps> = ({ hotel, onUpdate }) => {
  const [images, setImages] = useState<string[]>([]); // Simplified for MySQL/Local version
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    // Simulation d'upload pour la démo MySQL local
    setTimeout(async () => {
      const newUrls = [...images, "https://picsum.photos/seed/hotel" + Date.now() + "/800/600"];
      setImages(newUrls);
      try {
        await hotelService.updateHotel(hotel.id, { images: newUrls });
        onUpdate();
      } catch (e) {
        console.error(e);
      }
      setIsUploading(false);
    }, 1000);
  };

  const handleDelete = async (url: string) => {
    const updatedImages = images.filter(img => img !== url);
    setImages(updatedImages);
    await hotelService.updateHotel(hotel.id, { images: updatedImages });
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 border-border-base hover:border-text-muted bg-gray-50">
        <input 
          type="file" 
          multiple 
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => handleUpload(e.target.files)}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-bold text-text-muted">Upload simulé...</p>
          </div>
        ) : (
          <>
            <div className="p-3 bg-white rounded-full shadow-sm border border-border-base">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-text-main">
                Ajouter des photos (Démo Locale)
              </p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {images.map((url, i) => (
          <div key={i} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border border-border-base">
            <img src={url} className="w-full h-full object-cover" alt="Hotel" />
            <button
              onClick={() => handleDelete(url)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoManager;
