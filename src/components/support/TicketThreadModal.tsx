import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Send, Clock, User, ShieldAlert } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TicketThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
  isAdminView?: boolean;
}

export const TicketThreadModal: React.FC<TicketThreadModalProps> = ({ 
  isOpen, 
  onClose, 
  ticketId,
  isAdminView = false
}) => {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicket();
    } else {
      setTicket(null);
      setReplyMessage('');
    }
  }, [isOpen, ticketId]);

  useEffect(() => {
    // Scroll to bottom when messages load or change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ticket]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const endpoint = isAdminView 
        ? `/api/admin/support/${ticketId}` 
        : `/api/support/${ticketId}`;
      const res = await api.get(endpoint);
      setTicket(res.data.data);
    } catch (err) {
      addToast('Erreur lors du chargement du ticket', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !ticketId) return;

    setSending(true);
    try {
      const endpoint = isAdminView 
        ? `/api/admin/support/${ticketId}/reply` 
        : `/api/support/${ticketId}/reply`;
      
      await api.post(endpoint, { message: replyMessage });
      setReplyMessage('');
      fetchTicket(); // Reload thread
    } catch (err) {
      addToast('Erreur lors de l\'envoi de la réponse', 'error');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ticket ? `Ticket: ${ticket.subject}` : 'Chargement...'}
      size="lg"
    >
      {loading && !ticket ? (
        <div className="py-20 text-center text-txt-3">Chargement des messages...</div>
      ) : ticket ? (
        <div className="flex flex-col h-[60vh] max-h-[600px] -mx-6 -mb-6">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface/30">
            {/* Original Message */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 overflow-hidden border border-accent/20">
                {ticket.user?.avatarUrl ? (
                  <img src={ticket.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div className="flex-1 bg-surface border border-border rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">
                    {ticket.user?.fullName || 'Utilisateur'}
                  </span>
                  <span className="text-xs text-txt-3 flex items-center gap-1">
                    <Clock size={12} />
                    {format(new Date(ticket.createdAt), 'dd MMM HH:mm', { locale: fr })}
                  </span>
                </div>
                <div className="text-sm text-txt-2 whitespace-pre-wrap">
                  {ticket.message}
                </div>
              </div>
            </div>

            {/* Replies */}
            {ticket.replies && ticket.replies.map((reply: any) => {
              const isMine = isAdminView ? reply.isAdmin : !reply.isAdmin;
              
              return (
                <div key={reply.id} className={`flex gap-4 ${isMine ? 'flex-row-reverse' : ''}`}>
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-2 overflow-hidden border border-accent/20">
                      {reply.isAdmin ? (
                        <ShieldAlert size={16} />
                      ) : ticket.user?.avatarUrl ? (
                        <img src={ticket.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                  )}
                  <div className={`flex-1 rounded-2xl p-4 shadow-sm max-w-[85%] ${
                    isMine 
                      ? 'bg-accent/10 border border-accent/20 rounded-tr-none text-accent-content' 
                      : 'bg-surface border border-border rounded-tl-none'
                  }`}>
                    <div className={`flex justify-between items-center mb-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                      <span className="font-bold text-sm">
                        {reply.isAdmin ? 'Support BTrade' : (ticket.user?.fullName || 'Utilisateur')}
                      </span>
                      <span className="text-xs opacity-50 flex items-center gap-1">
                        <Clock size={12} />
                        {format(new Date(reply.createdAt), 'dd MMM HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <div className={`text-sm whitespace-pre-wrap ${isMine ? '' : 'text-txt-2'}`}>
                      {reply.message}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Input */}
          <div className="p-4 bg-surface border-t border-border">
            {ticket.status === 'closed' ? (
              <div className="text-center py-3 text-sm text-txt-3 bg-elevated rounded-xl">
                Ce ticket est fermé. Vous ne pouvez plus y répondre.
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="flex gap-3">
                <textarea
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                  className="flex-1 bg-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-accent resize-none h-12 min-h-[48px] max-h-32 text-sm"
                  rows={1}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply(e);
                    }
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!replyMessage.trim() || sending}
                  className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent/90 disabled:opacity-50 transition-colors flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
