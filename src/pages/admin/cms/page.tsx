import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Search, Edit3, Trash2, Eye, Layout } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { PlaybookModal } from '../../../components/admin/PlaybookModal';

export default function AdminCmsPage() {
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlaybook, setSelectedPlaybook] = useState<any>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchPlaybooks();
  }, []);

  const fetchPlaybooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/cms/playbooks');
      setPlaybooks(res.data.data);
    } catch (err) {
      addToast('Erreur chargement playbooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pb: any) => {
    setSelectedPlaybook(pb);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce playbook ?')) return;
    try {
      await api.delete(`/api/admin/cms/playbooks/${id}`);
      addToast('Playbook supprimé', 'success');
      fetchPlaybooks();
    } catch (err) {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  const openCreateModal = () => {
    setSelectedPlaybook(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black mb-2">Gestion du Contenu (CMS)</h1>
          <p className="text-txt-2 text-sm">Gérez les Playbooks globaux et les ressources pédagogiques.</p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Nouveau Playbook
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl border border-border bg-gradient-to-br from-surface to-accent/5">
          <Layout size={32} className="text-accent mb-4" />
          <h3 className="font-bold mb-1">Playbooks Globaux</h3>
          <p className="text-xs text-txt-2 mb-4">Stratégies visibles par tous les membres BTrade.</p>
          <div className="text-2xl font-black">{playbooks.length}</div>
        </div>
        <div className="glass p-6 rounded-3xl border border-border">
          <BookOpen size={32} className="text-win mb-4" />
          <h3 className="font-bold mb-1">Bibliothèque de Setups</h3>
          <p className="text-xs text-txt-2 mb-4">Modèles de configurations techniques partagés.</p>
          <div className="text-2xl font-black">24</div>
        </div>
        <div className="glass p-6 rounded-3xl border border-border">
          <Eye size={32} className="text-loss mb-4" />
          <h3 className="font-bold mb-1">Vues Totales</h3>
          <p className="text-xs text-txt-2 mb-4">Engagement global sur le contenu pédagogique.</p>
          <div className="text-2xl font-black">12.5k</div>
        </div>
      </div>

      <div className="glass rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/50 flex justify-between items-center">
          <h3 className="font-bold">Playbooks BTrade Officiels</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-3" />
            <input type="text" placeholder="Filtrer..." className="pl-9 pr-4 py-1.5 rounded-lg bg-elevated border border-border text-xs outline-none focus:border-accent/50" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-txt-3">Chargement du contenu...</div>
          ) : playbooks.length === 0 ? (
            <div className="col-span-full text-center py-12 text-txt-3 italic">Aucun playbook publié.</div>
          ) : playbooks.map(pb => (
            <div key={pb.id} className="group p-5 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-xl ${pb.actif ? 'bg-win/10 text-win' : 'bg-txt-3/10 text-txt-3'}`}>
                  <BookOpen size={20} />
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(pb)}
                    className="p-2 text-txt-3 hover:text-txt transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(pb.id)}
                    className="p-2 text-txt-3 hover:text-loss transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold group-hover:text-accent transition-colors">{pb.titre || 'Sans titre'}</h4>
                <p className="text-xs text-txt-2 line-clamp-2 mt-1">{pb.description || 'Pas de description.'}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <div className="text-[10px] font-bold text-txt-3 uppercase">{pb.typeStrategie || 'Stratégie'}</div>
                <div className="text-[10px] font-bold text-win uppercase">{pb.actif ? 'Actif' : 'Draft'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PlaybookModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchPlaybooks}
        playbook={selectedPlaybook}
      />
    </div>
  );
}
