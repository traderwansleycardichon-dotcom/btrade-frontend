import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Save, Send, ArrowLeft, Loader2, Users } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

export default function AdminContractEditorPage() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('id');
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Assignation
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const modules = useMemo(() => ({
    table: true,
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
        ['table'],
        ['clean']
      ],
      handlers: {
        table: function() {
          // @ts-ignore - this.quill is available in handler context
          const quill = this.quill;
          const tableModule = quill.getModule('table');
          if (tableModule) {
            tableModule.insertTable(1, 2);
          }
        }
      }
    }
  }), []);

  // Load existing template if editing
  useEffect(() => {
    if (templateId) {
      api.get('/api/contracts/templates').then((res) => {
        const templates = res.data.data;
        const template = templates.find((t: any) => t.id === templateId);
        if (template) {
          setTitle(template.title);
          setContent(template.content);
        }
      });
    }
  }, [templateId]);

  // Load users for assignment
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/api/admin/users');
      return res.data.data;
    },
    enabled: isAssignModalOpen // Only fetch when modal is open
  });

  const users = usersData?.users || [];

  const handleSave = async (isDraft: boolean) => {
    if (!title.trim() || !content.trim()) {
      toast.error('Le titre et le contenu sont requis');
      return;
    }

    try {
      setIsSaving(true);
      const res = await api.post('/api/contracts/templates', {
        id: templateId || undefined,
        title,
        content,
        isDraft
      });

      if (res.data.success) {
        toast.success('Modèle de contrat enregistré');
        if (!templateId) {
          navigate(`/admin/contracts/new?id=${res.data.data.id}`, { replace: true });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur de sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!templateId) {
      toast.error('Veuillez d\'abord enregistrer le contrat');
      return;
    }
    if (selectedUsers.length === 0) {
      toast.error('Sélectionnez au moins un utilisateur');
      return;
    }

    try {
      setIsAssigning(true);
      const res = await api.post('/api/contracts/assign', {
        templateId,
        userIds: selectedUsers
      });

      if (res.data.success) {
        toast.success(`Contrat envoyé à ${selectedUsers.length} utilisateur(s)`);
        setIsAssignModalOpen(false);
        setSelectedUsers([]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/contracts')}
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white/60"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {templateId ? 'Éditer le contrat' : 'Nouveau Contrat'}
            </h1>
            <p className="text-white/60 text-sm">Créez votre modèle avec l'éditeur de texte</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Brouillon
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors text-sm font-medium disabled:opacity-50"
          >
            Enregistrer
          </button>
          {templateId && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-win text-white rounded-lg hover:bg-win/80 transition-colors text-sm font-medium"
            >
              <Send size={16} />
              Envoyer
            </button>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-2">Titre du contrat</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Contrat de Gestion de Compte"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-accent focus:outline-none focus:bg-white/10"
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium text-white/70 mb-2">Contenu du contrat</label>
          <p className="text-xs text-white/40 mb-3">
            Variables disponibles: <code>{`{{user_name}}`}</code>, <code>{`{{date}}`}</code>
          </p>
          <div className="bg-bg border border-white/10 rounded-lg overflow-hidden text-white quill-dark">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent}
              style={{ height: '400px' }}
              modules={modules}
            />
          </div>
        </div>
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
              {users.map((user: any) => (
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
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsAssignModalOpen(false)}
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
                Envoyer aux utilisateurs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
