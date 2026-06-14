import React, { useEffect, useState } from 'react';
import { Mail, Edit2, Send, CheckCircle, XCircle, RefreshCw, X } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isActive: boolean;
  updatedAt: string;
}

const TEMPLATE_LABELS: Record<string, { label: string; desc: string }> = {
  welcome: { label: 'Bienvenue', desc: 'Envoyé à tout nouveau compte créé' },
  payment_success: { label: 'Paiement confirmé', desc: 'Envoyé après un premier paiement réussi' },
  renewal_success: { label: 'Renouvellement', desc: 'Envoyé lors du renouvellement mensuel automatique' },
  gift_subscription: { label: 'Abonnement offert', desc: 'Envoyé quand un admin offre un accès PRO' },
};

export default function AdminEmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/emails');
      setTemplates(res.data.data);
    } catch { addToast('Erreur chargement templates', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.put(`/api/admin/emails/${editing.id}`, {
        subject: editing.subject,
        body: editing.body,
        isActive: editing.isActive,
      });
      addToast('Template sauvegardé !');
      setEditing(null);
      fetchTemplates();
    } catch (e: any) {
      addToast(e.response?.data?.error || 'Erreur sauvegarde', 'error');
    } finally { setSaving(false); }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/api/admin/emails/${id}/toggle`);
      fetchTemplates();
    } catch { addToast('Erreur', 'error'); }
  };

  const handleTest = async (id: string) => {
    if (!testEmail) { addToast('Entrez un email de test', 'error'); return; }
    setSendingTest(id);
    try {
      await api.post(`/api/admin/emails/${id}/test`, { toEmail: testEmail });
      addToast(`Email de test envoyé à ${testEmail}`);
    } catch (e: any) {
      addToast(e.response?.data?.error || 'Erreur envoi test', 'error');
    } finally { setSendingTest(null); }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black mb-1">Emails Automatiques</h1>
          <p className="text-txt-2 text-sm">Gérez les templates d'emails envoyés automatiquement aux utilisateurs.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="email"
            placeholder="Email de test..."
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            className="bg-elevated border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent transition-all w-52"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0,1,2,3].map(i => <div key={i} className="glass rounded-3xl border border-border p-6 h-40 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(tpl => {
            const meta = TEMPLATE_LABELS[tpl.id] ?? { label: tpl.name, desc: '' };
            return (
              <div key={tpl.id} className={`glass rounded-3xl border p-6 transition-all ${tpl.isActive ? 'border-border' : 'border-border/30 opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="font-black text-sm">{meta.label}</p>
                      <p className="text-txt-3 text-[11px]">{meta.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(tpl.id)}
                    className={`shrink-0 ${tpl.isActive ? 'text-win' : 'text-txt-3'} hover:opacity-70 transition-all`}
                    title={tpl.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {tpl.isActive ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  </button>
                </div>

                <p className="text-xs text-txt-2 font-medium mb-1 truncate">
                  <span className="text-txt-3">Sujet :</span> {tpl.subject}
                </p>
                <p className="text-[10px] text-txt-3 mb-4">
                  Modifié le {new Date(tpl.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing({ ...tpl })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-elevated border border-border rounded-xl text-xs font-bold hover:bg-border transition-all"
                  >
                    <Edit2 size={12} /> Éditer
                  </button>
                  <button
                    onClick={() => handleTest(tpl.id)}
                    disabled={sendingTest === tpl.id || !testEmail}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-xl text-xs font-bold hover:bg-accent/20 transition-all disabled:opacity-40"
                  >
                    {sendingTest === tpl.id
                      ? <RefreshCw size={12} className="animate-spin" />
                      : <Send size={12} />}
                    Tester
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-3xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-black text-lg">
                Éditer — {TEMPLATE_LABELS[editing.id]?.label ?? editing.name}
              </h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-elevated rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">Sujet</label>
                <input
                  type="text"
                  value={editing.subject}
                  onChange={e => setEditing({ ...editing, subject: e.target.value })}
                  className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all"
                />
              </div>

              {/* Variables hint */}
              <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-[11px] text-txt-2">
                Variables disponibles :
                <span className="font-mono text-accent ml-1">{'{{fullName}}'}</span>
                <span className="font-mono text-accent ml-2">{'{{amount}}'}</span>
                <span className="font-mono text-accent ml-2">{'{{periodEnd}}'}</span>
                <span className="font-mono text-accent ml-2">{'{{loginUrl}}'}</span>
              </div>

              {/* Body HTML */}
              <div>
                <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">Corps (HTML)</label>
                <textarea
                  value={editing.body}
                  onChange={e => setEditing({ ...editing, body: e.target.value })}
                  rows={16}
                  className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-accent transition-all resize-y"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="flex-1 py-3 bg-elevated border border-border rounded-xl font-bold hover:bg-border transition-all text-sm"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-all text-sm flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw size={16} className="animate-spin" /> : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
