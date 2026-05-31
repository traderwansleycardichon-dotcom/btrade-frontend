import React, { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  MessageSquare, Send, ArrowLeft, X, Search, Plus, CheckCheck, Clock
} from 'lucide-react';
import {
  useConversations,
  useThread,
  useSendMessage,
  Conversation,
  ChatMessage,
} from '../../hooks/useMessaging';
import { useAuth } from '../../hooks/useAuth';

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
const avatar = (u: { fullName?: string | null; email: string; avatarUrl?: string | null }) => {
  if (u.avatarUrl) return <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />;
  const init = (u.fullName || u.email).charAt(0).toUpperCase();
  return <span className="text-xs font-black text-accent">{init}</span>;
};

const timeAgo = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });

/* ------------------------------------------------------------------ */
/* ConversationItem                                                     */
/* ------------------------------------------------------------------ */
const ConvItem: React.FC<{
  conv: Conversation;
  myId: string;
  active: boolean;
  onClick: () => void;
}> = ({ conv, myId, active, onClick }) => {
  const other = conv.senderId === myId ? conv.recipient : conv.sender;
  const lastMsg = conv.replies?.[0] ?? conv;
  const hasUnread = conv.unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 flex gap-3 items-start hover:bg-elevated/60 transition-colors border-b border-border/40 ${
        active ? 'bg-accent/8 border-l-2 border-l-accent' : ''
      }`}
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-elevated flex items-center justify-center shrink-0 overflow-hidden border border-border">
        {other ? avatar(other) : <MessageSquare size={14} className="text-txt-3" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className={`text-xs truncate ${hasUnread ? 'font-bold text-txt' : 'font-medium text-txt-2'}`}>
            {other?.fullName || other?.email || 'Support BTrade'}
          </span>
          <span className="text-[10px] text-txt-3 shrink-0">
            {timeAgo(lastMsg.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <p className={`text-[11px] truncate ${hasUnread ? 'text-txt font-medium' : 'text-txt-3'}`}>
            {conv.sujet || lastMsg.contenu || '…'}
          </p>
          {hasUnread && (
            <span className="bg-accent text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 min-w-[18px] text-center">
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

/* ------------------------------------------------------------------ */
/* Thread / Chat view                                                   */
/* ------------------------------------------------------------------ */
const ThreadView: React.FC<{
  rootId: string;
  myId: string;
  otherName: string;
  onBack: () => void;
}> = ({ rootId, myId, otherName, onBack }) => {
  const { data: messages = [], isLoading } = useThread(rootId);
  const sendMsg = useSendMessage();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Destinataire = le 1er message root
  const root = messages[0];
  const recipientId = root
    ? root.senderId === myId
      ? root.recipientId!
      : root.senderId!
    : '';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !recipientId) return;
    await sendMsg.mutateAsync({
      recipientId,
      contenu: text.trim(),
      parentId: rootId,
    });
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-surface/80 backdrop-blur shrink-0">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-elevated text-txt-2 hover:text-txt transition-colors lg:hidden"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
          <span className="text-xs font-black text-accent">{otherName.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="text-sm font-bold leading-none">{otherName}</p>
          {root?.sujet && (
            <p className="text-[11px] text-txt-3 mt-0.5 truncate max-w-[200px]">{root.sujet}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-txt-3 py-10">Aucun message dans ce fil.</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === myId;
            return (
              <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-elevated border border-border flex items-center justify-center shrink-0 overflow-hidden mt-1">
                    {msg.sender ? avatar(msg.sender) : <MessageSquare size={12} className="text-txt-3" />}
                  </div>
                )}

                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-accent text-white rounded-tr-sm shadow-lg shadow-accent/20'
                        : 'bg-elevated text-txt border border-border/50 rounded-tl-sm'
                    }`}
                  >
                    {msg.contenu}
                  </div>
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[10px] text-txt-3">
                      {format(new Date(msg.createdAt), 'HH:mm', { locale: fr })}
                    </span>
                    {isMe && (
                      msg.lu
                        ? <CheckCheck size={11} className="text-accent" />
                        : <Clock size={11} className="text-txt-3" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="px-4 py-3 border-t border-border flex gap-2 items-end bg-surface shrink-0"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any); }
          }}
          placeholder="Écrire un message… (Entrée pour envoyer)"
          rows={1}
          className="flex-1 bg-bg border border-border rounded-xl py-2.5 px-3 text-sm focus:border-accent/50 outline-none resize-none leading-relaxed custom-scrollbar"
          style={{ maxHeight: 120 }}
        />
        <button
          type="submit"
          disabled={!text.trim() || sendMsg.isPending}
          className="w-10 h-10 rounded-xl bg-accent hover:bg-accent-2 text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-lg shadow-accent/20"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* New Conversation Modal                                               */
