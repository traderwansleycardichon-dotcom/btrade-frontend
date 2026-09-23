import { useEffect, useId, useState } from 'react';
import { Eye, Link2, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import api from '../../lib/api';

interface PreviewProps {
  templateId?: string;
  subject: string;
  body: string;
  subjectOverride?: string;
}

export function CustomEmailPreview({ templateId = '', subject, body, subjectOverride }: PreviewProps) {
  const [mobile, setMobile] = useState(false);
  const [retry, setRetry] = useState(0);
  const [preview, setPreview] = useState<{ key: string; html: string; error: boolean } | null>(null);
  const key = JSON.stringify([templateId, subject, body, subjectOverride, retry]);
  const current = preview?.key === key ? preview : null;

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const result = await api.post('/api/admin/emails/preview', { templateId, subject, body, subjectOverride }, { signal: controller.signal });
        if (!controller.signal.aborted) setPreview({ key, html: result.data.data.body, error: false });
      } catch {
        if (!controller.signal.aborted) setPreview({ key, html: '', error: true });
      }
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [templateId, subject, body, subjectOverride, key]);

  return (
    <section className="rounded-2xl border border-border overflow-hidden" aria-label="Aperçu de l’email">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-elevated border-b border-border">
        <span className="flex items-center gap-2 text-xs font-bold"><Eye size={15} /> Aperçu destinataire</span>
        <div className="flex gap-1">
          <button type="button" aria-label="Aperçu ordinateur" aria-pressed={!mobile} onClick={() => setMobile(false)} className={`p-2 rounded-lg ${!mobile ? 'bg-accent/10 text-accent' : 'text-txt-3'}`}><Monitor size={16} /></button>
          <button type="button" aria-label="Aperçu téléphone" aria-pressed={mobile} onClick={() => setMobile(true)} className={`p-2 rounded-lg ${mobile ? 'bg-accent/10 text-accent' : 'text-txt-3'}`}><Smartphone size={16} /></button>
        </div>
      </div>
      <div className="bg-[#e8eaee] p-2 sm:p-4 min-h-52" aria-busy={!current}>
        {!current ? (
          <p role="status" className="flex items-center justify-center gap-2 py-20 text-sm text-slate-600"><RefreshCw size={16} className="animate-spin" /> Préparation de l’aperçu…</p>
        ) : current.error ? (
          <div className="py-16 px-4 text-center">
            <p role="alert" className="text-sm text-red-700">Impossible de charger l’aperçu. Vérifiez la connexion et réessayez.</p>
            <button type="button" onClick={() => setRetry(value => value + 1)} className="mt-4 px-4 py-2 bg-white text-slate-900 rounded-xl text-sm font-bold">Réessayer</button>
          </div>
        ) : (
          <iframe title="Aperçu de votre email" sandbox="" referrerPolicy="no-referrer" srcDoc={current.html} className="block mx-auto w-full border-0 bg-white rounded-xl" style={{ maxWidth: mobile ? 375 : 680, height: 620 }} />
        )}
      </div>
      <p className="px-4 py-3 text-[11px] text-txt-3 bg-surface">Même modèle que l’email envoyé. Les variables sont illustrées avec un destinataire de test. L’affichage peut varier selon la messagerie.</p>
    </section>
  );
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));

export function CustomEmailEditor({ onChange, ...previewProps }: PreviewProps & { onChange: (body: string) => void }) {
  const id = useId();
  const [showLink, setShowLink] = useState(false);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const insertLink = () => {
    try {
      const parsed = new URL(url.trim());
      if (!['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('url');
      if (!label.trim() || /[\[\]\r\n]/.test(label)) {
        setError('Ajoutez un texte de bouton sans crochets ni saut de ligne.');
        return;
      }
      const target = parsed.href.replace(/\(/g, '%28').replace(/\)/g, '%29');
      const isHtml = /<\/?[a-z][^>]*>/i.test(previewProps.body);
      const link = isHtml
        ? `<p><a href="${escapeHtml(target)}">${escapeHtml(label.trim())}</a></p>`
        : `[${label.trim()}](${target})`;
      onChange(`${previewProps.body}${previewProps.body ? '\n\n' : ''}${link}`);
      setShowLink(false);
      setLabel('');
      setUrl('');
      setError('');
    } catch {
      setError('Utilisez un lien valide commençant par https://, http://, mailto: ou tel:.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-xs text-txt-2 leading-relaxed">
        <span className="font-bold text-accent">Email personnalisé premium</span>
        <p className="mt-1">Écrivez votre message : les paragraphes sont conservés et vos liens deviennent des boutons aux couleurs de Haitian Wall Street. Le HTML simple est aussi accepté.</p>
      </div>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label htmlFor={`${id}-body`} className="text-xs font-bold text-txt-2 uppercase tracking-widest">Votre message</label>
          <button type="button" onClick={() => setShowLink(value => !value)} aria-expanded={showLink} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 text-accent text-xs font-bold"><Link2 size={14} /> Ajouter un bouton</button>
        </div>
        <textarea id={`${id}-body`} value={previewProps.body} onChange={event => onChange(event.target.value)} rows={10} maxLength={100000} required placeholder={'Bonjour {{fullName}},\n\nÉcrivez votre message ici…\n\nCollez un lien ou ajoutez un bouton.'} className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-accent transition-all resize-y" />
        <p className="mt-1 text-[11px] text-txt-3">Pour un bouton nommé : [Rejoindre le live](https://…). Le texte entre crochets sera visible sur le bouton.</p>
      </div>
      {showLink && (
        <div className="p-4 rounded-xl bg-elevated border border-border space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label htmlFor={`${id}-label`} className="block text-xs font-bold mb-2">Texte du bouton</label><input id={`${id}-label`} value={label} onChange={event => setLabel(event.target.value)} maxLength={120} placeholder="Rejoindre le live" className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm" /></div>
            <div><label htmlFor={`${id}-url`} className="block text-xs font-bold mb-2">Lien du bouton</label><input id={`${id}-url`} type="text" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://…" className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm" /></div>
          </div>
          {error && <p role="alert" className="text-xs text-loss">{error}</p>}
          <button type="button" onClick={insertLink} className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold">Insérer le bouton</button>
        </div>
      )}
      <CustomEmailPreview {...previewProps} />
    </div>
  );
}
