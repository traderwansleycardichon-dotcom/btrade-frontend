import React, { useRef, useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { clickable } from '../../lib/a11y';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label, className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Seules les images sont autorisées', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('L\'image ne doit pas dépasser 5 MB', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success && res.data.data.url) {
        onChange(res.data.data.url);
        addToast('Image uploadée avec succès', 'success');
      }
    } catch (error) {
      console.error('Upload error:', error);
      addToast('Erreur lors de l\'upload de l\'image', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-txt-2">{label}</label>}
      
      <div className="relative">
        {value ? (
          <div className="relative group rounded-xl overflow-hidden border border-border bg-surface aspect-video max-h-[200px] flex items-center justify-center">
            <img 
              src={value} 
              alt="Uploaded preview" 
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-surface text-txt rounded-full hover:bg-accent hover:text-white transition-colors"
                title="Changer d'image"
              >
                <Upload size={18} />
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-2 bg-surface text-loss rounded-full hover:bg-loss hover:text-white transition-colors"
                title="Supprimer"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div 
            {...clickable(() => !uploading && fileInputRef.current?.click())}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors aspect-video max-h-[200px]
              ${uploading ? 'bg-surface/50 border-border/50 cursor-not-allowed' : 'border-border hover:border-accent hover:bg-accent/5 bg-surface'}`}
          >
            {uploading ? (
              <>
                <Loader2 size={32} className="text-accent animate-spin mb-2" />
                <span className="text-sm text-txt-2">Upload en cours...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3">
                  <ImageIcon size={24} />
                </div>
                <span className="text-sm font-medium text-txt mb-1">
                  Cliquez pour uploader une image
                </span>
                <span className="text-xs text-txt-3">
                  PNG, JPG, WEBP jusqu'à 5MB
                </span>
              </>
            )}
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={uploading}
        />
      </div>
    </div>
  );
};
