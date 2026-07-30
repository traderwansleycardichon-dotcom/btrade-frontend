import React, { useEffect, useState } from 'react';
import { LifeBuoy, MessageSquare, CheckCircle2, Clock, ShieldAlert, ExternalLink, Search } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TicketThreadModal } from '../../../components/support/TicketThreadModal';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = () => {
    setLoading(true);
    api.get('/api/admin/support')
      .then((res: any) => setTickets(res.data.data))
      .catch((err: any) => addToast('Erreur lors du chargement des tickets', 'error'))
      .finally(() => setLoading(false));
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/api/admin/support/${id}/status`, { status });
      addToast('Statut du ticket mis à jour', 'success');
      fetchTickets();
    } catch (err) {
      addToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const filteredTickets = tickets.filter(t =>
    (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.user?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black mb-2">Helpdesk & Support</h1>
          <p className="text-txt-2 text-sm">Gérez les demandes d'assistance et les problèmes techniques.</p>
        </div>
        
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-3" />
          <input 
            type="text" 
            placeholder="Rechercher un ticket..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl bg-surface border border-border focus:border-loss/50 outline-none w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-loss/10 text-loss flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{tickets.filter(t => t.status === 'open').length}</div>
            <div className="text-[10px] font-bold text-txt-3 uppercase">Tickets Ouverts</div>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-win/10 text-win flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{tickets.filter(t => t.status === 'closed').length}</div>
            <div className="text-[10px] font-bold text-txt-3 uppercase">Tickets Résolus</div>
          </div>
        </div>
        <div className="glass p-5 rounded-2xl border border-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="text-2xl font-black">{tickets.length}</div>
            <div className="text-[10px] font-bold text-txt-3 uppercase">Total Demandes</div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Utilisateur</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Sujet</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4 text-[10px] font-bold text-txt-3 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-txt-3">Chargement...</td></tr>
              ) : filteredTickets.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-txt-3 italic">Aucun ticket trouvé.</td></tr>
              ) : filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold">{ticket.user?.fullName || 'Anonyme'}</div>
                    <div className="text-[10px] text-txt-3">{ticket.user?.email || 'Utilisateur supprimé'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{ticket.subject}</div>
                    <div className="text-xs text-txt-2 line-clamp-1 max-w-md">{ticket.message}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-txt-3">
                    {format(new Date(ticket.createdAt), 'dd MMM HH:mm', { locale: fr })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      ticket.status === 'open' ? 'bg-loss/10 text-loss' : 
                      ticket.status === 'in_progress' ? 'bg-accent/10 text-accent' : 
                      'bg-win/10 text-win'
                    }`}>
                      {ticket.status === 'open' ? 'À traiter' : ticket.status === 'in_progress' ? 'En cours' : 'Résolu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => updateStatus(ticket.id, 'closed')}
                        className="p-2 text-txt-3 hover:text-win transition-colors rounded-lg hover:bg-win/5"
                        title="Marquer comme résolu"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button 
                        className="p-2 text-txt-3 hover:text-accent transition-colors rounded-lg hover:bg-accent/5"
                        title="Répondre"
                        onClick={() => setSelectedTicketId(ticket.id)}
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <TicketThreadModal 
        isOpen={!!selectedTicketId}
        onClose={() => { setSelectedTicketId(null); fetchTickets(); }}
        ticketId={selectedTicketId}
        isAdminView={true}
      />
    </div>
  );
}
