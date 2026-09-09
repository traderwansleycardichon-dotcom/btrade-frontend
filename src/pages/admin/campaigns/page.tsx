import React, { useEffect, useState } from 'react';
import { Send, RefreshCw } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  isActive: boolean;
}

interface EmailCampaign {
  id: string;
  templateId: string;
  subject: string;
  segment: string;
  sentCount: number;
  sentAt: string;
}

const TEMPLATE_LABELS: Record<string, string> = {
  welcome: 'Bienvenue',
  payment_success: 'Paiement confirmé',
  renewal_success: 'Renouvellement',
  gift_subscription: 'Abonnement offert',
  new_course: 'Nouveau cours',
};

export default function AdminCampaignsPage() {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    templateId: '',
    subjectOverride: '',
    segment: 'all' as 'all' | 'pro' | 'free',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tplRes, campRes] = await Promise.all([
        api.get('/api/admin/emails'),
        api.get('/api/admin/emails/campaigns'),
      ]);
      setTemplates(tplRes.data.data.filter((t: EmailTemplate) => t.isActive));
      setCampaigns(campRes.data.data);
    } catch {
      addToast('Erreur chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.templateId) return addToast('Sélectionne un template', 'error');
    const label = { all: 'tous les utilisateurs', pro: 'utilisateurs PRO', free: 'utilisateurs FREE' }[form.segment];
    if (!window.confirm(`Envoyer cette campagne à ${label} ?`)) return;
    setSending(true);
    try {
      const res = await api.post('/api/admin/emails/campaign', {
        templateId: form.templateId,
        subjectOverride: form.subjectOverride.trim() || undefined,
        segment: form.segment,
      });
      addToast(`Campagne envoyée à ${res.data.data.sentCount} destinataires`);
      setForm({ templateId: '', subjectOverride: '', segment: 'all' });
      fetchData();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erreur envoi campagne', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (c: EmailCampaign) => {
    const label = { all: 'tous les utilisateurs', pro: 'utilisateurs PRO', free: 'utilisateurs FREE' }[c.segment as 'all'|'pro'|'free'];
    if (!window.confirm(`Voulez-vous Renvoyer cette campagne ("${c.subject}") à ${label} ?`)) return;
    setSending(true);
    try {
      const res = await api.post('/api/admin/emails/campaign', {
        templateId: c.templateId,
        subjectOverride: c.subject,
        segment: c.segment,
      });
      addToast(`Campagne renvoyée à ${res.data.data.sentCount} destinataires`);
      fetchData();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erreur envoi campagne', 'error');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 text-txt-2">Chargement...</div>;

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-black mb-2 flex items-center gap-3">
          <Send className="text-loss" />
          Campagnes Email
        </h1>
        <p className="text-txt-2 text-sm">Envoyez des campagnes ciblées aux utilisateurs de la plateforme.</p>
      </div>

      {/* Composer */}
      <div className="glass p-8 rounded-3xl border border-border">
        <h3 className="font-bold text-lg mb-6">Nouvelle campagne</h3>
        <form onSubmit={handleSend} className="space-y-5 max-w-xl">
          <div>
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Template</label>
            <select
              value={form.templateId}
              onChange={e => setForm(p => ({ ...p, templateId: e.target.value }))}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-txt text-sm focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">— Sélectionner un template —</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {TEMPLATE_LABELS[t.id] || t.id} — {t.subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Sujet personnalisé (optionnel)</label>
            <input
              type="text"
              value={form.subjectOverride}
              onChange={e => setForm(p => ({ ...p, subjectOverride: e.target.value }))}
              placeholder="Laisse vide pour utiliser le sujet du template"
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-txt text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Segment</label>
            <div className="flex gap-4">
              {['all', 'pro', 'free'].map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="segment"
                    value={s}
                    checked={form.segment === s}
                    onChange={e => setForm(p => ({ ...p, segment: e.target.value as any }))}
                    className="accent-accent"
                  />
                  {s.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="mt-4 px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent-2 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Envoyer la campagne
          </button>
        </form>
      </div>

      {/* Historique */}
      <div className="glass rounded-3xl border border-border overflow-hidden">
        <div className="p-8 border-b border-border bg-surface/50">
          <h3 className="font-bold text-lg">Historique des envois</h3>
        </div>
        {campaigns.length === 0 ? (
          <p className="p-8 text-txt-2 text-sm text-center">Aucune campagne envoyée pour le moment.</p>
        ) : (
          <div className="divide-y divide-border">
            {campaigns.map(c => (
              <div key={c.id} className="px-8 py-4 flex items-center justify-between hover:bg-surface/50 transition-colors">
                <div className="flex-1">
                  <p className="font-bold text-sm">{c.subject}</p>
                  <p className="text-txt-2 text-xs mt-0.5">
                    Template: <span className="text-txt">{TEMPLATE_LABELS[c.templateId] || c.templateId}</span>
                    {' · '}
                    Segment: <span className="text-txt">{c.segment === 'all' ? 'Tout le monde' : c.segment.toUpperCase()}</span>
                  </p>
                </div>
                <div className="text-right shrink-0 mx-6">
                  <p className="text-accent font-black text-lg">{c.sentCount}</p>
                  <p className="text-txt-3 text-xs">destinataires</p>
                  <p className="text-txt-3 text-[10px]">{new Date(c.sentAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="shrink-0">
                  <button 
                    onClick={() => handleResend(c)}
                    disabled={sending}
                    className="flex items-center gap-2 px-4 py-2 bg-elevated hover:bg-white/5 border border-border hover:border-accent text-txt text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${sending ? 'animate-spin' : ''}`} />
                    Renvoyer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
