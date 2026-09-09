import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import barChartIcon from '../../assets/animations/1f4ca.json';
import { useExport } from '../../hooks/useExport';
import { useToast } from '../../hooks/useToast';
import { FileText, Download, Calendar, CheckCircle2 } from 'lucide-react';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose }) => {
  const { generateExport, history } = useExport();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState<{ format: 'pdf' | 'csv', mois: string }>({
    format: 'pdf',
    mois: new Date().toISOString().slice(0, 7) // YYYY-MM
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await generateExport.mutateAsync(formData);
      addToast('Export généré avec succès !');
      
      // Si une URL signée est retournée, on peut l'ouvrir dans un nouvel onglet
      if (response.signedUrl) {
        window.open(response.signedUrl, '_blank');
      }
      
      onClose();
    } catch (error) {
      addToast('Erreur lors de la génération de l\'export.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exporter les Données" animationData={barChartIcon}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Période (Mois)</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input 
                type="month" 
                required
                value={formData.mois}
                onChange={(e) => setFormData({...formData, mois: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all font-mono" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Format d'export</label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${formData.format === 'pdf' ? 'border-accent bg-accent/5' : 'border-border bg-bg hover:border-accent/30'}`}
                onClick={() => setFormData({...formData, format: 'pdf'})}
              >
                <div className="flex items-center gap-3">
                  <FileText className={formData.format === 'pdf' ? 'text-accent' : 'text-txt-3'} size={20} />
                  <span className="font-bold">Rapport PDF</span>
                </div>
                {formData.format === 'pdf' && <CheckCircle2 className="text-accent" size={16} />}
              </div>
              
              <div 
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${formData.format === 'csv' ? 'border-accent bg-accent/5' : 'border-border bg-bg hover:border-accent/30'}`}
                onClick={() => setFormData({...formData, format: 'csv'})}
              >
                <div className="flex items-center gap-3">
                  <FileText className={formData.format === 'csv' ? 'text-accent' : 'text-txt-3'} size={20} />
                  <span className="font-bold">Données CSV</span>
                </div>
                {formData.format === 'csv' && <CheckCircle2 className="text-accent" size={16} />}
              </div>
            </div>
          </div>
        </div>

        {history && history.length > 0 && (
          <div className="mt-6">
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Exports Récents</label>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {history.slice(0, 3).map((h: any) => (
                <div key={h.id} className="flex justify-between items-center p-3 rounded-lg bg-surface border border-border/50 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-txt-3">{h.mois}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-bg text-txt-2">{h.format}</span>
                  </div>
                  {h.signed_url && (
                    <a href={h.signed_url} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1 text-xs font-bold">
                      <Download size={12} /> Télécharger
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-border font-bold hover:dark:bg-white/5 bg-black/5 transition-all"
          >
            Annuler
          </button>
          <button 
            type="submit"
            disabled={generateExport.isPending}
            className="flex-1 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generateExport.isPending ? 'Génération...' : <><Download size={18} /> Générer l'export</>}
          </button>
        </div>
      </form>
    </Modal>
  );
};
