import React, { useState, useCallback } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Upload, X, GripVertical, Loader2, Image as ImageIcon } from 'lucide-react';
import { Hotel } from '../../types';
import { storageService } from '../../services/storageService';
import { hotelService } from '../../services/hotelService';
import { motion, AnimatePresence } from 'motion/react';

interface PhotoManagerProps {
  hotel: Hotel;
  onUpdate: () => void;
}

interface SortablePhotoProps {
  url: string;
  onDelete: (url: string) => void;
}

const SortablePhoto: React.FC<SortablePhotoProps> = ({ url, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border border-border-base"
    >
      <img 
        src={url} 
        alt="Hotel" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <div 
          {...attributes} 
          {...listeners}
          className="p-2 cursor-grab active:cursor-grabbing text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <button
          onClick={() => onDelete(url)}
          className="p-2 text-white hover:bg-red-500 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

const PhotoManager: React.FC<PhotoManagerProps> = ({ hotel, onUpdate }) => {
  const [images, setImages] = useState<string[]>(hotel.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);
      const newImages = arrayMove(images, oldIndex, newIndex) as string[];
      
      setImages(newImages);
      await hotelService.updateHotel(hotel.id, { images: newImages });
      onUpdate();
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => 
        storageService.uploadHotelImage(hotel.id, file)
      );
      
      const newUrls = (await Promise.all(uploadPromises)) as string[];
      const updatedImages = [...images, ...newUrls];
      
      setImages(updatedImages);
      await hotelService.updateHotel(hotel.id, { images: updatedImages });
      onUpdate();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Erreur lors de l'upload. Vérifiez votre connexion.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    if (!window.confirm("Supprimer cette photo ?")) return;
    
    const updatedImages = images.filter(img => img !== url);
    setImages(updatedImages);
    
    try {
      await Promise.all([
        hotelService.updateHotel(hotel.id, { images: updatedImages }),
        storageService.deleteImage(url).catch(e => console.warn("Image already deleted or missing from storage", e))
      ]);
      onUpdate();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6">
      <div 
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-3 ${
          dragActive 
            ? "border-primary bg-primary/5 scale-[1.01]" 
            : "border-border-base hover:border-text-muted bg-gray-50"
        }`}
      >
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
            <p className="text-sm font-bold text-text-muted">Upload en cours...</p>
          </div>
        ) : (
          <>
            <div className="p-3 bg-white rounded-full shadow-sm border border-border-base">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-text-main">
                Cliquez ou déposez vos photos ici
              </p>
              <p className="text-xs text-text-muted mt-1 font-medium">
                JPG, PNG ou WebP (max 10MB)
              </p>
            </div>
          </>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
          <ImageIcon className="h-3 w-3" /> {images.length} Photos
        </h4>
        
        {images.length > 0 ? (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={images}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((url) => (
                  <SortablePhoto key={url} url={url} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="py-12 border border-border-base border-dashed rounded-xl flex flex-col items-center gap-2 text-text-muted italic text-sm">
            <ImageIcon className="h-8 w-8 opacity-20" />
            Aucune photo pour le moment
          </div>
        )}
      </div>

      {images.length > 0 && (
        <p className="text-[10px] text-text-muted font-bold text-center italic">
          Glissez-déposez les photos pour changer l'ordre d'affichage
        </p>
      )}
    </div>
  );
};

export default PhotoManager;
