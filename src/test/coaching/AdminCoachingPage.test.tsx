import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import AdminCoachingPage from '../../pages/admin/coaching/page';
import api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  default: { get: vi.fn(), patch: vi.fn() },
}));

const mockRequests = [
  {
    id: 'req-1',
    userId: 'u1',
    userName: 'Alice Martin',
    userEmail: 'alice@example.com',
    subject: 'trades',
    sessionType: 'zoom',
    proposedDates: ['2026-06-10T14:00:00.000Z', '2026-06-11T10:00:00.000Z'],
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
    proposedDates: ['2026-06-15T09:00:00.000Z'],
    message: 'Travail sur discipline et gestion des émotions en live.',
    status: 'accepted',
    confirmedDate: '2026-06-15T09:00:00.000Z',
    createdAt: '2026-06-01T10:00:00.000Z',
  },
];

describe('AdminCoachingPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('affiche le titre de la page', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: [] } };
    });
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Coaching 1-on-1')).toBeInTheDocument());
  });

  it('affiche les demandes avec nom et email utilisateur', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockRequests } };
    });
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Alice Martin')).toBeInTheDocument());
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Dupont')).toBeInTheDocument();
  });

  it('affiche les onglets de filtre', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockRequests } };
    });
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: /Tout/i })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /En attente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accepté/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refusé/i })).toBeInTheDocument();
  });

  it('filtre par onglet En attente — masque les acceptés', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
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
      return { data: { data: mockRequests } };
    });
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Accepter')).toBeInTheDocument());
    expect(screen.getByText('Refuser')).toBeInTheDocument();
  });

  it('ouvre le modal d\'acceptation avec les dates proposées', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockRequests } };
    });
    const user = userEvent.setup();
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Accepter')).toBeInTheDocument());
    await user.click(screen.getByText('Accepter'));
    expect(screen.getByText('Accepter la demande')).toBeInTheDocument();
  });

  it('appelle PATCH avec status accepted sur confirmation', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockRequests } };
    });
    vi.mocked(api.patch).mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Accepter')).toBeInTheDocument());
    await user.click(screen.getByText('Accepter'));
    // First proposed date is auto-selected; click Confirmer
    await user.click(screen.getByText('Confirmer'));
    await waitFor(() => expect(api.patch).toHaveBeenCalledWith(
      '/api/admin/coaching/req-1/status',
      expect.objectContaining({ status: 'accepted', confirmedDate: expect.any(String) })
    ));
  });

  it('ouvre le modal de refus et appelle PATCH avec status rejected', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: { data: mockRequests } };
    });
    vi.mocked(api.patch).mockResolvedValue({ data: {} });
    const user = userEvent.setup();
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Refuser')).toBeInTheDocument());
    await user.click(screen.getByText('Refuser'));
    expect(screen.getByText('Refuser la demande')).toBeInTheDocument();
    // Type an optional rejection reason before confirming
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
      return { data: { data: mockRequests } };
    });
    render(<AdminCoachingPage />);
    await waitFor(() => expect(screen.getByText('Ouvrir le chat')).toBeInTheDocument());
  });
});
