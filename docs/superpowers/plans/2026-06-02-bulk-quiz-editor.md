# Bulk Quiz Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-question admin quiz modal with a full bulk editor that loads existing questions and lets the admin add/edit/delete up to 10 questions per lesson in one session, saving them all at once.

**Architecture:** New component `BulkQuizEditorModal` holds all draft state. On "Sove tout" it fires DELETE for removed questions, PUT for edited ones, and POST for new ones — all in parallel. The parent page swaps out the old modal state for a single `quizLessonTarget` state that drives the new modal.

**Tech Stack:** React 18, TypeScript, TanStack Query mutations, Tailwind CSS, Vitest + Testing Library

---

## File Map

| File | Action |
|------|--------|
| `src/components/admin/BulkQuizEditorModal.tsx` | **Create** — bulk editor component |
| `src/test/admin/BulkQuizEditorModal.test.tsx` | **Create** — component tests |
| `src/pages/admin/academy/[moduleId]/page.tsx` | **Modify** — swap old modal for new one |

---

### Task 1: Write failing tests for BulkQuizEditorModal

**Files:**
- Create: `src/test/admin/BulkQuizEditorModal.test.tsx`

- [ ] **Step 1: Create the test file**

```tsx
// src/test/admin/BulkQuizEditorModal.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../test-utils';
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
```

