import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import api from '@/lib/api';
import { CustomEmailEditor, CustomEmailPreview } from '@/components/admin/CustomEmailEditor';

vi.mock('@/lib/api', () => ({ default: { post: vi.fn() } }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(api.post).mockResolvedValue({ data: { data: { body: '<html><body>Preview</body></html>' } } });
});
afterEach(() => vi.useRealTimers());
const advance = () => act(async () => { await vi.advanceTimersByTimeAsync(400); });

describe('custom email editor', () => {
  it('previews unsaved content with the backend and isolates the HTML', async () => {
    render(<CustomEmailEditor subject="Live" body="Bonjou" onChange={vi.fn()} templateId="live" />);
    await advance();
    expect(api.post).toHaveBeenCalledWith('/api/admin/emails/preview', { templateId: 'live', subject: 'Live', body: 'Bonjou', subjectOverride: undefined }, expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(screen.getByTitle('Aperçu de votre email')).toHaveAttribute('sandbox', '');
    expect(screen.getByTitle('Aperçu de votre email')).toHaveAttribute('srcdoc', '<html><body>Preview</body></html>');
  });

  it('inserts a named button without making the admin write HTML', () => {
    const onChange = vi.fn();
    render(<CustomEmailEditor subject="Live" body="Bonjou" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter un bouton' }));
    fireEvent.change(screen.getByLabelText('Texte du bouton'), { target: { value: 'Rejoindre le live' } });
    fireEvent.change(screen.getByLabelText('Lien du bouton'), { target: { value: 'https://example.com/live' } });
    fireEvent.click(screen.getByRole('button', { name: 'Insérer le bouton' }));
    expect(onChange).toHaveBeenCalledWith('Bonjou\n\n[Rejoindre le live](https://example.com/live)');
  });

  it('rejects unsafe button URLs', () => {
    const onChange = vi.fn();
    render(<CustomEmailEditor subject="Live" body="Bonjou" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter un bouton' }));
    fireEvent.change(screen.getByLabelText('Texte du bouton'), { target: { value: 'Live' } });
    fireEvent.change(screen.getByLabelText('Lien du bouton'), { target: { value: 'javascript:alert(1)' } });
    fireEvent.click(screen.getByRole('button', { name: 'Insérer le bouton' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('https://');
  });

  it('shows a failed preview instead of a misleading old render', async () => {
    const { rerender } = render(<CustomEmailPreview subject="Live" body="Bonjou" />);
    await advance();
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Unavailable'));
    rerender(<CustomEmailPreview subject="Updated" body="Bonjou" />);
    await advance();
    expect(screen.getByRole('alert')).toHaveTextContent('Impossible de charger');
    expect(screen.queryByTitle('Aperçu de votre email')).not.toBeInTheDocument();
  });

  it('ignores a late response for an older draft', async () => {
    let resolveOld!: (value: unknown) => void;
    vi.mocked(api.post).mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
    const { rerender } = render(<CustomEmailPreview subject="Old" body="Old" />);
    await advance();
    rerender(<CustomEmailPreview subject="New" body="New" />);
    await advance();
    await act(async () => resolveOld({ data: { data: { body: 'Old render' } } }));
    expect(screen.getByTitle('Aperçu de votre email')).toHaveAttribute('srcdoc', '<html><body>Preview</body></html>');
  });
});
