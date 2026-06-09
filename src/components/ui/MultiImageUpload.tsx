import React, { useRef, useState } from 'react';
import { Plus, X, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';

interface MultiImageUploadProps {
  values: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
  className?: string;
}

/**
 * Galerie d'images uploadées vers Cloudflare R2 (POST /api/upload).
 * Permet d'ajouter / retirer des screenshots multiples — utile pour les
 * analyses techniques (HTF, MTF, Entry, etc.).
 */
export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  values,
  onChange,
  max = 10,
  label,
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFiles = async (files: FileList) => {
    const remaining = max - values.length;
    if (remaining <= 0) {
      addToast(`Limite de ${max} images atteinte`, 'error');
      return;
    }
    const arr = Array.from(files).slice(0, remaining);

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of arr) {
        if (!file.type.startsWith('image/')) {
          addToast(`${file.name} : pas une image`, 'error');
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          addToast(`${file.name} : > 5 MB`, 'error');
          continue;
        }

        const fd = new FormData();
        fd.append('file', file);
        const res = await api.post('/api/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.success && res.data?.data?.url) {
          uploaded.push(res.data.data.url);
        }
      }
      if (uploaded.length > 0) {
        onChange([...values, ...uploaded]);
        addToast(`${uploaded.length} image(s) uploadée(s)`, 'success');
      }
    } catch (err) {
      console.error('[multi-upload]', err);
      addToast("Erreur lors de l'upload", 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAt = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest">
          {label}
        </label>
      )}

      <div className="grid grid-cols-3 gap-2">
        {values.map((url, idx) => (
          <div
            key={idx}
            className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-bg"
          >
            <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-loss"
              title="Retirer"
            >
              <X size={12} />
            </button>
            <div className="absolute bottom-1 left-1 text-[9px] mono bg-black/60 text-white px-1.5 py-0.5 rounded">
              {idx + 1}/{values.length}
            </div>
          </div>
        ))}

        {values.length < max && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-[10px] gap-1 transition-colors
              ${uploading
                ? 'border-border/50 bg-surface/50 text-txt-3 cursor-not-allowed'
                : 'border-border text-txt-2 hover:border-accent hover:text-accent hover:bg-accent/5'}`}
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Upload…</span>
              </>
            ) : (
              <>
                {values.length === 0 ? <ImageIcon size={18} /> : <Plus size={18} />}
                <span>{values.length === 0 ? 'Ajouter' : '+'}</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={e => e.target.files && handleFiles(e.target.files)}
        accept="image/*"
        multiple
        className="hidden"
        disabled={uploading}
      />

      <p className="text-[9px] text-txt-3">
        {values.length}/{max} · PNG, JPG, WEBP jusqu'à 5 MB chacune
      </p>
    </div>
  );
};
