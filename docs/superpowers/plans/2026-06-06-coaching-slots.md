# Coaching 1-on-1 Slot-Based Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace free-form date proposals with an admin-defined slot system — admin creates specific time slots, users pick one when booking a coaching session.

**Architecture:** A new `SlotPicker` presentational component handles slot selection in the user form. A new `SlotManager` component handles slot CRUD in the admin panel. `AdminCoachingPage` gains two main tabs (Créneaux / Demandes); `CoachingPage` replaces the three date inputs with `SlotPicker`. All changes follow TDD.

**Tech Stack:** React 18, TypeScript, Vitest + @testing-library/react, date-fns, lucide-react, Tailwind CSS (custom tokens: `accent`, `win`, `loss`, `surface`, `elevated`, `border`, `txt`, `txt-2`, `txt-3`, `glass`)

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/components/coaching/SlotPicker.tsx` | Presentational slot selector (no API calls) |
| Create | `src/test/coaching/SlotPicker.test.tsx` | Unit tests for SlotPicker |
| Create | `src/pages/admin/coaching/SlotManager.tsx` | Admin CRUD component for coaching slots |
| Create | `src/test/coaching/SlotManager.test.tsx` | Unit tests for SlotManager |
| Modify | `src/pages/app/coaching/page.tsx` | Replace date inputs with SlotPicker, update payload |
| Modify | `src/test/coaching/CoachingPage.test.tsx` | Update mocks and assertions for new form |
| Modify | `src/pages/admin/coaching/page.tsx` | Add main tabs, embed SlotManager, simplify accept modal |
| Modify | `src/test/coaching/AdminCoachingPage.test.tsx` | Update mocks and assertions |

---

## Task 1: SlotPicker component

**Files:**
- Create: `src/components/coaching/SlotPicker.tsx`
- Create: `src/test/coaching/SlotPicker.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/test/coaching/SlotPicker.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { SlotPicker } from '../../components/coaching/SlotPicker';

const mockSlots = [
  { id: 'slot-1', datetime: '2026-06-10T14:00:00.000Z' },
  { id: 'slot-2', datetime: '2026-06-11T10:00:00.000Z' },
];

