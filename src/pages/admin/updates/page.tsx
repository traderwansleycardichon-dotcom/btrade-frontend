import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

interface SystemUpdate {
  id: string;
  version: string;
  title: string;
  description: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<SystemUpdate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    version: '',
    title: '',
    description: '',
    isPublished: false
  });

  const fetchUpdates = async () => {
    try {
      const { data } = await api.get('/system-updates/admin');
      setUpdates(data);
    } catch (err) {
      toast.error('Erreur lors du chargement des mises à jour');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleSave = async () => {
    try {
      if (isEditing) {
        await api.put(`/system-updates/admin/${isEditing.id}`, formData);
        toast.success('Mise à jour modifiée');
      } else {
        await api.post('/system-updates/admin', formData);
        toast.success('Mise à jour créée');
      }
      setIsEditing(null);
      setIsCreating(false);
      fetchUpdates();
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette mise à jour ?')) return;
    try {
      await api.delete(`/system-updates/admin/${id}`);
      toast.success('Supprimée');
      fetchUpdates();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const startEdit = (update: SystemUpdate) => {
    setIsEditing(update);
    setFormData({
      version: update.version,
      title: update.title,
      description: update.description,
      isPublished: update.isPublished
    });
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mises à jour système</h1>
          <p className="text-gray-400 text-sm">Gérez les notes de version affichées aux utilisateurs.</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setFormData({ version: '', title: '', description: '', isPublished: false });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle
        </button>
      </div>

      {(isCreating || isEditing) && (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">{isEditing ? 'Modifier' : 'Créer'} une mise à jour</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Version (ex: 1.2.0)</label>
              <input
                type="text"
                value={formData.version}
                onChange={e => setFormData({ ...formData, version: e.target.value })}
                className="w-full bg-[#242424] border border-white/10 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Titre</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#242424] border border-white/10 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description (HTML / Texte brut)</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#242424] border border-white/10 rounded-lg px-4 py-2 text-white h-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 rounded bg-[#242424] border-white/10 text-blue-500"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-white">Publier (visible par tous)</label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              onClick={() => { setIsEditing(null); setIsCreating(false); }}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#1A1A1A] rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#242424] border-b border-white/5 text-gray-400">
            <tr>
              <th className="p-4 font-medium">Version</th>
              <th className="p-4 font-medium">Titre</th>
              <th className="p-4 font-medium">Statut</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {updates.map(update => (
              <tr key={update.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 text-white">v{update.version}</td>
                <td className="p-4 text-white font-medium">{update.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${update.isPublished ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {update.isPublished ? 'Publié' : 'Brouillon'}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{new Date(update.createdAt).toLocaleDateString('fr-FR')}</td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => startEdit(update)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(update.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {updates.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">Aucune mise à jour trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