- [ ] **Step 2: Run tests — verify they all fail (component doesn't exist yet)**

```bash
cd /Users/frantzleyadolphe/Documents/btrade/btrade-frontend
npx vitest run src/test/admin/BulkQuizEditorModal.test.tsx 2>&1 | tail -20
```

Expected: All tests FAIL with "Cannot find module '../../components/admin/BulkQuizEditorModal'"

---

### Task 2: Implement BulkQuizEditorModal component

**Files:**
- Create: `src/components/admin/BulkQuizEditorModal.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/admin/BulkQuizEditorModal.tsx
import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';

interface Question {
  id: string;
  question: string;
  options: string[];
  reponseCorrecte: number;
  explication: string | null;
  ordre: number;
}

interface DraftQuestion {
  _key: string;
  id?: string;
  question: string;
  options: [string, string, string, string];
  reponseCorrecte: number;
  explication: string;
}

interface ValidationError {
  questionKey: string;
  message: string;
}

export interface BulkQuizEditorModalProps {
  lessonId: string;
  lessonTitle: string;
  existingQuestions: Question[];
  onClose: () => void;
  onSaved: () => void;
}

function toFourOptions(opts: string[]): [string, string, string, string] {
  const padded = [...opts, '', '', '', ''];
  return [padded[0], padded[1], padded[2], padded[3]];
}

let keyCounter = 0;
function nextKey() { return `draft-${++keyCounter}`; }

function toDraft(q: Question): DraftQuestion {
  return {
    _key: nextKey(),
    id: q.id,
    question: q.question,
    options: toFourOptions(q.options),
    reponseCorrecte: q.reponseCorrecte,
    explication: q.explication || '',
  };
}

function emptyDraft(): DraftQuestion {
  return {
    _key: nextKey(),
    question: '',
    options: ['', '', '', ''],
    reponseCorrecte: 0,
    explication: '',
  };
}

export const BulkQuizEditorModal: React.FC<BulkQuizEditorModalProps> = ({
  lessonId,
  lessonTitle,
  existingQuestions,
  onClose,
  onSaved,
}) => {
  const { addToast } = useToast();
  const [drafts, setDrafts] = useState<DraftQuestion[]>(() =>
    existingQuestions.map(toDraft)
  );
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [saving, setSaving] = useState(false);

  const originalIds = new Set(existingQuestions.map(q => q.id));

  function updateDraft(key: string, patch: Partial<DraftQuestion>) {
    setDrafts(prev => prev.map(d => d._key === key ? { ...d, ...patch } : d));
    setErrors(prev => prev.filter(e => e.questionKey !== key));
  }

  function updateOption(key: string, idx: number, value: string) {
    setDrafts(prev => prev.map(d => {
      if (d._key !== key) return d;
      const options = [...d.options] as [string, string, string, string];
      options[idx] = value;
      return { ...d, options };
    }));
    setErrors(prev => prev.filter(e => e.questionKey !== key));
  }

  function addQuestion() {
    if (drafts.length >= 10) return;
    setDrafts(prev => [...prev, emptyDraft()]);
  }

  function removeQuestion(key: string) {
    setDrafts(prev => prev.filter(d => d._key !== key));
    setErrors(prev => prev.filter(e => e.questionKey !== key));
  }

  function validate(): ValidationError[] {
    const errs: ValidationError[] = [];
    for (const d of drafts) {
      if (!d.question.trim()) {
        errs.push({ questionKey: d._key, message: 'Tèks kesyon obligatwa' });
        continue;
      }
      const filled = d.options.filter(o => o.trim());
      if (filled.length < 2) {
        errs.push({ questionKey: d._key, message: 'Omwen 2 opsyon obligatwa' });
      }
    }
    return errs;
  }

  async function handleSave() {
    if (drafts.length === 0) {
      addToast('Ajoute omwen 1 kesyon', 'error');
      return;
    }
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const currentIds = new Set(drafts.filter(d => d.id).map(d => d.id!));
      const deletedIds = [...originalIds].filter(id => !currentIds.has(id));

      const deleteOps = deletedIds.map(id =>
        api.delete(`/api/admin/formation/lessons/${lessonId}/questions/${id}`)
      );

      const saveOps = drafts.map((d, idx) => {
        const payload = {
          question: d.question.trim(),
          options: d.options.filter(o => o.trim()),
          reponse_correcte: d.reponseCorrecte,
          explication: d.explication.trim() || null,
          ordre: idx + 1,
        };
        if (d.id) {
          return api.put(`/api/admin/formation/lessons/${lessonId}/questions/${d.id}`, payload);
        }
        return api.post(`/api/admin/formation/lessons/${lessonId}/questions`, payload);
      });

      await Promise.all([...deleteOps, ...saveOps]);
      addToast('Quiz sove!', 'success');
      onSaved();
    } catch {
      addToast('Erè pandan sove — eseye ankò.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-surface w-full max-w-3xl rounded-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0 bg-elevated">
          <div>
            <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Quiz Editor</p>
            <h2 className="text-lg font-bold text-txt">{lessonTitle}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-txt-3 bg-bg px-3 py-1 rounded-full border border-border">
              {drafts.length} / 10 kesyon
            </span>
            <button
              onClick={onClose}
              className="p-2 text-txt-3 hover:text-txt border border-border rounded-lg transition-colors"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">

          {drafts.map((d, idx) => {
            const err = errors.find(e => e.questionKey === d._key);
            return (
              <div
                key={d._key}
                className={`bg-bg border rounded-xl p-5 space-y-4 ${err ? 'border-loss' : 'border-border'}`}
              >
                {/* Block header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white bg-accent px-2.5 py-1 rounded-full">
                    Q{idx + 1}
                  </span>
                  <button
                    onClick={() => removeQuestion(d._key)}
                    className="text-txt-3 hover:text-loss transition-colors p-1"
                    aria-label={`Efase kesyon ${idx + 1}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Question text */}
                <div>
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-wider mb-1.5">
                    Tèks kesyon an
                  </label>
                  <input
                    value={d.question}
                    onChange={e => updateDraft(d._key, { question: e.target.value })}
                    placeholder="Ekri kesyon an..."
                    className="w-full bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-txt focus:outline-none focus:border-accent transition-colors"
                  />
                  {err && (
                    <p className="text-xs text-loss mt-1">{err.message}</p>
                  )}
                </div>

                {/* Options */}
                <div>
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-wider mb-2">
                    Opsyon repons <span className="text-txt-3 font-normal normal-case">(radio = bòn repons)</span>
                  </label>
                  <div className="space-y-2">
                    {d.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${d._key}`}
                          checked={d.reponseCorrecte === oIdx}
                          onChange={() => updateDraft(d._key, { reponseCorrecte: oIdx })}
                          className="w-4 h-4 text-accent border-border bg-elevated focus:ring-accent"
                        />
                        <input
                          value={opt}
                          onChange={e => updateOption(d._key, oIdx, e.target.value)}
                          placeholder={`Opsyon ${oIdx + 1}${oIdx < 2 ? ' *' : ' (opsyonèl)'}`}
                          className={`flex-1 bg-elevated border rounded-lg px-3 py-2 text-sm text-txt focus:outline-none focus:border-accent transition-colors ${
                            d.reponseCorrecte === oIdx && opt.trim()
                              ? 'border-win/50 bg-win/5'
                              : 'border-border'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-wider mb-1.5">
                    Explication <span className="font-normal normal-case">(opsyonèl)</span>
                  </label>
                  <textarea
                    value={d.explication}
                    onChange={e => updateDraft(d._key, { explication: e.target.value })}
                    placeholder="Afiche apre repons la..."
                    rows={2}
                    className="w-full bg-elevated border border-border rounded-lg px-3 py-2 text-sm text-txt-2 focus:outline-none focus:border-accent transition-colors resize-none"
                  />
                </div>
              </div>
            );
          })}

          {/* Add button */}
          {drafts.length < 10 && (
            <button
              onClick={addQuestion}
              className="w-full border-2 border-dashed border-border hover:border-accent/50 text-txt-3 hover:text-accent rounded-xl py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              aria-label="Ajoute yon kesyon"
            >
              <Plus size={16} />
              Ajoute yon kesyon
              <span className="text-xs opacity-60">({10 - drafts.length} resto)</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex justify-end gap-3 shrink-0 bg-elevated">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-bg text-txt font-bold rounded-xl border border-border hover:border-border-hover transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-loss text-white font-bold rounded-xl hover:bg-loss/90 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            Sove tout kesyon yo
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkQuizEditorModal;
```

- [ ] **Step 2: Run tests — verify they all pass**

```bash
cd /Users/frantzleyadolphe/Documents/btrade/btrade-frontend
npx vitest run src/test/admin/BulkQuizEditorModal.test.tsx 2>&1 | tail -20
```

Expected: All 9 tests PASS

- [ ] **Step 3: Check TypeScript**

```bash
cd /Users/frantzleyadolphe/Documents/btrade/btrade-frontend
npx tsc --noEmit 2>&1 | grep "BulkQuiz" | head -10
```

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/BulkQuizEditorModal.tsx src/test/admin/BulkQuizEditorModal.test.tsx
git commit -m "feat: add BulkQuizEditorModal component with tests"
```

---

### Task 3: Wire BulkQuizEditorModal into the admin lessons page

**Files:**
- Modify: `src/pages/admin/academy/[moduleId]/page.tsx`

The existing file has these pieces to remove and replace:

**Remove:**
- State: `isQuestionModalOpen`, `editingQuestion`, `currentLessonForQuestion`
- Mutation: `saveQuestion` (lines ~84–100)
- The entire `{/* Question Modal */}` JSX block (the IIFE pattern, lines ~303–369)

**Add:**
- State: `isBulkQuizOpen`, `quizLessonTarget`
- Import `BulkQuizEditorModal`
- `<BulkQuizEditorModal>` driven by `quizLessonTarget`

- [ ] **Step 1: Add import and replace state**

At the top of the file, add the import after the existing imports:

```tsx
import { BulkQuizEditorModal } from '../../../../components/admin/BulkQuizEditorModal';
```

Replace the three old question-modal state lines:
```tsx
// REMOVE these three lines:
const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
const [currentLessonForQuestion, setCurrentLessonForQuestion] = useState<string | null>(null);

// ADD these two lines:
const [quizLessonTarget, setQuizLessonTarget] = useState<Lesson | null>(null);
```

- [ ] **Step 2: Remove the saveQuestion mutation**

Delete the entire `saveQuestion` mutation block (roughly lines 84–100):

```tsx
// DELETE this entire block:
const saveQuestion = useMutation({
  mutationFn: async (questionData: any) => {
    if (editingQuestion) {
      return api.put(`/api/admin/formation/lessons/${currentLessonForQuestion}/questions/${editingQuestion.id}`, questionData);
    }
    return api.post(`/api/admin/formation/lessons/${currentLessonForQuestion}/questions`, questionData);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
    addToast('Question enregistrée.', 'success');
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  },
  onError: (err: any) => {
    addToast(err.response?.data?.error || 'Erreur', 'error');
  }
});
```

- [ ] **Step 3: Update the "+ Quiz" button**

Find this button (currently inside each lesson row):

```tsx
// FIND:
<button
  onClick={() => { setCurrentLessonForQuestion(lesson.id); setEditingQuestion(null); setIsQuestionModalOpen(true); }}
  className="px-3 py-2 bg-loss/10 text-loss rounded-lg font-bold hover:bg-loss/20 transition-colors ml-2 flex items-center gap-2"
>
  <Plus size={16} /> Quiz
</button>

// REPLACE WITH:
<button
  onClick={() => setQuizLessonTarget(lesson)}
  className="px-3 py-2 bg-loss/10 text-loss rounded-lg font-bold hover:bg-loss/20 transition-colors ml-2 flex items-center gap-2"
>
  <Plus size={16} /> Quiz
</button>
```

- [ ] **Step 4: Update the edit-question buttons inside quiz question list**

Find the two edit/delete buttons inside `lesson.quizQuestions.map(...)`:

```tsx
// FIND (edit button):
<button onClick={() => { setCurrentLessonForQuestion(lesson.id); setEditingQuestion(q); setIsQuestionModalOpen(true); }} className="p-1.5 text-txt-3 hover:text-loss transition-colors">
  <Edit2 size={14} />
</button>

// REPLACE WITH (opens bulk editor, which shows all questions including this one):
<button onClick={() => setQuizLessonTarget(lesson)} className="p-1.5 text-txt-3 hover:text-loss transition-colors">
  <Edit2 size={14} />
</button>
```

- [ ] **Step 5: Remove the old Question Modal JSX block and add the new modal**

Delete the entire old `{/* Question Modal */}` block — it starts at:
```tsx
      {/* Question Modal */}
      {isQuestionModalOpen && (() => {
```
and ends with:
```tsx
        );
      })()}
```

In its place, add right before the closing `</div>` of the page return:

```tsx
      {/* Bulk Quiz Editor Modal */}
      {quizLessonTarget && (
        <BulkQuizEditorModal
          lessonId={quizLessonTarget.id}
          lessonTitle={quizLessonTarget.titre}
          existingQuestions={quizLessonTarget.quizQuestions}
          onClose={() => setQuizLessonTarget(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
            setQuizLessonTarget(null);
          }}
        />
      )}
```

- [ ] **Step 6: Remove unused Edit2 import if no longer used elsewhere in the file**

Check if `Edit2` is still used (it is — on the edit lesson button). Keep it. Also verify `deleteQuestion` mutation is still present (it is — for deleting questions from the list). Keep it.

- [ ] **Step 7: Check TypeScript**

```bash
cd /Users/frantzleyadolphe/Documents/btrade/btrade-frontend
npx tsc --noEmit 2>&1 | tail -20
```

Expected: No errors

- [ ] **Step 8: Run full test suite**

```bash
cd /Users/frantzleyadolphe/Documents/btrade/btrade-frontend
npx vitest run 2>&1 | tail -20
```

Expected: All tests pass (or same pre-existing failures as before, none new)

- [ ] **Step 9: Commit**

```bash
git add src/pages/admin/academy/\[moduleId\]/page.tsx
git commit -m "feat: replace single-question modal with BulkQuizEditorModal"
```

---

### Task 4: Smoke-test in the browser

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/frantzleyadolphe/Documents/btrade/btrade-frontend
npm run dev
```

- [ ] **Step 2: Navigate to an admin lesson page**

Go to `/admin/academy/<any-module-id>`. Click the "+ Quiz" button on any lesson.

Expected: The new bulk editor modal opens showing existing questions (if any).

- [ ] **Step 3: Verify add, edit, delete, save**

1. Add a new question block — counter goes from N to N+1
2. Fill in question text + 2 options + select correct answer
3. Click "Sove tout kesyon yo" — modal closes, lesson row updates its question count
4. Re-open modal — the new question appears pre-populated
5. Delete a question — counter decreases
6. Save — modal closes, question removed from lesson row

- [ ] **Step 4: Final commit if everything works**

```bash
git add -A
git commit -m "feat: bulk quiz editor — complete implementation"
```
