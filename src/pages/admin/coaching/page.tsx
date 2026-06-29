import React, { useState, useEffect } from 'react';
import { Video, CheckCircle2, XCircle, MessageSquare, Calendar } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { TicketThreadModal } from '../../../components/support/TicketThreadModal';
import SlotManager from './SlotManager';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CoachingRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: 'trades' | 'psychology' | 'plan' | 'other';
  sessionType: 'zoom' | 'meet' | 'phone';
  slotId: string;
  slot: { id: string; datetime: string };
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  trades: 'Analyse de trades',
  psychology: 'Coaching psychologie',
  plan: 'Plan de trading',
  other: 'Autre',
};

const SESSION_LABELS: Record<string, string> = {
  zoom: 'Zoom',
  meet: 'Google Meet',
  phone: 'Téléphone',
};

type MainTab = 'requests' | 'slots';
type FilterTab = 'all' | 'pending' | 'accepted' | 'rejected';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'pending', label: 'En attente' },
  { key: 'accepted', label: 'Accepté' },
  { key: 'rejected', label: 'Refusé' },
];

export default function AdminCoachingPage() {
  const [requests, setRequests] = useState<CoachingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<MainTab>('requests');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);

  const [acceptTarget, setAcceptTarget] = useState<CoachingRequest | null>(null);
  const [acceptNote, setAcceptNote] = useState('');
  const [accepting, setAccepting] = useState(false);

  const [rejectTarget, setRejectTarget] = useState<CoachingRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const { addToast } = useToast();

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = () => {
    setLoading(true);
    api.get('/api/admin/coaching')
      .then((res: any) => setRequests(res.data.data))
      .catch(() => addToast('Erreur lors du chargement', 'error'))
      .finally(() => setLoading(false));
  };

  const handleAccept = async () => {
    if (!acceptTarget) return;
    setAccepting(true);
    try {
      await api.patch(`/api/admin/coaching/${acceptTarget.id}/status`, {
        status: 'accepted',
        ...(acceptNote ? { note: acceptNote } : {}),
      });
      addToast('Demande acceptée', 'success');
      setAcceptTarget(null);
      setAcceptNote('');
      fetchRequests();
    } catch {
      addToast("Erreur lors de l'acceptation", 'error');
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await api.patch(`/api/admin/coaching/${rejectTarget.id}/status`, {
        status: 'rejected',
        ...(rejectionReason ? { rejectionReason } : {}),
      });
      addToast('Demande refusée', 'success');
      setRejectTarget(null);
      setRejectionReason('');
      fetchRequests();
    } catch {
      addToast('Erreur lors du refus', 'error');
    } finally {
      setRejecting(false);
    }
  };

  const filtered = filterTab === 'all' ? requests : requests.filter(r => r.status === filterTab);

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-black mb-2">Coaching 1-on-1</h1>
        <p className="text-txt-2 text-sm">Gérez les créneaux et les demandes de sessions coaching.</p>
      </div>

      {/* Main tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['requests', 'slots'] as MainTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors -mb-px border-b-2 ${
              mainTab === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-txt-2 hover:text-txt'
            }`}
          >
            {tab === 'requests' ? 'Demandes' : 'Créneaux'}
          </button>
        ))}
      </div>

      {mainTab === 'slots' && <SlotManager />}

      {mainTab === 'requests' && (
        <>
          {/* Filter tabs */}
          <div className="flex gap-2 border-b border-border">
            {FILTER_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setFilterTab(t.key)}
                className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors -mb-px border-b-2 ${
                  filterTab === t.key
                    ? 'border-loss text-loss'
                    : 'border-transparent text-txt-2 hover:text-txt'
                }`}
              >
                {t.label}
                {t.key !== 'all' && (
                  <span aria-hidden="true" className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-elevated text-txt-3">
                    {requests.filter(r => r.status === t.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-12 text-center text-txt-3">Chargement...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-txt-3">
              <Video size={40} className="mb-3" />
              <p className="font-bold">Aucune demande</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map(req => (
                <div key={req.id} className="glass rounded-2xl border border-border p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="font-bold">{req.userName}</div>
                      <div className="text-xs text-txt-3">{req.userEmail}</div>
                    </div>
                    {req.status === 'pending' && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 uppercase shrink-0">En attente</span>
                    )}
                    {req.status === 'accepted' && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-win/10 text-win uppercase shrink-0">Accepté</span>
                    )}
                    {req.status === 'rejected' && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-loss/10 text-loss uppercase shrink-0">Refusé</span>
                    )}
                  </div>
                  <div className="text-sm text-txt-2 mb-1">
                    <span className="font-medium text-txt">{SUBJECT_LABELS[req.subject]}</span>
                    {' · '}
                    {SESSION_LABELS[req.sessionType]}
                  </div>
                  {req.slot && (
                    <div className="flex items-center gap-2 text-xs text-txt-3 mb-2">
                      <Calendar size={12} />
                      {format(new Date(req.slot.datetime), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </div>
                  )}
                  <p className="text-sm text-txt-2 line-clamp-2 mb-4">{req.message}</p>
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAcceptTarget(req)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-win/10 text-win rounded-xl font-bold hover:bg-win/20 transition-colors text-sm"
                      >
                        <CheckCircle2 size={16} /> Accepter
                      </button>
                      <button
                        onClick={() => setRejectTarget(req)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-loss/10 text-loss rounded-xl font-bold hover:bg-loss/20 transition-colors text-sm"
                      >
                        <XCircle size={16} /> Refuser
                      </button>
                    </div>
                  )}
                  {req.status === 'accepted' && (
                    <button
                      onClick={() => setChatRequestId(req.id)}
                      className="flex items-center gap-2 text-sm font-bold text-accent hover:underline"
                    >
                      <MessageSquare size={14} /> Ouvrir le chat
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Accept Modal */}
      {acceptTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-border w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-black">Accepter la demande</h2>
            {acceptTarget.slot && (
              <div className="flex items-center gap-2 text-sm font-medium text-win">
                <Calendar size={14} />
                {format(new Date(acceptTarget.slot.datetime), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
              </div>
            )}
            <p className="text-sm text-txt-2">La session sera confirmée pour ce créneau.</p>
            <div>
              <label className="block text-xs font-bold text-txt-2 mb-1">Note (optionnel)</label>
              <textarea
                value={acceptNote}
                onChange={e => setAcceptNote(e.target.value)}
                rows={2}
                placeholder="Informations complémentaires..."
                className="w-full px-4 py-2.5 rounded-xl bg-elevated border border-border focus:border-win outline-none resize-none text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAcceptTarget(null)} className="flex-1 btn-ghost">Annuler</button>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="flex-1 bg-win text-white font-bold py-3 rounded-xl hover:bg-win/90 disabled:opacity-50 transition-colors"
              >
                {accepting ? 'Confirmation...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-border w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-black">Refuser la demande</h2>
            <div>
              <label className="block text-xs font-bold text-txt-2 mb-1">Motif de refus (optionnel)</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Expliquez le motif du refus..."
                className="w-full px-4 py-2.5 rounded-xl bg-elevated border border-border focus:border-loss outline-none resize-none text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectTarget(null)} className="flex-1 btn-ghost">Annuler</button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="flex-1 bg-loss text-white font-bold py-3 rounded-xl hover:bg-loss/90 disabled:opacity-50 transition-colors"
              >
                {rejecting ? 'Refus...' : 'Confirmer le refus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <TicketThreadModal
        isOpen={!!chatRequestId}
        onClose={() => setChatRequestId(null)}
        ticketId={chatRequestId}
        fetchEndpoint={chatRequestId ? `/api/admin/coaching/${chatRequestId}/messages` : undefined}
        replyEndpoint={chatRequestId ? `/api/admin/coaching/${chatRequestId}/messages` : undefined}
        isAdminView={true}
      />
    </div>
  );
}
