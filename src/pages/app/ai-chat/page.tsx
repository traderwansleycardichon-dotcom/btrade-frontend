import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, Sparkles, ArrowLeft, MessageSquare, RefreshCw } from 'lucide-react';
import { useAiChat, explainEvent, type AiSource } from '../../../hooks/useAiChat';
import api from '../../../lib/api';
import { FeatureGate } from '../../../components/ui/FeatureGate';

const COUNTRY_TO_ISO: Record<string, string> = {
  US: 'us', USD: 'us', EU: 'eu', EUR: 'eu', GB: 'gb', GBP: 'gb',
  JP: 'jp', JPY: 'jp', CA: 'ca', AU: 'au', CH: 'ch', CN: 'cn',
};

const IMP_LABEL: Record<number, { label: string; color: string }> = {
  3: { label: 'High',   color: 'text-loss' },
  2: { label: 'Medium', color: 'text-accent' },
  1: { label: 'Low',    color: 'text-txt-3' },
};

// Suggestions pour un event macro (contexte spécifique)
const SUGGEST_EVENT = [
  "Quel impact sur les marchés ?",
  "Quelles paires sont les plus sensibles ?",
  "Quelle stratégie avant/après la news ?",
  "Comment gérer le risque sur cet event ?",
  "Quelle surprise haussière vs baissière ?",
];

// Suggestions génériques pour le chat sans contexte
const SUGGEST_GENERIC = [
  "Comment calculer mon sizing de position ?",
  "Explique le concept de Risk/Reward",
  "Comment éviter le revenge trading ?",
  "Qu'est-ce qu'une prop firm et comment passer un challenge ?",
  "Comment analyser mes stats de trading ?",
  "Explique la structure de marché SMC",
];

const AiChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [event, setEvent] = useState<any>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  const context = event ? { type: 'macro_event', event } : {};
  const { messages, isLoading, error, send, pushAssistant, setMessages } = useAiChat(context);

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Charger l'event + explication initiale au mount
  useEffect(() => {
    if (!eventId) return;
    setLoadingEvent(true);
    explainEvent(eventId)
      .then(({ event: evt, explanation }) => {
        setEvent(evt);
        // Première bulle assistant = explication "fond en comble"
        setMessages([
          {
            role: 'assistant',
            content: explanation.content,
            source: explanation.source,
          },
        ]);
      })
      .catch(() => {
        setMessages([
          { role: 'assistant', content: "Désolé, je n'ai pas pu charger cet événement.", source: 'stub' },
        ]);
      })
      .finally(() => setLoadingEvent(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const onSend = () => {
    if (!input.trim()) return;
    send(input);
    setInput('');
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const iso = event?.pays ? COUNTRY_TO_ISO[event.pays.toUpperCase()] : '';
  const imp = event?.importance ? IMP_LABEL[event.importance] : null;
  const eventDate = event?.dateEvent ? new Date(event.dateEvent) : null;

  return (
    <div className="flex flex-col gap-3 animate-[fadeIn_0.4s_ease-out]" style={{ height: 'calc(100vh - 7rem)', minHeight: '500px' }}>
      {/* HEADER */}
      <div className="surface rounded-lg px-4 py-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 text-txt-2 hover:text-txt"
          title="Retour"
        >
          <ArrowLeft size={14} />
        </button>
        <Sparkles size={14} className="text-accent" />
        <h2 className="font-bold text-xs uppercase tracking-widest">Chat IA</h2>

        {event && (
          <>
            <div className="h-4 w-px bg-border" />
            {iso && (
              <img
                src={`https://flagcdn.com/32x24/${iso}.png`}
                alt={event.pays}
                className="w-5 h-4 rounded-sm object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{event.titre || event.typeEvent}</p>
              <div className="flex items-center gap-2 text-[10px] mono text-txt-3 mt-0.5">
                <span>{event.pays}</span>
                {eventDate && (
                  <>
                    <span>·</span>
                    <span>
                      {eventDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} ·{' '}
                      {eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </>
                )}
                {imp && (
                  <>
                    <span>·</span>
                    <span className={`font-bold uppercase tracking-wider ${imp.color}`}>{imp.label}</span>
                  </>
                )}
              </div>
            </div>

            {/* Chiffres rapides */}
            <div className="flex items-center gap-3 text-[10px] mono text-txt-2">
              {event.valeurPrev != null && (
                <span>Préc <b className="text-txt">{event.valeurPrev}</b></span>
              )}
              {event.valeurConsensus != null && (
                <span>Cons <b className="text-txt">{event.valeurConsensus}</b></span>
              )}
              {event.valeurActual != null && (
                <span>Actu <b className="text-accent">{event.valeurActual}</b></span>
              )}
            </div>
          </>
        )}
      </div>

      {/* MESSAGES */}
      <div ref={scrollRef} className="surface rounded-lg flex-1 overflow-y-auto p-5 space-y-4">
        {loadingEvent && (
          <div className="text-center text-[11px] text-txt-3 py-8">Chargement de l'événement…</div>
        )}

        {!eventId && messages.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={28} className="mx-auto text-txt-3 mb-3" />
            <p className="text-xs font-bold mb-1">BTrade Coach — Ton mentor trading IA</p>
            <p className="text-[10px] text-txt-3 max-w-xs mx-auto leading-relaxed">
              Setups, analyse technique, macro, risk management, prop firms, psychologie…
              <br />
              <span className="text-accent/70">Spécialisé trading uniquement.</span>
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content} source={m.source} />
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
              <Sparkles size={14} className="text-accent animate-pulse" />
            </div>
            <div className="flex items-center gap-1 pt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-txt-3 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-txt-3 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-txt-3 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="text-[11px] text-loss bg-loss/10 px-3 py-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* SUGGESTIONS */}
      {messages.length <= 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {(event ? SUGGEST_EVENT : SUGGEST_GENERIC).map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={isLoading}
              className="text-[10px] px-2.5 py-1.5 rounded-full bg-bg border border-border text-txt-2 hover:border-accent hover:text-txt transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* INPUT */}
      <div className="surface rounded-lg p-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          placeholder={event ? `Pose une question sur ${event.titre || event.typeEvent}…` : 'Pose ta question…'}
          className="flex-1 bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent outline-none resize-none max-h-32"
          disabled={isLoading}
        />
        <button
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          className="p-2 rounded-lg bg-accent hover:bg-accent-2 text-white disabled:opacity-50 flex-shrink-0"
          title="Envoyer (Enter)"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{
  role: 'user' | 'assistant' | 'system';
  content: string;
  source?: AiSource;
}> = ({ role, content, source }) => {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-accent/15 text-txt border border-accent/30 rounded-2xl rounded-tr-sm px-4 py-2.5">
          <p className="text-xs whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
        <Sparkles size={14} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-txt-2">
            {source === 'openrouter' ? 'OpenRouter' : source === 'anthropic' ? 'Claude' : 'Coach'}
          </span>
          {source === 'stub' && (
            <span className="text-[9px] text-txt-3 italic">(réponse pré-construite)</span>
          )}
        </div>
        <div className="prose prose-invert prose-sm max-w-none">
          <MarkdownContent content={content} />
        </div>
      </div>
    </div>
  );
};

// Mini renderer Markdown très basique (sans dépendance)
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  return (
    <div className="text-xs leading-relaxed text-txt space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-sm font-bold text-txt mt-2">{line.slice(3)}</h3>;
        }
        if (line.startsWith('### ')) {
          return <h4 key={i} className="text-xs font-bold text-txt uppercase tracking-wider mt-2">{line.slice(4)}</h4>;
        }
        if (line.startsWith('- ')) {
          return (
            <p key={i} className="text-txt-2 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-accent">
              <Inline text={line.slice(2)} />
            </p>
          );
        }
        if (line.match(/^\d+\.\s/)) {
          return (
            <p key={i} className="text-txt-2 pl-3">
              <Inline text={line} />
            </p>
          );
        }
        if (line.trim() === '') {
          return <div key={i} className="h-1" />;
        }
        return (
          <p key={i} className="text-txt-2">
            <Inline text={line} />
          </p>
        );
      })}
    </div>
  );
};

// Gère **bold** et _italic_ inline
const Inline: React.FC<{ text: string }> = ({ text }) => {
  // Découpe sur les marqueurs **...** et _..._
  const parts: Array<{ t: string; kind: 'text' | 'b' | 'i' }> = [];
  let buf = '';
  let i = 0;
  while (i < text.length) {
    if (text.slice(i, i + 2) === '**') {
      if (buf) parts.push({ t: buf, kind: 'text' });
      buf = '';
      const end = text.indexOf('**', i + 2);
      if (end === -1) { buf = text.slice(i); break; }
      parts.push({ t: text.slice(i + 2, end), kind: 'b' });
      i = end + 2;
    } else if (text[i] === '_' && /[a-zA-Z]/.test(text[i + 1] || '')) {
      const end = text.indexOf('_', i + 1);
      if (end !== -1) {
        if (buf) parts.push({ t: buf, kind: 'text' });
        buf = '';
        parts.push({ t: text.slice(i + 1, end), kind: 'i' });
        i = end + 1;
      } else {
        buf += text[i];
        i++;
      }
    } else {
      buf += text[i];
      i++;
    }
  }
  if (buf) parts.push({ t: buf, kind: 'text' });

  return (
    <>
      {parts.map((p, idx) =>
        p.kind === 'b' ? <strong key={idx} className="text-txt font-bold">{p.t}</strong>
        : p.kind === 'i' ? <em key={idx} className="text-txt-3 italic">{p.t}</em>
        : <React.Fragment key={idx}>{p.t}</React.Fragment>
      )}
    </>
  );
};

const ProtectedAiChatPage: React.FC = () => {
  return (
    <FeatureGate 
      feature="hasAiChat"
      fallbackTitle="Chat IA Réservé aux Membres Pro"
      fallbackDesc="Obtenez des analyses instantanées sur l'impact des marchés, la gestion du risque et le suivi psychologique de vos trades grâce à notre IA."
    >
      <AiChatPage />
    </FeatureGate>
  );
};

export default ProtectedAiChatPage;