/* ------------------------------------------------------------------ */
const NewConvModal: React.FC<{
  users: { id: string; fullName: string | null; email: string }[];
  onClose: () => void;
  onSent: (rootId: string) => void;
}> = ({ users, onClose, onSent }) => {
  const sendMsg = useSendMessage();
  const [recipientId, setRecipientId] = useState('');
  const [sujet, setSujet] = useState('');
  const [contenu, setContenu] = useState('');
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    (u.fullName || u.email).toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !contenu.trim()) return;
    const msg = await sendMsg.mutateAsync({ recipientId, sujet: sujet.trim(), contenu: contenu.trim() });
    onSent(msg.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-sm">Nouveau message</h3>
          <button onClick={onClose} className="p-1 text-txt-3 hover:text-txt"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Destinataire */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-txt-2 mb-1.5 block">
              Destinataire
            </label>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un utilisateur…"
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mb-1.5 focus:border-accent/50 outline-none"
            />
            <div className="max-h-32 overflow-y-auto border border-border rounded-lg divide-y divide-border/50 custom-scrollbar">
              {filtered.length === 0 ? (
                <p className="text-[11px] text-txt-3 p-3 text-center">Aucun résultat</p>
              ) : filtered.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => { setRecipientId(u.id); setSearch(u.fullName || u.email); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-elevated transition-colors ${recipientId === u.id ? 'bg-accent/10 text-accent font-bold' : 'text-txt'}`}
                >
                  <span className="font-medium">{u.fullName || '—'}</span>
                  <span className="text-txt-3 ml-2">{u.email}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sujet */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-txt-2 mb-1.5 block">Sujet <span className="normal-case text-txt-3 font-normal tracking-normal">· optionnel</span></label>
            <input
              value={sujet}
              onChange={e => setSujet(e.target.value)}
              placeholder="Objet du message…"
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-txt-2 mb-1.5 block">Message</label>
            <textarea
              required
              rows={4}
              value={contenu}
              onChange={e => setContenu(e.target.value)}
              placeholder="Votre message…"
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="btn-ghost text-xs px-3 py-2 rounded-lg">Annuler</button>
            <button
              type="submit"
              disabled={!recipientId || !contenu.trim() || sendMsg.isPending}
              className="btn-primary text-xs px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send size={12} />
              {sendMsg.isPending ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main InboxPanel                                                       */
/* ------------------------------------------------------------------ */
interface InboxPanelProps {
  /** Liste d'utilisateurs à qui écrire (admin only) */
  availableUsers?: { id: string; fullName: string | null; email: string }[];
  /** Peut initier de nouvelles conversations */
  canCompose?: boolean;
}

export const InboxPanel: React.FC<InboxPanelProps> = ({ availableUsers = [], canCompose = false }) => {
  const { user } = useAuth();
  const { data: conversations = [], isLoading } = useConversations();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showNewConv, setShowNewConv] = useState(false);
  const [searchConv, setSearchConv] = useState('');

  const activeConv = conversations.find(c => c.id === activeConvId);
  const other = activeConv
    ? activeConv.senderId === user?.id
      ? activeConv.recipient
      : activeConv.sender
    : null;

  const filtered = conversations.filter(c => {
    const o = c.senderId === user?.id ? c.recipient : c.sender;
    const name = o?.fullName || o?.email || '';
    return name.toLowerCase().includes(searchConv.toLowerCase()) ||
      (c.sujet || '').toLowerCase().includes(searchConv.toLowerCase());
  });

  return (
    <div className="flex h-full min-h-[500px] overflow-hidden rounded-xl border border-border bg-surface">
      {/* ---- LEFT PANEL : Conversation list ---- */}
      <div className={`flex flex-col border-r border-border bg-bg/30 ${activeConvId ? 'hidden lg:flex' : 'flex'} w-full lg:w-72 xl:w-80 shrink-0`}>
        {/* Header */}
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <MessageSquare size={15} className="text-accent" />
              Messages
            </h3>
            {canCompose && (
              <button
                onClick={() => setShowNewConv(true)}
                className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                title="Nouveau message"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-3" />
            <input
              value={searchConv}
              onChange={e => setSearchConv(e.target.value)}
              placeholder="Rechercher…"
              className="w-full bg-bg border border-border rounded-lg py-1.5 pl-7 pr-3 text-[11px] focus:border-accent/50 outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare size={28} className="text-txt-3 mx-auto mb-2" />
              <p className="text-xs font-bold text-txt-2 mb-1">Aucun message</p>
              <p className="text-[11px] text-txt-3">
                {canCompose ? 'Cliquez sur + pour initier une conversation.' : "L'équipe BTrade vous contactera ici."}
              </p>
            </div>
          ) : (
            filtered.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                myId={user?.id || ''}
                active={conv.id === activeConvId}
                onClick={() => setActiveConvId(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ---- RIGHT PANEL : Thread ---- */}
      <div className={`flex-1 flex flex-col ${activeConvId ? 'flex' : 'hidden lg:flex'}`}>
        {activeConvId && other ? (
          <ThreadView
            key={activeConvId}
            rootId={activeConvId}
            myId={user?.id || ''}
            otherName={other.fullName || other.email}
            onBack={() => setActiveConvId(null)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <MessageSquare size={24} className="text-accent" />
            </div>
            <p className="font-bold text-sm">Sélectionnez une conversation</p>
            <p className="text-xs text-txt-3 max-w-xs">
              {canCompose
                ? 'Choisissez une conversation à gauche ou créez-en une nouvelle.'
                : 'Vos échanges avec le support BTrade apparaîtront ici.'}
            </p>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConv && (
        <NewConvModal
          users={availableUsers}
          onClose={() => setShowNewConv(false)}
          onSent={(id) => { setActiveConvId(id); setShowNewConv(false); }}
        />
      )}
    </div>
  );
};
