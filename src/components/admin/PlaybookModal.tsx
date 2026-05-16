import React, { useState, useEffect } from 'react';
import { BookOpen, X, Save, Type, AlignLeft, ShieldCheck, Activity } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/api';

interface PlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  playbook?: any;
}

export const PlaybookModal: React.FC<PlaybookModalProps> = ({ isOpen, onClose, onSuccess, playbook }) => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    regles: '',
    typeStrategie: 'Scalping',
    actif: true
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (playbook) {
      setFormData({
        titre: playbook.titre || '',
        description: playbook.description || '',
        regles: playbook.regles || '',
        typeStrategie: playbook.typeStrategie || 'Scalping',
        actif: playbook.actif ?? true
      });
    } else {
      setFormData({
        titre: '',
        description: '',
        regles: '',
        typeStrategie: 'Scalping',
        actif: true
      });
    }
  }, [playbook, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (playbook) {
        await api.patch(`/api/admin/cms/playbooks/${playbook.id}`, formData);
        addToast('Playbook mis à jour', 'success');
      } else {
        await api.post('/api/admin/cms/playbooks', formData);
        addToast('Nouveau playbook créé', 'success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast('Erreur lors de l\'enregistrement', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-2xl glass rounded-3xl border border-border shadow-2xl overflow-hidden animate-[zoomIn_0.3s_ease-out]">
        <div className="px-8 py-6 border-b border-border bg-surface/50 flex justify-between items-center">
          <h3 className="font-black text-xl flex items-center gap-3">
            <div className="p-2 bg-win/10 text-win rounded-xl">
              <BookOpen size={24} />
            </div>
            {playbook ? 'Modifier le Playbook' : 'Nouveau Playbook Officiel'}
          </h3>
          <button onClick={onClose} className="p-2 text-txt-3 hover:text-txt transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Titre de la stratégie</label>
                <div className="relative">
                  <Type size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" />
                  <input 
                    type="text" 
                    value={formData.titre}
                    onChange={e => setFormData({...formData, titre: e.target.value})}
                    placeholder="ex: Scalping M1 - EMA Cross"
                    className="w-full bg-elevated border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:border-win/50 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Type de Stratégie</label>
                <div className="relative">
                  <Activity size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" />
                  <select 
                    value={formData.typeStrategie}
                    onChange={e => setFormData({...formData, typeStrategie: e.target.value})}
                    className="w-full bg-elevated border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:border-win/50 outline-none transition-all appearance-none"
                  >
                    <option value="Scalping">Scalping</option>
                    <option value="Day Trading">Day Trading</option>
                    <option value="Swing Trading">Swing Trading</option>
                    <option value="Position Trading">Position Trading</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Description Courte</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Une brève explication de l'approche..."
                className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:border-win/50 outline-none transition-all h-[108px] resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Règles & Conditions (Markdown supporté)</label>
            <div className="relative">
              <AlignLeft size={16} className="absolute left-4 top-4 text-txt-3" />
              <textarea 
                value={formData.regles}
                onChange={e => setFormData({...formData, regles: e.target.value})}
                placeholder="1. Attendre le croisement EMA 20/50&#10;2. RSI doit être > 50... "
                className="w-full bg-elevated border border-border rounded-xl pl-12 pr-4 py-4 text-sm focus:border-win/50 outline-none transition-all h-40 resize-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-win" size={20} />
              <div>
                <div className="text-xs font-bold">Statut de Publication</div>
                <div className="text-[10px] text-txt-3">Les playbooks actifs sont visibles par tous les membres Pro.</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.actif}
                onChange={e => setFormData({...formData, actif: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-elevated peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-txt-3 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-win peer-checked:after:bg-white"></div>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl font-bold text-txt-2 hover:bg-elevated transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading || !formData.titre}
              className="flex-[2] btn-primary bg-win hover:bg-win/80 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(34,197,94,0.2)]"
            >
              <Save size={18} />
              {loading ? 'Enregistrement...' : playbook ? 'Mettre à jour' : 'Créer la stratégie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
