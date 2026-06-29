import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, FileText, Send, Loader2, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

interface ContractTemplate {
  id: string;
  title: string;
  isDraft: boolean;
  createdAt: string;
}

export default function AdminContractsPage() {
  const navigate = useNavigate();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contract-templates'],
    queryFn: async () => {
      const res = await api.get('/api/contracts/templates');
      return res.data.data as ContractTemplate[];
    }
  });

  const templates = data || [];

  // Load users for assignment
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/api/admin/users');
      return res.data.data;
    },
    enabled: isAssignModalOpen
  });

  const users = Array.isArray(usersData) ? usersData : [];

  const handleAssign = async () => {
    if (!selectedTemplateId) return;
    if (selectedUsers.length === 0) {
      toast.error('Sélectionnez au moins un utilisateur');
      return;
    }

    try {
      setIsAssigning(true);
      const res = await api.post('/api/contracts/assign', {
        templateId: selectedTemplateId,
        userIds: selectedUsers
      });

      if (res.data.success) {
        toast.success(`Contrat envoyé à ${selectedUsers.length} utilisateur(s)`);
        setIsAssignModalOpen(false);
        setSelectedUsers([]);
        setSelectedTemplateId(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Contrats</h1>
          <p className="text-white/60 text-sm">Créez et assignez des contrats à vos utilisateurs.</p>
        </div>
        <Link 
          to="/admin/contracts/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Nouveau Modèle
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="h-8 w-8 text-accent animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Aucun modèle de contrat pour le moment.</p>
            <Link to="/admin/contracts/new" className="text-accent hover:underline mt-2 inline-block">
              Créer votre premier modèle
            </Link>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10 text-white/60 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Titre du Modèle</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium">Date de création</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {templates.map(template => (
                <tr key={template.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{template.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${template.isDraft ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                      {template.isDraft ? 'Brouillon' : 'Actif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/60 text-sm">
                    {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/admin/contracts/new?id=${template.id}`)}
                      className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors mr-2"
                      title="Modifier"
                    >
                      <FileText size={16} />
                    </button>
                    {!template.isDraft && (
                      <button
                        onClick={() => {
                          setSelectedTemplateId(template.id);
                          setIsAssignModalOpen(true);
                        }}
                        className="p-2 bg-win/20 hover:bg-win/40 text-win rounded-lg transition-colors"
                        title="Envoyer"
                      >
                        <Send size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-bg border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Users className="text-accent" />
              Assigner le contrat
            </h3>
            <p className="text-white/60 text-sm mb-6">
              Sélectionnez les utilisateurs qui doivent signer ce contrat. Un email leur sera envoyé.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-6 hide-scrollbar border border-white/5 rounded-lg p-2 bg-white/5">
              {users.length > 0 && !isLoadingUsers && (
                <label className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors border-b border-white/10 mb-2">
                  <input 
                    type="checkbox" 
                    className="rounded border-white/20 bg-bg text-accent focus:ring-accent"
                    checked={selectedUsers.length === users.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map((u: any) => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                  <div className="text-sm font-bold text-white">Tout sélectionner</div>
                </label>
              )}
              {isLoadingUsers ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin text-accent" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center text-white/50 py-4 text-sm">
                  Aucun utilisateur trouvé.
                </div>
              ) : (
                users.map((user: any) => (
                  <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="rounded border-white/20 bg-bg text-accent focus:ring-accent"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium text-white">{user.fullName || 'Utilisateur'}</div>
                      <div className="text-xs text-white/50">{user.email}</div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsAssignModalOpen(false);
                  setSelectedTemplateId(null);
                }}
                className="px-4 py-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleAssign}
                disabled={isAssigning || selectedUsers.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isAssigning ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
