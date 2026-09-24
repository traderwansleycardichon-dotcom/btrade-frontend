import { useEffect, useId, useState } from 'react';
import { Eye, Link2, Monitor, Smartphone, RefreshCw, Image as ImageIcon } from 'lucide-react';
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
const unescapeHtml = (value: string) => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

// The button lives on its own trailing line so an inline link inside a sentence is never rewritten.
const HTML_BUTTON = /(?:^|\r?\n)[ \t]*<p>\s*<a href="([^"]*)"\s*>([^<]*)<\/a>\s*<\/p>[ \t]*$/i;
const TEXT_BUTTON = /(?:^|\r?\n)[ \t]*\[([^\]\r\n]+)\]\(([^()\s]+)\)[ \t]*$/;

// The image lives at the very beginning of the body
const HTML_IMAGE = /^\s*<p>\s*<img\s+src="([^"]+)"\s+alt="Banner"[^>]*>\s*<\/p>\s*/i;
const TEXT_IMAGE = /^\s*!\[Banner\]\(([^)\s]+)\)\s*/i;

const isHtmlBody = (body: string) => /<\/?[a-z][^>]*>/i.test(body);

const safeUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    if (!['https:', 'http:', 'mailto:', 'tel:'].includes(parsed.protocol) || parsed.username || parsed.password) return null;
    return parsed.href;
  } catch { return null; }
};

function findButton(body: string) {
  const html = HTML_BUTTON.exec(body);
  if (html) return { label: unescapeHtml(html[2]), url: unescapeHtml(html[1]), start: html.index };
  const text = TEXT_BUTTON.exec(body);
  if (text) return { label: text[1], url: text[2], start: text.index };
  return null;
}

function writeButton(body: string, label: string, url: string) {
  const found = findButton(body);
  const base = (found ? body.slice(0, found.start) : body).replace(/\s+$/, '');
  const target = safeUrl(url.trim());
  if (!target || !label.trim() || /[[\]\r\n]/.test(label)) return base;
  const href = target.replace(/\(/g, '%28').replace(/\)/g, '%29');
  const button = isHtmlBody(base)
    ? `<p><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></p>`
    : `[${label}](${href})`;
  return `${base}${base ? '\n\n' : ''}${button}`;
}

function findImage(body: string) {
  const html = HTML_IMAGE.exec(body);
  if (html) return { url: unescapeHtml(html[1]), end: html[0].length };
  const text = TEXT_IMAGE.exec(body);
  if (text) return { url: text[1], end: text[0].length };
  return null;
}

function writeImage(body: string, url: string) {
  const found = findImage(body);
  const base = (found ? body.slice(found.end) : body).replace(/^\s+/, '');
  const target = safeUrl(url.trim());
  if (!target) return base;
  const href = target.replace(/\(/g, '%28').replace(/\)/g, '%29');
  const image = isHtmlBody(base)
    ? `<p><img src="${escapeHtml(href)}" alt="Banner" style="max-width: 100%; border-radius: 8px; margin-bottom: 24px; display: block;" /></p>`
    : `![Banner](${href})`;
  return `${image}\n\n${base}`;
}

export function CustomEmailEditor({ onChange, ...previewProps }: PreviewProps & { onChange: (body: string) => void }) {
  const id = useId();
  const existing = findButton(previewProps.body);
  const existingImg = findImage(previewProps.body);
  const [button, setButton] = useState({ label: existing?.label ?? '', url: existing?.url ?? '' });
  const [imageUrl, setImageUrl] = useState(existingImg?.url ?? '');

  const update = (next: { label: string; url: string }) => {
    setButton(next);
    let currentBody = writeImage(previewProps.body, imageUrl);
    onChange(writeButton(currentBody, next.label, next.url));
  };

  const updateImage = (url: string) => {
    setImageUrl(url);
    let baseBody = writeButton(previewProps.body, button.label, button.url);
    onChange(writeImage(baseBody, url));
  };

  const label = button.label.trim();
  const url = button.url.trim();
  const error = /[[\]\r\n]/.test(button.label) ? 'Le texte du bouton ne peut pas contenir de crochets ni de saut de ligne.'
    : url && !safeUrl(url) ? 'Utilisez un lien valide commençant par https://, http://, mailto: ou tel:.'
    : url && !label ? 'Ajoutez le texte qui sera affiché sur le bouton.'
    : label && !url ? 'Ajoutez le lien vers lequel le bouton doit mener.'
    : '';

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-xs text-txt-2 leading-relaxed">
        <span className="font-bold text-accent">Email personnalisé premium</span>
        <p className="mt-1">Écrivez votre message : les paragraphes sont conservés et vos liens deviennent des boutons aux couleurs de Behind The Trades. Le HTML simple est aussi accepté.</p>
      </div>
      <div className="p-4 rounded-xl bg-elevated border border-border space-y-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-txt-2 uppercase tracking-widest"><ImageIcon size={14} /> Image d'en-tête (Optionnel)</p>
        <div>
          <label htmlFor={`${id}-image`} className="block text-xs font-bold mb-2">Lien de l'image (URL)</label>
          <input id={`${id}-image`} type="text" value={imageUrl} onChange={event => updateImage(event.target.value)} placeholder="https://..." className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm" />
        </div>
        <p className="text-[11px] text-txt-3">Cette image s'affichera tout en haut de l'email, parfaite pour une bannière.</p>
      </div>
      <div>
        <label htmlFor={`${id}-body`} className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">Votre message</label>
        <textarea id={`${id}-body`} value={previewProps.body} onChange={event => onChange(event.target.value)} rows={10} maxLength={100000} required placeholder={'Bonjour {{fullName}},\n\nÉcrivez votre message ici…'} className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-accent transition-all resize-y" />
      </div>
      <div className="p-4 rounded-xl bg-elevated border border-border space-y-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-txt-2 uppercase tracking-widest"><Link2 size={14} /> Bouton de l’email</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-label`} className="block text-xs font-bold mb-2">Texte du bouton</label>
            <input id={`${id}-label`} value={button.label} onChange={event => update({ ...button, label: event.target.value })} maxLength={120} placeholder="Votre texte" className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor={`${id}-url`} className="block text-xs font-bold mb-2">Lien du bouton</label>
            <input id={`${id}-url`} type="text" value={button.url} onChange={event => update({ ...button, url: event.target.value })} placeholder="https://…" className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm" />
          </div>
        </div>
        {error
          ? <p role="alert" className="text-xs text-loss">{error}</p>
          : <p className="text-[11px] text-txt-3">Le bouton est ajouté à la fin du message. Laissez les deux champs vides pour un email sans bouton.</p>}
      </div>
      <CustomEmailPreview {...previewProps} />
    </div>
  );
}
