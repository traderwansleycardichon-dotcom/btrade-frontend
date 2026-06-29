import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, FileText, Send, Loader2 } from 'lucide-react';
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

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contract-templates'],
    queryFn: async () => {
      const res = await api.get('/api/contracts/templates');
      return res.data.data as ContractTemplate[];
    }
  });

  const templates = data || [];

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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
