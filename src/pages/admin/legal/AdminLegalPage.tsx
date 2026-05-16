import React, { useEffect, useState } from 'react';
import { Shield, Save, Loader2, AlertCircle, CheckCircle, FileText, Globe } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';

export default function AdminLegalPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('terms');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    titre: '',
    contenu: ''
  });

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/cms/legal');
      setPages(data.data);
      
      // Select the current slug or the first one
      const currentPage = data.data.find((p: any) => p.slug === selectedSlug);
      if (currentPage) {
        setFormData({ titre: currentPage.titre, contenu: currentPage.contenu });
      }
    } catch (err) {
      addToast('Erreur lors du chargement des pages', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    const currentPage = pages.find((p: any) => p.slug === selectedSlug);
    if (currentPage) {
      setFormData({ titre: currentPage.titre, contenu: currentPage.contenu });
    } else {
      // Default initial values if page doesn't exist yet
      setFormData({ 
        titre: selectedSlug === 'terms' ? "Conditions d'Utilisation" : "Politique de Confidentialité", 
        contenu: '' 
      });
    }
  }, [selectedSlug, pages]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/api/admin/cms/legal/${selectedSlug}`, formData);
      addToast('Page mise à jour avec succès !');
      fetchPages(); // Refresh data
    } catch (err) {
      addToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const legalDocs = [
    { slug: 'terms', label: "Conditions d'Utilisation", icon: Shield },
    { slug: 'privacy', label: "Politique de Confidentialité", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-loss" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Gestion Légale</h2>
          <p className="text-txt-3 text-sm">Modifiez les documents juridiques de la plateforme</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary bg-loss hover:bg-red-600 flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Publier les modifications
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Selection */}
        <div className="lg:col-span-1 space-y-2">
          {legalDocs.map((doc) => (
            <button
              key={doc.slug}
              onClick={() => setSelectedSlug(doc.slug)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold transition-all border ${
                selectedSlug === doc.slug 
                  ? 'bg-loss/10 border-loss/20 text-loss shadow-lg shadow-loss/5' 
                  : 'bg-surface border-border text-txt-2 hover:border-loss/30'
              }`}
            >
              <doc.icon size={18} />
              <span className="text-sm">{doc.label}</span>
            </button>
          ))}

          <div className="mt-8 p-6 glass rounded-3xl border-loss/10">
            <Globe className="text-loss mb-3" size={20} />
            <h4 className="text-xs font-black uppercase tracking-widest mb-2">Aperçu Public</h4>
            <p className="text-[10px] text-txt-3 leading-relaxed mb-4">Ces pages sont accessibles publiquement par tous les utilisateurs.</p>
            <a 
              href={`/legal/${selectedSlug}`} 
              target="_blank" 
              className="text-[10px] font-bold text-loss hover:underline"
            >
              Voir la version en ligne ↗
            </a>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass p-8 rounded-[2rem] border-loss/10">
            <div className="mb-6">
              <label className="block text-[10px] font-black text-txt-3 uppercase tracking-[0.2em] mb-3">Titre de la Page</label>
              <input 
                type="text" 
                value={formData.titre}
                onChange={(e) => setFormData({...formData, titre: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-4 px-6 focus:border-loss/50 outline-none transition-all font-bold text-xl"
                placeholder="Titre du document..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-[10px] font-black text-txt-3 uppercase tracking-[0.2em]">Contenu (HTML supporté)</label>
                <span className="text-[9px] font-bold text-txt-3 px-2 py-1 bg-elevated rounded">Markdown / HTML</span>
              </div>
              <textarea 
                value={formData.contenu}
                onChange={(e) => setFormData({...formData, contenu: e.target.value})}
                className="w-full h-[500px] bg-bg border border-border rounded-2xl py-4 px-6 focus:border-loss/50 outline-none transition-all font-mono text-sm leading-relaxed"
                placeholder="Rédigez le contenu ici en utilisant des balises HTML pour la mise en forme (<h2>, <p>, <ul>, etc.)..."
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-loss/5 border border-loss/10 flex items-start gap-3">
            <AlertCircle size={16} className="text-loss mt-0.5 shrink-0" />
            <p className="text-[11px] text-txt-2 leading-relaxed">
              <span className="font-bold text-loss">Attention :</span> Toute modification publiée est immédiatement visible par les utilisateurs lors de leur inscription et sur les pages publiques. Assurez-vous de la conformité juridique avant de sauvegarder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
