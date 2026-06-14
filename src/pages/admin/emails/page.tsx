import React, { useEffect, useState } from 'react';
import { Mail, Edit2, Send, CheckCircle, XCircle, RefreshCw, X, Plus, Trash2 } from 'lucide-react';
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

interface EmailCampaign {
  id: string;
  templateId: string;
  subject: string;
  segment: string;
  sentCount: number;
  sentAt: string;
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
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns'>('templates');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ id: '', name: '', subject: '', body: '' });
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    templateId: '',
    subjectOverride: '',
    segment: 'all' as 'all' | 'pro' | 'free',
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/emails');
      setTemplates(res.data.data);
    } catch { addToast('Erreur chargement templates', 'error'); }
    finally { setLoading(false); }
  };

  const fetchCampaigns = async () => {
    setCampaignLoading(true);
    try {
      const res = await api.get('/api/admin/emails/campaigns');
      setCampaigns(res.data.data);
    } catch { addToast('Erreur chargement campagnes', 'error'); }
    finally { setCampaignLoading(false); }
  };

  useEffect(() => { fetchTemplates(); fetchCampaigns(); }, []);

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.templateId) return addToast('Sélectionne un template', 'error');
    const segmentLabel = { all: 'tous les utilisateurs', pro: 'utilisateurs PRO', free: 'utilisateurs FREE' }[campaignForm.segment];
    if (!window.confirm(`Envoyer cette campagne à ${segmentLabel} ?`)) return;
    setSending(true);
    try {
      const res = await api.post('/api/admin/emails/campaign', {
        templateId: campaignForm.templateId,
        subjectOverride: campaignForm.subjectOverride.trim() || undefined,
        segment: campaignForm.segment,
      });
      addToast(`Campagne envoyée à ${res.data.data.sentCount} destinataires`);
      setCampaignForm({ templateId: '', subjectOverride: '', segment: 'all' });
      fetchCampaigns();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erreur envoi campagne', 'error');
    } finally { setSending(false); }
  };

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/admin/emails', createForm);
      addToast('Template créé avec succès !');
      setIsCreateOpen(false);
      setCreateForm({ id: '', name: '', subject: '', body: '' });
      fetchTemplates();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erreur création', 'error');
    } finally { setCreating(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Supprimer le template "${name}" ?`)) return;
    try {
      await api.delete(`/api/admin/emails/${id}`);
      addToast('Template supprimé');
      fetchTemplates();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erreur suppression', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black mb-1">Emails Automatiques</h1>
          <p className="text-txt-2 text-sm">Gérez les templates d'emails envoyés automatiquement aux utilisateurs.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent/90 transition-colors"
          >
            <Plus size={16} /> Nouveau template
          </button>
          <input
            type="email"
            placeholder="Email de test..."
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            className="bg-elevated border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent transition-all w-52"
          />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'templates' ? 'border-accent text-accent' : 'border-transparent text-txt-2 hover:text-txt'}`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'campaigns' ? 'border-accent text-accent' : 'border-transparent text-txt-2 hover:text-txt'}`}
        >
          Campagnes
        </button>
      </div>

      {activeTab === 'templates' && (loading ? (
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
                  {!['welcome','payment_success','renewal_success','gift_subscription','new_course'].includes(tpl.id) && (
                    <button
                      onClick={() => handleDelete(tpl.id, meta.label)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-loss/10 text-loss border border-loss/20 rounded-xl text-xs font-bold hover:bg-loss/20 transition-all"
                    >
                      <Trash2 size={12} /> Supprimer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {activeTab === 'campaigns' && (
        <div className="space-y-8">
          <div className="glass p-6 rounded-3xl border border-border">
            <h3 className="font-semibold text-txt mb-5">Nouvelle campagne</h3>
            <form onSubmit={handleSendCampaign} className="space-y-4">
              <div>
                <label className="block text-txt-2 text-xs font-bold uppercase tracking-widest mb-1.5">Template</label>
                <select
                  value={campaignForm.templateId}
                  onChange={e => setCampaignForm(p => ({ ...p, templateId: e.target.value }))}
                  className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-txt text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">— Sélectionner un template —</option>
                  {templates.filter(t => t.isActive).map(t => (
                    <option key={t.id} value={t.id}>
                      {TEMPLATE_LABELS[t.id]?.label || t.id} — {t.subject}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-txt-2 text-xs font-bold uppercase tracking-widest mb-1.5">Sujet personnalisé (optionnel)</label>
                <input
                  type="text"
                  value={campaignForm.subjectOverride}
                  onChange={e => setCampaignForm(p => ({ ...p, subjectOverride: e.target.value }))}
                  placeholder="Laisse vide pour utiliser le sujet du template"
                  className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-txt text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-txt-2 text-xs font-bold uppercase tracking-widest mb-1.5">Segment</label>
                <div className="flex gap-2">
                  {(['all', 'pro', 'free'] as const).map(seg => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => setCampaignForm(p => ({ ...p, segment: seg }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${campaignForm.segment === seg ? 'bg-accent text-white border-accent' : 'border-border text-txt-2 hover:bg-elevated'}`}
                    >
                      {seg === 'all' ? 'Tout le monde' : seg === 'pro' ? 'PRO' : 'FREE'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={sending || !campaignForm.templateId}
                className="w-full py-3 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={16} />
                {sending ? 'Envoi en cours...' : 'Envoyer la campagne'}
              </button>
            </form>
          </div>

          <div>
            <h3 className="font-semibold text-txt mb-4">Historique des campagnes</h3>
            {campaignLoading ? (
              <div className="text-txt-2 text-sm">Chargement...</div>
            ) : campaigns.length === 0 ? (
              <div className="text-txt-2 text-sm text-center py-8">Aucune campagne envoyée</div>
            ) : (
              <div className="space-y-2">
                {campaigns.map(c => (
                  <div key={c.id} className="glass border border-border rounded-2xl px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-txt text-sm font-semibold">{c.subject}</p>
                      <p className="text-txt-2 text-xs mt-0.5">
                        {TEMPLATE_LABELS[c.templateId]?.label || c.templateId} · {c.segment === 'all' ? 'Tout le monde' : c.segment.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-accent text-sm font-black">{c.sentCount} envoyés</p>
                      <p className="text-txt-3 text-xs">{new Date(c.sentAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="font-black text-lg flex items-center gap-2"><Plus size={18} className="text-accent" /> Nouveau template email</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-elevated rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">ID (slug unique)</label>
                  <input
                    type="text"
                    value={createForm.id}
                    onChange={e => setCreateForm(p => ({ ...p, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }))}
                    placeholder="ex: promo_black_friday"
                    required
                    className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-accent transition-all"
                  />
                  <p className="text-txt-3 text-[10px] mt-1">Minuscules, chiffres et _ uniquement</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">Nom affiché</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="ex: Promo Black Friday"
                    required
                    className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">Sujet</label>
                <input
                  type="text"
                  value={createForm.subject}
                  onChange={e => setCreateForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Sujet de l'email..."
                  required
                  className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all"
                />
              </div>
              <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-[11px] text-txt-2">
                Variables disponibles dans le corps :
                <span className="font-mono text-accent ml-1">{'{{fullName}}'}</span>
                <span className="font-mono text-accent ml-2">{'{{loginUrl}}'}</span>
                <span className="font-mono text-accent ml-2">{'{{amount}}'}</span>
                <span className="font-mono text-accent ml-2">{'{{periodEnd}}'}</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">Corps (HTML)</label>
                <textarea
                  value={createForm.body}
                  onChange={e => setCreateForm(p => ({ ...p, body: e.target.value }))}
                  rows={14}
                  placeholder="<div>Votre contenu HTML ici...</div>"
                  required
                  className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-accent transition-all resize-y"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-3 bg-elevated border border-border rounded-xl font-bold hover:bg-border transition-all text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={creating} className="flex-1 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-all text-sm flex items-center justify-center gap-2">
                  {creating ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                  {creating ? 'Création...' : 'Créer le template'}
                </button>
              </div>
            </form>
          </div>
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