describe('SlotPicker', () => {
  it('affiche le message vide quand aucun créneau', () => {
    render(<SlotPicker slots={[]} selectedSlotId="" onChange={vi.fn()} />);
    expect(screen.getByText(/Aucun créneau disponible/)).toBeInTheDocument();
  });

  it('affiche un radio par créneau', () => {
    render(<SlotPicker slots={mockSlots} selectedSlotId="" onChange={vi.fn()} />);
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('appelle onChange avec l\'id du créneau cliqué', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SlotPicker slots={mockSlots} selectedSlotId="" onChange={onChange} />);
    await user.click(screen.getAllByRole('radio')[0]);
    expect(onChange).toHaveBeenCalledWith('slot-1');
  });

  it('marque le créneau sélectionné comme checked', () => {
    render(<SlotPicker slots={mockSlots} selectedSlotId="slot-2" onChange={vi.fn()} />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/test/coaching/SlotPicker.test.tsx
```

Expected: FAIL — "Cannot find module '../../components/coaching/SlotPicker'"

- [ ] **Step 3: Implement SlotPicker**

Create `src/components/coaching/SlotPicker.tsx`:

```tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface CoachingSlot {
  id: string;
  datetime: string;
}

interface SlotPickerProps {
  slots: CoachingSlot[];
  selectedSlotId: string;
  onChange: (slotId: string) => void;
}

export function SlotPicker({ slots, selectedSlotId, onChange }: SlotPickerProps) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-txt-3 text-center py-4">
        Aucun créneau disponible pour le moment. Revenez bientôt.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {slots.map(slot => (
        <label
          key={slot.id}
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            selectedSlotId === slot.id
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-accent/50'
          }`}
        >
          <input
            type="radio"
            name="slot"
            value={slot.id}
            checked={selectedSlotId === slot.id}
            onChange={() => onChange(slot.id)}
            className="sr-only"
          />
          <Calendar size={14} className={selectedSlotId === slot.id ? 'text-accent' : 'text-txt-3'} />
          <span className="text-sm font-medium">
            {format(new Date(slot.datetime), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr })}
          </span>
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/test/coaching/SlotPicker.test.tsx
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/coaching/SlotPicker.tsx src/test/coaching/SlotPicker.test.tsx
git commit -m "feat: add SlotPicker component for coaching slot selection"
```

---

## Task 2: Update user CoachingPage

**Files:**
- Modify: `src/pages/app/coaching/page.tsx`
- Modify: `src/test/coaching/CoachingPage.test.tsx`

- [ ] **Step 1: Rewrite CoachingPage tests**

Replace the full content of `src/test/coaching/CoachingPage.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import CoachingPage from '../../pages/app/coaching/page';
import api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const mockSlots = [
  { id: 'slot-10', datetime: '2026-06-15T10:00:00.000Z' },
  { id: 'slot-11', datetime: '2026-06-16T14:00:00.000Z' },
];

const mockRequests = [
  {
    id: 'req-1',
    subject: 'trades',
    sessionType: 'zoom',
    slotId: 'slot-1',
    slot: { id: 'slot-1', datetime: '2026-06-10T14:00:00.000Z' },
    message: 'Analyse de mes trades sur EUR/USD cette semaine.',
    status: 'pending',
    createdAt: '2026-06-02T10:00:00.000Z',
  },
  {
    id: 'req-2',
    subject: 'psychology',
    sessionType: 'meet',
    slotId: 'slot-2',
    slot: { id: 'slot-2', datetime: '2026-06-12T10:00:00.000Z' },
    message: 'Travail sur discipline et gestion émotionnelle.',
    status: 'accepted',
    createdAt: '2026-06-01T08:00:00.000Z',
  },
  {
    id: 'req-3',
    subject: 'plan',
    sessionType: 'phone',
    slotId: 'slot-3',
    slot: { id: 'slot-3', datetime: '2026-06-14T15:00:00.000Z' },
    message: 'Révision complète de mon plan de trading mensuel.',
    status: 'rejected',
    rejectionReason: 'Créneaux indisponibles cette semaine.',
    createdAt: '2026-05-30T09:00:00.000Z',
  },
];

describe('CoachingPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('affiche le titre de la page', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: [] } };
    });
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Coaching 1-on-1')).toBeInTheDocument());
  });

  it('affiche l\'état vide avec bouton CTA', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: [] } };
    });
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Aucune demande')).toBeInTheDocument());
  });

  it('affiche les demandes avec leurs sujets', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockRequests } };
    });
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Analyse de trades')).toBeInTheDocument());
    expect(screen.getByText('Coaching psychologie')).toBeInTheDocument();
    expect(screen.getByText('Plan de trading')).toBeInTheDocument();
  });

  it('affiche le badge En attente pour status pending', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockRequests } };
    });
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('En attente')).toBeInTheDocument());
  });

  it('affiche le badge Accepté et bouton Ouvrir le chat pour status accepted', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockRequests } };
    });
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Accepté')).toBeInTheDocument());
    expect(screen.getByText('Ouvrir le chat')).toBeInTheDocument();
  });

  it('affiche le badge Refusé et le motif pour status rejected', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockRequests } };
    });
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Refusé')).toBeInTheDocument());
    expect(screen.getByText('Créneaux indisponibles cette semaine.')).toBeInTheDocument();
  });

  it('ouvre le modal de nouvelle demande et charge les créneaux', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/coaching/slots')) return { data: { data: mockSlots } };
      return { data: { data: [] } };
    });
    const user = userEvent.setup();
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Aucune demande')).toBeInTheDocument());
    await user.click(screen.getAllByText('Nouvelle demande')[0]);
    expect(screen.getByText('Nouvelle demande de coaching')).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByRole('radio').length).toBeGreaterThanOrEqual(2));
  });

  it('affiche le message vide si aucun créneau disponible', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/coaching/slots')) return { data: { data: [] } };
      return { data: { data: [] } };
    });
    const user = userEvent.setup();
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Aucune demande')).toBeInTheDocument());
    await user.click(screen.getAllByText('Nouvelle demande')[0]);
    await waitFor(() => expect(screen.getByText(/Aucun créneau disponible/)).toBeInTheDocument());
  });

  it('bloque la soumission si aucun créneau sélectionné', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/coaching/slots')) return { data: { data: mockSlots } };
      return { data: { data: [] } };
    });
    const user = userEvent.setup();
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Aucune demande')).toBeInTheDocument());
    await user.click(screen.getAllByText('Nouvelle demande')[0]);
    const textarea = screen.getByPlaceholderText(/Décrivez vos objectifs/);
    await user.type(textarea, 'Message suffisamment long pour passer la validation minimale.');
    await user.click(screen.getByText('Envoyer la demande'));
    expect(api.post).not.toHaveBeenCalled();
  });

  it('bloque la soumission si le message est trop court', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/coaching/slots')) return { data: { data: mockSlots } };
      return { data: { data: [] } };
    });
    const user = userEvent.setup();
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Aucune demande')).toBeInTheDocument());
    await user.click(screen.getAllByText('Nouvelle demande')[0]);
    await waitFor(() => expect(screen.getAllByRole('radio').length).toBeGreaterThanOrEqual(2));
    const slotRadios = screen.getAllByRole('radio').filter(r => r.getAttribute('name') === 'slot');
    await user.click(slotRadios[0]);
    const textarea = screen.getByPlaceholderText(/Décrivez vos objectifs/);
    await user.type(textarea, 'Court');
    await user.click(screen.getByText('Envoyer la demande'));
    expect(api.post).not.toHaveBeenCalled();
  });

  it('soumet le formulaire avec slotId et données valides', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/coaching/slots')) return { data: { data: mockSlots } };
      return { data: { data: [] } };
    });
    vi.mocked(api.post).mockResolvedValue({ data: { data: {} } });
    const user = userEvent.setup();
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Aucune demande')).toBeInTheDocument());
    await user.click(screen.getAllByText('Nouvelle demande')[0]);
    await waitFor(() => expect(screen.getAllByRole('radio').length).toBeGreaterThanOrEqual(2));
    const slotRadios = screen.getAllByRole('radio').filter(r => r.getAttribute('name') === 'slot');
    await user.click(slotRadios[0]);
    const textarea = screen.getByPlaceholderText(/Décrivez vos objectifs/);
    await user.type(textarea, 'Message suffisamment long pour passer la validation minimale.');
    await user.click(screen.getByText('Envoyer la demande'));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/coaching', expect.objectContaining({
      slotId: 'slot-10',
      subject: 'trades',
      sessionType: 'zoom',
      message: expect.stringContaining('Message suffisamment long'),
    })));
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/test/coaching/CoachingPage.test.tsx
```

Expected: Multiple FAILs — new tests expect `slotId` in POST payload but the page still sends `proposedDates`.

- [ ] **Step 3: Rewrite CoachingPage**

Replace the full content of `src/pages/app/coaching/page.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import { Video, Plus, MessageSquare, Calendar } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { Modal } from '../../../components/ui/Modal';
import { TicketThreadModal } from '../../../components/support/TicketThreadModal';
import { SlotPicker, CoachingSlot } from '../../../components/coaching/SlotPicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  useEffect(() => { fetchRequests(); }, []);

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
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/test/coaching/CoachingPage.test.tsx
```

Expected: PASS — 10 tests

- [ ] **Step 5: Commit**

```bash
git add src/pages/app/coaching/page.tsx src/test/coaching/CoachingPage.test.tsx
git commit -m "feat: replace date inputs with slot picker in user coaching form"
```

---

## Task 3: SlotManager component

**Files:**
- Create: `src/pages/admin/coaching/SlotManager.tsx`
- Create: `src/test/coaching/SlotManager.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/test/coaching/SlotManager.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import SlotManager from '../../pages/admin/coaching/SlotManager';
import api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const mockSlots = [
  { id: 'slot-1', datetime: '2026-06-10T14:00:00.000Z', status: 'available' },
  { id: 'slot-2', datetime: '2026-06-11T10:00:00.000Z', status: 'pending' },
  { id: 'slot-3', datetime: '2026-06-12T09:00:00.000Z', status: 'confirmed' },
  { id: 'slot-4', datetime: '2026-06-13T15:00:00.000Z', status: 'blocked' },
];

describe('SlotManager', () => {
  beforeEach(() => vi.clearAllMocks());

  it('affiche l\'état vide quand aucun créneau', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: [] } };
    });
    render(<SlotManager />);
    await waitFor(() => expect(screen.getByText('Aucun créneau')).toBeInTheDocument());
  });

  it('affiche les badges de statut pour chaque créneau', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockSlots } };
    });
    render(<SlotManager />);
    await waitFor(() => expect(screen.getByText('Disponible')).toBeInTheDocument());
    expect(screen.getByText('En attente')).toBeInTheDocument();
    expect(screen.getByText('Confirmé')).toBeInTheDocument();
    expect(screen.getByText('Bloqué')).toBeInTheDocument();
  });

  it('affiche le bouton Supprimer seulement pour les créneaux disponibles', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockSlots } };
    });
    render(<SlotManager />);
    await waitFor(() => expect(screen.getByText('Disponible')).toBeInTheDocument());
    const deleteButtons = screen.getAllByRole('button', { name: /Supprimer/i });
    expect(deleteButtons).toHaveLength(1);
  });

  it('appelle DELETE /api/admin/coaching/slots/:id sur suppression', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockSlots } };
    });
    vi.mocked(api.delete).mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    render(<SlotManager />);
    await waitFor(() => expect(screen.getByRole('button', { name: /Supprimer/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Supprimer/i }));
    expect(api.delete).toHaveBeenCalledWith('/api/admin/coaching/slots/slot-1');
  });

  it('ouvre le modal d\'ajout au clic sur Ajouter un créneau', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: [] } };
    });
    const user = userEvent.setup();
    render(<SlotManager />);
    await waitFor(() => expect(screen.getByText('Aucun créneau')).toBeInTheDocument());
    await user.click(screen.getByText('Ajouter un créneau'));
    expect(screen.getByLabelText('Date et heure')).toBeInTheDocument();
  });

  it('appelle POST /api/admin/coaching/slots avec datetime', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: [] } };
    });
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    render(<SlotManager />);
    await waitFor(() => expect(screen.getByText('Aucun créneau')).toBeInTheDocument());
    await user.click(screen.getByText('Ajouter un créneau'));
    const input = screen.getByLabelText('Date et heure') as HTMLInputElement;
    await user.type(input, '2026-06-15T10:00');
    await user.click(screen.getByRole('button', { name: /^Ajouter$/ }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      '/api/admin/coaching/slots',
      expect.objectContaining({ datetime: expect.any(String) })
    ));
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/test/coaching/SlotManager.test.tsx
```

Expected: FAIL — "Cannot find module '../../pages/admin/coaching/SlotManager'"

- [ ] **Step 3: Implement SlotManager**

Create `src/pages/admin/coaching/SlotManager.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CoachingSlot {
  id: string;
  datetime: string;
  status: 'available' | 'pending' | 'confirmed' | 'blocked';
}

const STATUS_LABELS: Record<CoachingSlot['status'], string> = {
  available: 'Disponible',
  pending: 'En attente',
  confirmed: 'Confirmé',
  blocked: 'Bloqué',
};

const STATUS_CLASSES: Record<CoachingSlot['status'], string> = {
  available: 'bg-win/10 text-win',
  pending: 'bg-amber-500/10 text-amber-500',
  confirmed: 'bg-accent/10 text-accent',
  blocked: 'bg-loss/10 text-loss',
};

export default function SlotManager() {
  const [slots, setSlots] = useState<CoachingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDatetime, setNewDatetime] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = () => {
    setLoading(true);
    api.get('/api/admin/coaching/slots')
      .then((res: any) => setSlots(res.data.data))
      .catch(() => addToast('Erreur lors du chargement des créneaux', 'error'))
      .finally(() => setLoading(false));
  };

  const handleAdd = async () => {
    if (!newDatetime) return;
    setSaving(true);
    try {
      await api.post('/api/admin/coaching/slots', { datetime: newDatetime });
      addToast('Créneau ajouté', 'success');
      setIsAdding(false);
      setNewDatetime('');
      fetchSlots();
    } catch {
      addToast("Erreur lors de l'ajout du créneau", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/admin/coaching/slots/${id}`);
      addToast('Créneau supprimé', 'success');
      fetchSlots();
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  if (loading) return <div className="p-12 text-center text-txt-3">Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Ajouter un créneau
        </button>
      </div>

      {slots.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-txt-3">
          <Calendar size={40} className="mb-3" />
          <p className="font-bold">Aucun créneau</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map(slot => (
            <div key={slot.id} className="glass rounded-2xl border border-border p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-txt-3 shrink-0" />
                <span className="text-sm font-medium">
                  {format(new Date(slot.datetime), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase ${STATUS_CLASSES[slot.status]}`}>
                  {STATUS_LABELS[slot.status]}
                </span>
                {slot.status === 'available' && (
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="text-txt-3 hover:text-loss transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-border w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-black">Ajouter un créneau</h2>
            <div>
              <label htmlFor="new-slot-datetime" className="block text-xs font-bold text-txt-2 mb-2">
                Date et heure
              </label>
              <input
                id="new-slot-datetime"
                type="datetime-local"
                value={newDatetime}
                onChange={e => setNewDatetime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-border focus:border-accent outline-none text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsAdding(false); setNewDatetime(''); }}
                className="flex-1 btn-ghost"
              >
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !newDatetime}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {saving ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/test/coaching/SlotManager.test.tsx
```

Expected: PASS — 6 tests

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/coaching/SlotManager.tsx src/test/coaching/SlotManager.test.tsx
git commit -m "feat: add SlotManager component for admin coaching slot CRUD"
```

---

## Task 4: Update admin CoachingPage

**Files:**
- Modify: `src/pages/admin/coaching/page.tsx`
- Modify: `src/test/coaching/AdminCoachingPage.test.tsx`

- [ ] **Step 1: Rewrite AdminCoachingPage tests**

Replace the full content of `src/test/coaching/AdminCoachingPage.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import AdminCoachingPage from '../../pages/admin/coaching/page';
import api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  default: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const mockRequests = [
  {
    id: 'req-1',
    userId: 'u1',
    userName: 'Alice Martin',
    userEmail: 'alice@example.com',
    subject: 'trades',
    sessionType: 'zoom',
    slotId: 'slot-1',
    slot: { id: 'slot-1', datetime: '2026-06-10T14:00:00.000Z' },
    message: 'Analyse mes trades récents sur EUR/USD depuis un mois.',
    status: 'pending',
    createdAt: '2026-06-02T10:00:00.000Z',
  },
  {
    id: 'req-2',
    userId: 'u2',
    userName: 'Bob Dupont',
    userEmail: 'bob@example.com',
    subject: 'psychology',
    sessionType: 'meet',
    slotId: 'slot-2',
    slot: { id: 'slot-2', datetime: '2026-06-15T09:00:00.000Z' },
    message: 'Travail sur discipline et gestion des émotions en live.',
    status: 'accepted',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
];

describe('AdminCoachingPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('affiche le titre de la page', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/admin/coaching/slots')) return { data: { data: [] } };
      return { data: { data: [] } };
    });
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Coaching 1-on-1')).toBeInTheDocument());
  });

  it('affiche les onglets principaux Créneaux et Demandes', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/admin/coaching/slots')) return { data: { data: [] } };
      return { data: { data: [] } };
    });
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: /Créneaux/i })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Demandes/i })).toBeInTheDocument();
  });

  it('affiche SlotManager en cliquant sur l\'onglet Créneaux', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/admin/coaching/slots')) return { data: { data: [] } };
      return { data: { data: [] } };
    });
    const user = userEvent.setup();
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: /Créneaux/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Créneaux/i }));
    await waitFor(() => expect(screen.getByText('Ajouter un créneau')).toBeInTheDocument());
  });

  it('affiche les demandes avec nom et email utilisateur', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/admin/coaching/slots')) return { data: { data: [] } };
      return { data: { data: mockRequests } };
    });
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Alice Martin')).toBeInTheDocument());
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Dupont')).toBeInTheDocument();
  });

  it('affiche les onglets de filtre dans l\'onglet Demandes', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/admin/coaching/slots')) return { data: { data: [] } };
      return { data: { data: mockRequests } };
    });
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: /^Tout$/i })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /En attente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Accepté$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Refusé$/i })).toBeInTheDocument();
  });

  it('filtre par onglet En attente — masque les acceptés', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/admin/coaching/slots')) return { data: { data: [] } };
      return { data: { data: mockRequests } };
    });
    const user = userEvent.setup();
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Alice Martin')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /En attente/i }));
    expect(screen.getByText('Alice Martin')).toBeInTheDocument();
    expect(screen.queryByText('Bob Dupont')).not.toBeInTheDocument();
  });

  it('affiche les boutons Accepter et Refuser sur une demande pending', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/admin/coaching/slots')) return { data: { data: [] } };
      return { data: { data: mockRequests } };
    });
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Accepter')).toBeInTheDocument());
    expect(screen.getByText('Refuser')).toBeInTheDocument();
  });

  it('ouvre le modal d\'acceptation', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/admin/coaching/slots')) return { data: { data: [] } };
      return { data: { data: mockRequests } };
    });
    const user = userEvent.setup();
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Accepter')).toBeInTheDocument());
    await user.click(screen.getByText('Accepter'));
    expect(screen.getByText('Accepter la demande')).toBeInTheDocument();
    expect(screen.getByText('Confirmer')).toBeInTheDocument();
  });

  it('appelle PATCH avec status accepted sans confirmedDate', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/admin/coaching/slots')) return { data: { data: [] } };
      return { data: { data: mockRequests } };
    });
    vi.mocked(api.patch).mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Accepter')).toBeInTheDocument());
    await user.click(screen.getByText('Accepter'));
    await user.click(screen.getByText('Confirmer'));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith(
      '/api/admin/coaching/req-1/status',
      expect.objectContaining({ status: 'accepted' })
    ));
    expect(api.patch).not.toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ confirmedDate: expect.anything() })
    );
  });

  it('ouvre le modal de refus et appelle PATCH avec status rejected', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/admin/coaching/slots')) return { data: { data: [] } };
      return { data: { data: mockRequests } };
    });
    vi.mocked(api.patch).mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Refuser')).toBeInTheDocument());
    await user.click(screen.getByText('Refuser'));
    expect(screen.getByText('Refuser la demande')).toBeInTheDocument();
    const reasonInput = screen.getByPlaceholderText(/Expliquez le motif/);
    await user.type(reasonInput, 'Créneaux non disponibles.');
    await user.click(screen.getByText('Confirmer le refus'));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith(
      '/api/admin/coaching/req-1/status',
      expect.objectContaining({ status: 'rejected' })
    ));
  });

  it('affiche le bouton Ouvrir le chat pour une demande acceptée', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/admin/coaching/slots')) return { data: { data: [] } };
      return { data: { data: mockRequests } };
    });
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Ouvrir le chat')).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run src/test/coaching/AdminCoachingPage.test.tsx
```

Expected: Multiple FAILs — tests expect "Créneaux" tab and updated accept modal behavior.

- [ ] **Step 3: Rewrite AdminCoachingPage**

Replace the full content of `src/pages/admin/coaching/page.tsx`:

```tsx
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

type MainTab = 'slots' | 'requests';
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
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-elevated text-txt-3">
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
        fetchEndpoint={chatRequestId ? `/api/coaching/${chatRequestId}/messages` : undefined}
        replyEndpoint={chatRequestId ? `/api/coaching/${chatRequestId}/messages` : undefined}
        isAdminView={true}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run src/test/coaching/AdminCoachingPage.test.tsx
```

Expected: PASS — 11 tests

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: All tests pass. No regressions.

- [ ] **Step 6: Commit**

```bash
git add src/pages/admin/coaching/page.tsx src/test/coaching/AdminCoachingPage.test.tsx
git commit -m "feat: add Créneaux tab and simplify accept modal in admin coaching page"
```
