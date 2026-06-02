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
