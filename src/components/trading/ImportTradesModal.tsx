import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import barChartIcon from '../../assets/animations/1f4ca.json';
import { Upload, FileText, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface ImportTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportTradesModal: React.FC<ImportTradesModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [plateforme, setPlateforme] = useState('MT5');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    // Simulation of upload process
    setTimeout(() => {
      setIsUploading(false);
      addToast(`Importation réussie : ${file.name} analysé.`, 'success');
      setFile(null);
      onClose();
    }, 2000);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Importer un historique de trades"
      animationData={barChartIcon}
      footer={
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost" disabled={isUploading}>Annuler</button>
          <button 
            onClick={handleImport} 
            className="btn-primary flex items-center gap-2"
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Importation...
              </span>
            ) : (
              <>
                <Upload size={16} />
                Lancer l'importation
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-6 p-1">
        
        {/* Selection de la plateforme */}
        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Cpu size={12} /> Plateforme source
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['MT4', 'MT5', 'CTrader'].map(plat => (
              <button
                key={plat}
                type="button"
                onClick={() => setPlateforme(plat)}
                className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${
                  plateforme === plat 
                    ? 'border-accent bg-accent/10 text-accent' 
                    : 'border-border bg-bg text-txt-2 hover:border-accent/30 hover:text-txt'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        {/* Zone de Drop */}
        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-3">
            Fichier CSV / HTML
          </label>
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              file ? 'border-win/50 bg-win/5' : 'border-border hover:border-accent/50 hover:bg-elevated/50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv,.html,.htm" 
              onChange={handleFileChange}
            />
            
            {file ? (
              <>
                <div className="w-12 h-12 rounded-full bg-win/20 flex items-center justify-center text-win mb-4">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-bold text-txt">{file.name}</h4>
                <p className="text-xs text-txt-3 mt-1">
                  {(file.size / 1024).toFixed(2)} KB • Prêt à être importé
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-4 text-xs font-bold text-loss hover:text-loss/80 uppercase tracking-widest"
                >
                  Retirer le fichier
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center text-txt-2 mb-4">
                  <FileText size={24} />
                </div>
                <h4 className="font-bold text-txt">Glissez-déposez votre fichier ici</h4>
                <p className="text-xs text-txt-3 mt-1 max-w-[250px]">
                  Formats supportés : CSV (CTrader) ou HTML (MetaTrader 4/5). Taille max : 5MB.
                </p>
                <div className="mt-4 py-2 px-4 bg-surface border border-border rounded-lg text-xs font-bold hover:bg-elevated transition-colors">
                  Parcourir les fichiers
                </div>
              </>
            )}
          </div>
        </div>

        {/* Avertissement */}
        <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex gap-3">
          <AlertTriangle size={16} className="text-accent shrink-0 mt-0.5" />
          <div className="text-xs text-txt-2">
            L'importation de fichiers volumineux peut prendre quelques secondes. Assurez-vous que le format correspond bien à l'export standard de votre plateforme.
          </div>
        </div>

      </div>
    </Modal>
  );
};
