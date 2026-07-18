import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, Sparkles, X, MessageSquare, Plus, Trash2, Menu } from 'lucide-react';
import { useAiChat, type AiSource, type AiConversation } from '../../hooks/useAiChat';
import api from '../../lib/api';
import { usePlan } from '../../hooks/usePlan';
import { motion, AnimatePresence } from 'framer-motion';
import TiJohnAvatar from '../../assets/ti-john-avatar.jpg';

const SUGGEST_GENERIC = [
  "Ki sa ki Risk/Reward ratio a ?",
  "Kòman pou m evite revenge trading ?",
  "Explique-moi la structure de marché (SMC)",
  "What is a prop firm challenge?",
];

export const TiJohnChatWidget: React.FC = () => {
  const { isPro } = usePlan();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // If user is not PRO, clicking the button could open the modal to show the paywall,
  // or navigate to upgrade. We will show a nice paywall inside the modal.
  
  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[100] w-20 h-20 bg-accent hover:bg-accent/90 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group border-4 border-bg p-0 overflow-hidden ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        title="Ti John - AI Coach"
      >
        <img src={TiJohnAvatar} alt="Ti John Avatar" className="w-full h-full object-cover" />
        
        <span className="absolute right-full mr-4 bg-surface text-txt px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl border border-border flex items-center gap-2">
          Mande Ti John
          {!isPro && (
            <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded uppercase tracking-wider">
              PRO
            </span>
          )}
        </span>
        
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-bg rounded-full shadow-sm" />
      </button>

      {/* CHAT MODAL / DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-[110] w-full md:w-[500px] h-[100dvh] md:h-[750px] md:max-h-[calc(100vh-6rem)] bg-bg md:border border-border md:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {isPro ? (
              <ChatInterface onClose={() => setIsOpen(false)} />
            ) : (
              <PaywallInterface onClose={() => setIsOpen(false)} onUpgrade={() => { setIsOpen(false); navigate('/app/upgrade'); }} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ChatInterface: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { messages, isLoading, error, send, reset, loadConversation, conversationId } = useAiChat(null, {});
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // History state
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch history for sidebar
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get('/api/ai/chat/conversations');
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Initial load: fetch history and auto-load the most recent conversation if available
  useEffect(() => {
    const initLoad = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await api.get('/api/ai/chat/conversations');
        if (data.success) {
          setConversations(data.conversations);
          if (data.conversations.length > 0 && !conversationId) {
            loadConversation(data.conversations[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingHistory(false);
      }
    };
    initLoad();
  }, []); // Run only on mount

  // Refresh history list when conversationId changes (e.g. new chat created)
  useEffect(() => {
    if (conversationId) {
      fetchHistory();
    }
  }, [conversationId]);

  // Refresh history list when the user opens the history sidebar
  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, showHistory]);

  const onSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput('');
    await send(text);
    fetchHistory(); // Refresh history after sending to update timestamps/titles
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleNewChat = () => {
    reset();
    setShowHistory(false);
  };

  const handleLoadChat = (id: string) => {
    loadConversation(id);
    setShowHistory(false);
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Eske ou vle efase konvèsasyon sa a?')) return;
    try {
      await api.delete(`/api/ai/chat/conversations/${id}`);
      if (conversationId === id) {
        reset();
      }
      fetchHistory();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="surface px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            className="p-1.5 text-txt-2 hover:text-txt rounded-lg hover:bg-bg/50 transition-colors" 
            onClick={() => setShowHistory(!showHistory)}
            title="Istorik konvèsasyon"
          >
            <Menu size={18} />
          </button>
          
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden shadow-sm border border-border">
            <img src={TiJohnAvatar} alt="Ti John Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-txt leading-none">Ti John</h2>
            <p className="text-[10px] text-txt-3">AI Trading Assistant</p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-1.5 text-txt-3 hover:text-loss rounded-lg hover:bg-loss/10 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex">
        {/* HISTORY OVERLAY */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="absolute inset-0 bg-surface z-10 flex flex-col"
            >
              <div className="p-4 border-b border-border shrink-0">
                <button 
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-bold transition-all shadow-md"
                >
                  <Plus size={16} />
                  Nouvo Konvèsasyon
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingHistory ? (
                  <div className="text-center text-xs text-txt-3 py-4 animate-pulse">Chajman...</div>
                ) : conversations.length === 0 ? (
                  <div className="text-center text-xs text-txt-3 py-4">Pa gen istorik</div>
                ) : (
                  conversations.map(conv => (
                    <div 
                      key={conv.id} 
                      onClick={() => handleLoadChat(conv.id)}
                      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${conversationId === conv.id ? 'bg-accent/10 border border-accent/20' : 'hover:bg-bg/50'}`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <MessageSquare size={14} className={conversationId === conv.id ? 'text-accent' : 'text-txt-3'} />
                        <p className={`text-xs truncate ${conversationId === conv.id ? 'text-txt font-bold' : 'text-txt-2'}`}>
                          {conv.title || 'Konvèsasyon...'}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteChat(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-txt-3 hover:text-loss transition-opacity"
                        title="Efase"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MESSAGES */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5 bg-bg">
          {!conversationId && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden border-2 border-border">
                <img src={TiJohnAvatar} alt="Ti John Avatar" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-base font-bold text-txt mb-2">Bonjou! Mwen se Ti John.</h3>
              <p className="text-xs text-txt-2 mb-6 leading-relaxed max-w-[250px]">
                Mwen la pou m ede w konprann trading nan fason ki pi senp posib.
              </p>
              
              <div className="flex flex-col gap-2 w-full max-w-[280px]">
                {SUGGEST_GENERIC.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={isLoading}
                    className="text-left text-[11px] p-2.5 rounded-xl bg-surface border border-border hover:border-accent hover:shadow-md transition-all text-txt-2 hover:text-txt disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <img src={TiJohnAvatar} alt="Ti John" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-1 pt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-txt-3 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-txt-3 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-txt-3 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
          
          {error && (
            <div className="text-xs text-loss bg-loss/10 border border-loss/20 px-3 py-2 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* INPUT */}
      <div className="p-3 bg-surface border-t border-border shrink-0">
        <div className="flex items-end gap-2 bg-bg border border-border rounded-xl p-1.5 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/50 transition-all">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder="Poze yon kesyon..."
            className="flex-1 bg-transparent py-1.5 px-2 text-xs text-txt outline-none resize-none max-h-24 min-h-[32px]"
            disabled={isLoading}
          />
          <button
            onClick={onSend}
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-accent hover:bg-accent/90 text-white disabled:opacity-50 flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
            title="Envoyer"
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </div>
      </div>
    </>
  );
};

const PaywallInterface: React.FC<{ onClose: () => void, onUpgrade: () => void }> = ({ onClose, onUpgrade }) => {
  return (
    <div className="flex flex-col h-full bg-bg text-center relative overflow-hidden">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 text-txt-3 hover:text-loss rounded-lg bg-surface z-10"
      >
        <X size={18} />
      </button>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 rounded-full overflow-hidden mb-6 shadow-[0_0_40px_rgba(var(--accent),0.2)] border-2 border-accent/30">
          <img src={TiJohnAvatar} alt="Ti John Avatar" className="w-full h-full object-cover" />
        </div>
        <h3 className="text-xl font-black mb-3">Ti John AI Coach</h3>
        <p className="text-sm text-txt-2 mb-8 leading-relaxed">
          Dekouvri Ti John, asistan IA ki la pou ede w nan trading. Kesyon sou risk, analiz teknik, oswa sikoloji? Li la pou w!
          <br /><br />
          <b>Aksè sa a rezève sèlman pou manm PRO yo.</b>
        </p>
        
        <button 
          onClick={onUpgrade}
          className="w-full py-3.5 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/25 hover:scale-105"
        >
          Pase PRO kounye a
        </button>
      </div>
    </div>
  );
};

// Message bubble and Mini renderer Markdown
const MessageBubble: React.FC<{
  role: 'user' | 'assistant' | 'system';
  content: string;
}> = ({ role, content }) => {
  if (role === 'user') {
    return (
      <div className="flex justify-end mb-1">
        <div className="max-w-[85%] bg-accent text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm">
          <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 mb-1 animate-[fadeIn_0.3s_ease-out]">
      <div className="w-8 h-8 rounded-full overflow-hidden border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <img src={TiJohnAvatar} alt="Ti John" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 bg-surface border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
        <div className="prose prose-invert prose-sm max-w-none text-txt">
          <MarkdownContent content={content} />
        </div>
      </div>
    </div>
  );
};

const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  return (
    <div className="text-[13px] leading-relaxed space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('### ')) {
          return <h4 key={i} className="text-[13px] font-bold text-txt mt-2 mb-1">{line.slice(4)}</h4>;
        }
        if (line.startsWith('## ')) {
          return <h3 key={i} className="text-sm font-bold text-txt mt-3 mb-1.5">{line.slice(3)}</h3>;
        }
        if (line.startsWith('# ')) {
          return <h2 key={i} className="text-base font-bold text-txt mt-4 mb-2">{line.slice(2)}</h2>;
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <p key={i} className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-accent">
              <Inline text={line.slice(2)} />
            </p>
          );
        }
        if (line.match(/^\d+\.\s/)) {
          return (
            <p key={i} className="pl-1">
              <Inline text={line} />
            </p>
          );
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-2 border-accent/50 pl-2 py-0.5 text-txt-2 italic bg-accent/5 rounded-r-lg my-1.5">
              <Inline text={line.slice(2)} />
            </blockquote>
          );
        }
        if (line.trim() === '') {
          return null; 
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

const Inline: React.FC<{ text: string }> = ({ text }) => {
  const parts: Array<{ t: string; kind: 'text' | 'b' | 'i' | 'code' }> = [];
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
    } else if (text[i] === '`') {
      if (buf) parts.push({ t: buf, kind: 'text' });
      buf = '';
      const end = text.indexOf('`', i + 1);
      if (end === -1) { buf = text.slice(i); break; }
      parts.push({ t: text.slice(i + 1, end), kind: 'code' });
      i = end + 1;
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
        : p.kind === 'code' ? <code key={idx} className="bg-bg border border-border px-1 py-0.5 rounded text-[11px] text-accent font-mono">{p.t}</code>
        : <React.Fragment key={idx}>{p.t}</React.Fragment>
      )}
    </>
  );
};
