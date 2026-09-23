import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import AdminEmailsPage from '@/pages/admin/emails/page';
import api from '@/lib/api';

vi.mock('@/lib/api', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));
vi.mock('@/hooks/useToast', () => ({ useToast: () => ({ addToast: vi.fn() }) }));
vi.mock('@/components/admin/CustomEmailEditor', () => ({
  CustomEmailEditor: ({ body, onChange }: { body: string; onChange: (value: string) => void }) => <textarea aria-label="Custom message" value={body} onChange={e => onChange(e.target.value)} />,
  CustomEmailPreview: ({ subjectOverride }: { subjectOverride: string }) => <div data-testid="campaign-preview">{subjectOverride}</div>,
}));
const templates = [
  { id: 'welcome', name: 'Welcome', subject: 'Welcome', body: '<p>Automatic</p>', isActive: true, isCustom: false, updatedAt: '2026-09-23' },
  { id: 'custom_live', name: 'Live', subject: 'Live', body: 'Bonjou', isActive: true, isCustom: true, updatedAt: '2026-09-23' },
];
beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async url => ({ data: { data: url === '/api/admin/emails' ? templates : [] } }));
  vi.mocked(api.put).mockResolvedValue({ data: {} });
});

it('uses the premium editor only for custom templates and saves their original source', async () => {
  render(<AdminEmailsPage />);
  const edits = await screen.findAllByRole('button', { name: 'Éditer' });
  fireEvent.click(edits[0]);
  expect(screen.queryByLabelText('Custom message')).not.toBeInTheDocument();
  expect(screen.getByDisplayValue('<p>Automatic</p>')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
  fireEvent.click(edits[1]);
  fireEvent.change(screen.getByLabelText('Custom message'), { target: { value: 'Mèsi\n\nhttps://example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sauvegarder' }));
  await waitFor(() => expect(api.put).toHaveBeenCalledWith('/api/admin/emails/custom_live', { subject: 'Live', body: 'Mèsi\n\nhttps://example.com', isActive: true }));
});

it('uses the premium editor when creating a new custom template', async () => {
  render(<AdminEmailsPage />);
  await screen.findAllByRole('button', { name: 'Éditer' });
  fireEvent.click(screen.getByRole('button', { name: 'Nouveau template' }));
  expect(screen.getByLabelText('Custom message')).toBeInTheDocument();
});

it('previews a selected custom campaign with its overridden subject', async () => {
  render(<AdminEmailsPage />);
  await screen.findAllByRole('button', { name: 'Éditer' });
  fireEvent.click(screen.getByRole('button', { name: 'Campagnes' }));
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'custom_live' } });
  fireEvent.change(screen.getByPlaceholderText('Laisse vide pour utiliser le sujet du template'), { target: { value: 'Session spéciale' } });
  expect(screen.getByTestId('campaign-preview')).toHaveTextContent('Session spéciale');
});
