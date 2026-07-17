import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import SlotManager from '@/pages/admin/coaching/SlotManager';
import api from '@/lib/api';

vi.mock('@/lib/api', () => ({
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
    await user.click(screen.getByText('Créneau unique'));
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
    await user.click(screen.getByText('Créneau unique'));
    const input = screen.getByLabelText('Date et heure') as HTMLInputElement;
    await user.type(input, '2026-06-15T10:00');
    await user.click(screen.getByRole('button', { name: /^Ajouter$/ }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      '/api/admin/coaching/slots',
      expect.objectContaining({ datetime: expect.any(String) })
    ));
  });
});
