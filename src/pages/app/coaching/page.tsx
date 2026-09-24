// src/pages/app/coaching/page.tsx
import React, { useState, useEffect } from 'react';
import { Video, Plus, MessageSquare, Calendar } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { Modal } from '../../../components/ui/Modal';
import { TicketThreadModal } from '../../../components/support/TicketThreadModal';
import { SlotPicker, CoachingSlot } from '../../../components/coaching/SlotPicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ProGate } from '../../../components/ui/ProGate';
import { usePlan } from '../../../hooks/usePlan';

interface CoachingRequest {
  id: string;
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

export default function CoachingPage() {
  const [requests, setRequests] = useState<CoachingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [subject, setSubject] = useState('trades');
  const [sessionType, setSessionType] = useState('zoom');
  const [slotId, setSlotId] = useState('');
  const [message, setMessage] = useState('');
  const [availableSlots, setAvailableSlots] = useState<CoachingSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const { addToast } = useToast();
  const { isVip } = usePlan();

  useEffect(() => { 
    if (isVip) fetchRequests(); 
  }, [isVip]);

  const fetchRequests = () => {
    setLoading(true);
    api.get('/api/coaching')
      .then((res: any) => setRequests(res.data.data))
      .catch(() => addToast('Erreur lors du chargement des demandes', 'error'))
      .finally(() => setLoading(false));
  };

  const openForm = () => {
    setSlotsLoading(true);
    api.get('/api/coaching/slots')
      .then((res: any) => setAvailableSlots(res.data.data))
      .catch(() => addToast('Erreur lors du chargement des créneaux', 'error'))
      .finally(() => setSlotsLoading(false));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSubject('trades');
    setSessionType('zoom');
    setSlotId('');
    setMessage('');
    setAvailableSlots([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotId) {
      addToast('Veuillez sélectionner un créneau', 'error');
      return;
    }
    if (message.trim().length < 20) {
      addToast('Le message doit contenir au moins 20 caractères', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/coaching', { slotId, subject, sessionType, message });
      addToast('Demande envoyée avec succès', 'success');
      closeForm();
      fetchRequests();
    } catch {
      addToast("Erreur lors de l'envoi de la demande", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isVip) {
    return (
      <ProGate 
        title="Coaching VIP" 
        description="Accédez aux sessions de coaching privées 1-on-1 en souscrivant au plan VIP Incubator."
      />
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black mb-2">Coaching 1-on-1</h1>
          <p className="text-txt-2 text-sm">Demandez une session privée avec un coach.</p>
        </div>
        <button onClick={openForm} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          <span className="hidden md:inline">Nouvelle demande</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-txt-3">Chargement...</div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-surface rounded-3xl border border-border border-dashed">
          <Video size={48} className="text-txt-3 mb-4" />
          <h3 className="text-lg font-bold mb-2">Aucune demande</h3>
          <p className="text-sm text-txt-2 mb-6">Soumettez votre première demande de coaching.</p>
          <button onClick={openForm} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Nouvelle demande
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="glass rounded-2xl border border-border p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold">{SUBJECT_LABELS[req.subject]}</div>
                  <div className="text-xs text-txt-3 mt-0.5">
                    {SESSION_LABELS[req.sessionType]} · {format(new Date(req.createdAt), 'dd MMM yyyy', { locale: fr })}
                  </div>
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
              {req.slot && (
                <div className={`flex items-center gap-2 text-sm font-medium ${req.status === 'accepted' ? 'text-win' : 'text-txt-2'}`}>
                  <Calendar size={14} />
                  {format(new Date(req.slot.datetime), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                </div>
              )}
              {req.status === 'rejected' && req.rejectionReason && (
                <p className="text-sm text-txt-2 italic">{req.rejectionReason}</p>
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

      <Modal isOpen={isFormOpen} onClose={closeForm} title="Nouvelle demande de coaching">
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div>
            <label className="block text-xs font-bold text-txt-2 mb-2">Sujet</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-accent outline-none"
            >
              <option value="trades">Analyse de trades</option>
              <option value="psychology">Coaching psychologie</option>
              <option value="plan">Plan de trading</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-txt-2 mb-2">Type de session</label>
            <div className="flex gap-3">
              {(['zoom', 'meet', 'phone'] as const).map(type => (
                <label
                  key={type}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer font-bold text-sm transition-colors ${
                    sessionType === type
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-txt-2 hover:border-accent/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="sessionType"
                    value={type}
                    checked={sessionType === type}
                    onChange={() => setSessionType(type)}
                    className="sr-only"
                  />
                  {SESSION_LABELS[type]}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-txt-2 mb-2">Créneau</label>
            {slotsLoading ? (
              <p className="text-sm text-txt-3 text-center py-4">Chargement des créneaux...</p>
            ) : (
              <SlotPicker slots={availableSlots} selectedSlotId={slotId} onChange={setSlotId} />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-txt-2 mb-2">
              Message <span className="text-txt-3 font-normal">(min. 20 caractères)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              rows={4}
              placeholder="Décrivez vos objectifs, questions spécifiques ou contexte..."
              className="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-accent outline-none resize-none text-sm"
            />
            <div className={`text-[10px] mt-1 text-right ${message.length < 20 ? 'text-loss' : 'text-win'}`}>
              {message.length} / 20 min
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeForm} className="btn-ghost" disabled={submitting}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Envoi...' : 'Envoyer la demande'}
            </button>
          </div>
        </form>
      </Modal>

      <TicketThreadModal
        isOpen={!!chatRequestId}
        onClose={() => setChatRequestId(null)}
        ticketId={chatRequestId}
        fetchEndpoint={chatRequestId ? `/api/coaching/${chatRequestId}/messages` : undefined}
        replyEndpoint={chatRequestId ? `/api/coaching/${chatRequestId}/messages` : undefined}
      />
    </div>
  );
}
