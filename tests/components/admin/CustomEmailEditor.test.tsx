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

  it('builds the button from the admin title and link without making them write HTML', () => {
    const onChange = vi.fn();
    const { rerender } = render(<CustomEmailEditor subject="Live" body="Bonjou" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Texte du bouton'), { target: { value: 'Voir la session' } });
    expect(onChange).toHaveBeenLastCalledWith('Bonjou');
    rerender(<CustomEmailEditor subject="Live" body="Bonjou" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Lien du bouton'), { target: { value: 'https://example.com/live' } });
    expect(onChange).toHaveBeenLastCalledWith('Bonjou\n\n[Voir la session](https://example.com/live)');
  });

  it('pre-fills the fields from a saved template and replaces its button instead of duplicating it', () => {
    const onChange = vi.fn();
    render(<CustomEmailEditor subject="Live" body={'Mèsi [voir ici](https://old.example.com) nan mesaj la\n\n[Ansyen tit](https://old.example.com/live)'} onChange={onChange} />);
    expect(screen.getByLabelText('Texte du bouton')).toHaveValue('Ansyen tit');
    expect(screen.getByLabelText('Lien du bouton')).toHaveValue('https://old.example.com/live');
    fireEvent.change(screen.getByLabelText('Texte du bouton'), { target: { value: 'Nouvo tit' } });
    expect(onChange).toHaveBeenLastCalledWith('Mèsi [voir ici](https://old.example.com) nan mesaj la\n\n[Nouvo tit](https://old.example.com/live)');
  });

  it('keeps an HTML body in HTML when the admin sets the button', () => {
    const onChange = vi.fn();
    const { rerender } = render(<CustomEmailEditor subject="Live" body="<p>Bonjou</p>" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Texte du bouton'), { target: { value: 'Voir' } });
    rerender(<CustomEmailEditor subject="Live" body="<p>Bonjou</p>" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Lien du bouton'), { target: { value: 'https://example.com/live' } });
    expect(onChange).toHaveBeenLastCalledWith('<p>Bonjou</p>\n\n<p><a href="https://example.com/live">Voir</a></p>');
  });

  it('rejects unsafe button URLs and leaves the message without a button', () => {
    const onChange = vi.fn();
    const { rerender } = render(<CustomEmailEditor subject="Live" body="Bonjou" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Texte du bouton'), { target: { value: 'Live' } });
    rerender(<CustomEmailEditor subject="Live" body="Bonjou" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Lien du bouton'), { target: { value: 'javascript:alert(1)' } });
    expect(onChange).toHaveBeenLastCalledWith('Bonjou');
    expect(screen.getByRole('alert')).toHaveTextContent('https://');
  });

  it('removes the button when the admin clears the link', () => {
    const onChange = vi.fn();
    render(<CustomEmailEditor subject="Live" body={'Bonjou\n\n[Voir](https://example.com/live)'} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Lien du bouton'), { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith('Bonjou');
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
