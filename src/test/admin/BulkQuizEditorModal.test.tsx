// src/test/admin/BulkQuizEditorModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { BulkQuizEditorModal } from '../../components/admin/BulkQuizEditorModal';
import api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockExistingQuestions = [
  {
    id: 'q1',
    question: 'Kisa yon support ye?',
    options: ['Nivo ki anba', 'Nivo ki anwo', 'Yon tandan', 'Yon chandelye'],
    reponseCorrecte: 0,
    explication: 'Support = nivo anba',
    ordre: 1,
  },
];

const defaultProps = {
  lessonId: 'lesson-123',
  lessonTitle: 'Leçon 3: Supports',
  existingQuestions: mockExistingQuestions,
  onClose: vi.fn(),
  onSaved: vi.fn(),
};

describe('BulkQuizEditorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rann modal la ak kesyon ki egziste yo', () => {
    render(<BulkQuizEditorModal {...defaultProps} />);
    expect(screen.getByText('Leçon 3: Supports')).toBeInTheDocument();
    expect(screen.getByText('1 / 10 kesyon')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kisa yon support ye?')).toBeInTheDocument();
  });

  it('ajoute yon blok kesyon vid lè yo klike + Ajoute', async () => {
    const user = userEvent.setup();
    render(<BulkQuizEditorModal {...defaultProps} existingQuestions={[]} />);
    expect(screen.getByText('0 / 10 kesyon')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /ajoute yon kesyon/i }));
    expect(screen.getByText('1 / 10 kesyon')).toBeInTheDocument();
  });

  it('kache bouton + lè genyen 10 kesyon', () => {
    const tenQuestions = Array.from({ length: 10 }, (_, i) => ({
      id: `q${i}`,
      question: `Kesyon ${i + 1}`,
      options: ['A', 'B', 'C', 'D'],
      reponseCorrecte: 0,
      explication: '',
      ordre: i + 1,
    }));
    render(<BulkQuizEditorModal {...defaultProps} existingQuestions={tenQuestions} />);
    expect(screen.queryByRole('button', { name: /ajoute yon kesyon/i })).not.toBeInTheDocument();
  });

  it('retire yon kesyon lè yo klike sou bouton efase a', async () => {
    const user = userEvent.setup();
    render(<BulkQuizEditorModal {...defaultProps} />);
    expect(screen.getByText('1 / 10 kesyon')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /efase kesyon 1/i }));
    expect(screen.getByText('0 / 10 kesyon')).toBeInTheDocument();
  });

  it('rele onClose lè yo klike Annuler', async () => {
    const user = userEvent.setup();
    render(<BulkQuizEditorModal {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /annuler/i }));
    expect(defaultProps.onClose).toHaveBeenCalledOnce();
  });

  it('montre erè validasyon si kesyon vid yo soumèt', async () => {
    const user = userEvent.setup();
    render(<BulkQuizEditorModal {...defaultProps} existingQuestions={[]} />);
    await user.click(screen.getByRole('button', { name: /ajoute yon kesyon/i }));
    await user.click(screen.getByRole('button', { name: /sove tout/i }));
    expect(screen.getByText(/tèks kesyon obligatwa/i)).toBeInTheDocument();
  });

  it('montre erè validasyon si mwens ke 2 opsyon', async () => {
    const user = userEvent.setup();
    const incompleteQ = [{ ...mockExistingQuestions[0], options: ['Sèlman yon opsyon', '', '', ''] }];
    render(<BulkQuizEditorModal {...defaultProps} existingQuestions={incompleteQ} />);
    await user.click(screen.getByRole('button', { name: /sove tout/i }));
    expect(screen.getByText(/omwen 2 opsyon obligatwa/i)).toBeInTheDocument();
  });

  it('fè POST pou nouvo kesyon epi rele onSaved apre siksè', async () => {
    const user = userEvent.setup();
    vi.mocked(api.post).mockResolvedValue({ data: {} });
    render(<BulkQuizEditorModal {...defaultProps} existingQuestions={[]} />);
    await user.click(screen.getByRole('button', { name: /ajoute yon kesyon/i }));

    const questionInput = screen.getAllByPlaceholderText(/ekri kesyon an/i)[0];
    await user.type(questionInput, 'Nouvo kesyon test');

    const optionInputs = screen.getAllByPlaceholderText(/opsyon/i);
    await user.type(optionInputs[0], 'Repons A');
    await user.type(optionInputs[1], 'Repons B');

    await user.click(screen.getByRole('button', { name: /sove tout/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/admin/formation/lessons/lesson-123/questions',
        expect.objectContaining({ question: 'Nouvo kesyon test' })
      );
      expect(defaultProps.onSaved).toHaveBeenCalledOnce();
    });
  });

  it('fè PUT pou kesyon egzistan ki modifye', async () => {
    const user = userEvent.setup();
    vi.mocked(api.put).mockResolvedValue({ data: {} });
    render(<BulkQuizEditorModal {...defaultProps} />);

    const questionInput = screen.getByDisplayValue('Kisa yon support ye?');
    await user.clear(questionInput);
    await user.type(questionInput, 'Kesyon modifye');

    await user.click(screen.getByRole('button', { name: /sove tout/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/api/admin/formation/lessons/lesson-123/questions/q1',
        expect.objectContaining({ question: 'Kesyon modifye' })
      );
    });
  });

  it('fè DELETE pou kesyon ki te egziste men ki retire', async () => {
    const user = userEvent.setup();
    vi.mocked(api.delete).mockResolvedValue({ data: {} });
    render(<BulkQuizEditorModal {...defaultProps} />);
    await user.click(screen.getByRole('button', { name: /efase kesyon 1/i }));
    await user.click(screen.getByRole('button', { name: /sove tout/i }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        '/api/admin/formation/lessons/lesson-123/questions/q1'
      );
      expect(defaultProps.onSaved).toHaveBeenCalledOnce();
    });
  });
});
