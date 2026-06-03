import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import CoachingPage from '../../pages/app/coaching/page';
import api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const mockRequests = [
  {
    id: 'req-1',
    subject: 'trades',
    sessionType: 'zoom',
    proposedDates: ['2026-06-10T14:00:00.000Z'],
    message: 'Analyse de mes trades sur EUR/USD cette semaine.',
    status: 'pending',
    createdAt: '2026-06-02T10:00:00.000Z',
  },
  {
    id: 'req-2',
    subject: 'psychology',
    sessionType: 'meet',
    proposedDates: ['2026-06-12T10:00:00.000Z'],
    message: 'Travail sur discipline et gestion émotionnelle.',
    status: 'accepted',
    confirmedDate: '2026-06-12T10:00:00.000Z',
    createdAt: '2026-06-01T08:00:00.000Z',
  },
  {
    id: 'req-3',
    subject: 'plan',
    sessionType: 'phone',
    proposedDates: ['2026-06-14T15:00:00.000Z'],
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

  it('ouvre le modal de nouvelle demande', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: [] } };
    });
    const user = userEvent.setup();
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Aucune demande')).toBeInTheDocument());
    await user.click(screen.getAllByText('Nouvelle demande')[0]);
    expect(screen.getByText('Nouvelle demande de coaching')).toBeInTheDocument();
  });

  it('bloque la soumission si le message est trop court', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: [] } };
    });
    const user = userEvent.setup();
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Aucune demande')).toBeInTheDocument());
    await user.click(screen.getAllByText('Nouvelle demande')[0]);
    const textarea = screen.getByPlaceholderText(/Décrivez vos objectifs/);
    await user.type(textarea, 'Court');
    await user.click(screen.getByText('Envoyer la demande'));
    expect(api.post).not.toHaveBeenCalled();
  });

  it('soumet le formulaire avec données valides', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: [] } };
    });
    vi.mocked(api.post).mockResolvedValue({ data: { data: {} } });
    const user = userEvent.setup();
    render(<CoachingPage />);
    await waitFor(() => expect(screen.getByText('Aucune demande')).toBeInTheDocument());
    await user.click(screen.getAllByText('Nouvelle demande')[0]);
    const textarea = screen.getByPlaceholderText(/Décrivez vos objectifs/);
    await user.type(textarea, 'Message suffisamment long pour passer la validation minimale.');
    // Fill first date
    const dateInput = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    await user.type(dateInput, '2026-06-15T10:00');
    await user.click(screen.getByText('Envoyer la demande'));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/coaching', expect.objectContaining({
      subject: 'trades',
      sessionType: 'zoom',
      message: expect.stringContaining('Message suffisamment long'),
    })));
  });
});
