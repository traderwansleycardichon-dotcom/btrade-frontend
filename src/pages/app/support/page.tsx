import React, { useEffect, useState } from 'react';
import { LifeBuoy, Plus, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal } from '../../../components/ui/Modal';
import { TicketThreadModal } from '../../../components/support/TicketThreadModal';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // Form states
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { addToast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    setLoading(true);
    api.get('/api/support')
      .then((res: any) => setTickets(res.data.data))
      .catch((err: any) => addToast('Erreur lors du chargement de vos tickets', 'error'))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      addToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/support', { subject, message });
      addToast('Votre ticket a été soumis avec succès', 'success');
      setIsModalOpen(false);
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (err) {
      addToast('Erreur lors de la soumission', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black mb-2">Support & Doléances</h1>
          <p className="text-txt-2 text-sm">Une question ou un problème ? Notre équipe est là pour vous aider.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden md:inline">Ouvrir un ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-loss/10 text-loss flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{tickets.filter(t => t.status === 'open').length}</div>
            <div className="text-[10px] font-bold text-txt-3 uppercase">En attente</div>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{tickets.filter(t => t.status === 'in_progress').length}</div>
            <div className="text-[10px] font-bold text-txt-3 uppercase">En traitement</div>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-win/10 text-win flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{tickets.filter(t => t.status === 'closed').length}</div>
            <div className="text-[10px] font-bold text-txt-3 uppercase">Résolus</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Sujet & Message</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={3} className="p-8 text-center text-txt-3">Chargement...</td></tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-surface flex items-center justify-center mx-auto mb-4 text-txt-3">
                      <LifeBuoy size={32} />
                    </div>
                    <div className="font-bold text-txt mb-2">Aucun ticket</div>
                    <div className="text-sm text-txt-2 max-w-sm mx-auto">
                      Vous n'avez pas encore soumis de doléance. Si vous avez besoin d'aide, n'hésitez pas à ouvrir un ticket.
                    </div>
                  </td>
                </tr>
              ) : tickets.map(ticket => (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-surface/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-txt mb-1">{ticket.subject}</div>
                    <div className="text-xs text-txt-2 line-clamp-2 max-w-xl">{ticket.message}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-txt-3 whitespace-nowrap">
                    {format(new Date(ticket.createdAt), 'dd MMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-md uppercase ${
                      ticket.status === 'open' ? 'bg-loss/10 text-loss' : 
                      ticket.status === 'in_progress' ? 'bg-accent/10 text-accent' : 
                      'bg-win/10 text-win'
                    }`}>
                      {ticket.status === 'open' ? 'À traiter' : ticket.status === 'in_progress' ? 'En cours' : 'Résolu'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ouvrir un ticket"
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-txt-2 mb-2">Sujet de votre demande</label>
            <input 
              type="text" 
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Ex: Problème avec mon paiement, Question sur un trade..." 
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-accent outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-txt-2 mb-2">Description détaillée</label>
            <textarea 
              required
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Expliquez-nous votre problème en détail..." 
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-accent outline-none transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="btn-ghost"
              disabled={submitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Envoi...' : 'Soumettre le ticket'}
            </button>
          </div>
        </form>
      </Modal>

      <TicketThreadModal 
        isOpen={!!selectedTicketId}
        onClose={() => { setSelectedTicketId(null); fetchTickets(); }}
        ticketId={selectedTicketId}
        isAdminView={false}
      />
    </div>
  );
}
