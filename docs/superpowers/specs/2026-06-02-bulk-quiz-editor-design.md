# Bulk Quiz Editor — Design Spec
**Date:** 2026-06-02  
**Status:** Approved

---

## Problem

The admin quiz modal in `src/pages/admin/academy/[moduleId]/page.tsx` currently adds one question at a time. Each click on "+ Quiz" opens a modal for a single question, which makes building a multi-question quiz slow and tedious. The admin needs to create and manage up to 10 questions per lesson in a single editing session.

The 80% pass-rate logic already exists in the backend (`quiz_passed` flag, `score`, `passed` fields) and is already enforced in the user-facing `LessonDetailPage.tsx`. No backend or user-facing changes are needed for the pass-rate requirement.

---

## Scope

**In scope:**
- Replace the single-question modal with a full bulk quiz editor modal (admin only)
- Extract the new modal into a dedicated component: `src/components/admin/BulkQuizEditorModal.tsx`
- Support adding, editing, deleting, and reordering up to 10 questions per lesson in one session
- Single "Sove tout" action that batch-saves all questions via the existing API

**Out of scope:**
- Any changes to the user-facing quiz experience (`LessonDetailPage.tsx`)
- Any changes to the 80% pass-rate logic (already working)
- Reordering questions (ordre is auto-assigned by array position, 1-based)
- Backend API changes (existing per-question endpoints are sufficient)

---

## Architecture

### New component: `BulkQuizEditorModal`

**Location:** `src/components/admin/BulkQuizEditorModal.tsx`

**Props:**
```ts
interface BulkQuizEditorModalProps {
  lessonId: string;
  lessonTitle: string;
  existingQuestions: Question[];   // pre-loaded from parent
  onClose: () => void;
  onSaved: () => void;             // triggers queryClient.invalidateQueries in parent
}
```

**Internal state:**
```ts
type DraftQuestion = {
  id?: string;          // present if editing an existing question
  question: string;
  options: [string, string, string, string];
  reponseCorrecte: number;
  explication: string;
  ordre: number;
};
```

On mount, the component initialises `draftQuestions` from `existingQuestions`. Each question maps 1:1 to a `DraftQuestion` entry.

### Save strategy

On "Sove tout kesyon yo":
1. Validate: every draft must have a non-empty `question`, at least 2 non-empty options, and a valid `reponseCorrecte`.
2. For each draft:
   - If `id` is present → `PUT /api/admin/formation/lessons/:lessonId/questions/:id`
   - If `id` is absent (new) → `POST /api/admin/formation/lessons/:lessonId/questions`
3. For questions that existed on open but are now absent from drafts → `DELETE /api/admin/formation/lessons/:lessonId/questions/:id`
4. All requests fire in parallel via `Promise.all`. On full success, call `onSaved()` and close modal.
5. On partial failure, show a toast error listing which questions failed; keep modal open so the admin can retry.

### Parent changes (`[moduleId]/page.tsx`)

- Remove `isQuestionModalOpen`, `editingQuestion`, `currentLessonForQuestion` state and the single-question `Question Modal` JSX block.
- Add `isBulkQuizModalOpen` + `quizLessonTarget: Lesson | null` state.
- The "+ Quiz" button sets `quizLessonTarget = lesson` and opens the modal.
- Render `<BulkQuizEditorModal>` when `isBulkQuizModalOpen`.

---

## UI Layout

**Modal dimensions:** `max-w-3xl`, `max-h-[90vh]`, scrollable body.

**Header (fixed, not scrollable):**
- Left: small orange label "Quiz Editor" + lesson title in bold
- Right: pill showing "N / 10 kesyon" + close button (✕)

**Scrollable body:**
- One `DraftQuestionBlock` per question, stacked vertically with `gap-4`
- Each block contains:
  - Row: orange numbered badge (Q1, Q2…) + trash icon (disabled if only 1 question)
  - Textarea for question text (required)
  - 4 option rows: radio button (selects correct answer) + text input; options 3 & 4 are optional
  - Collapsible explanation textarea (optional)
- Below all blocks: dashed "+ Ajoute yon kesyon (N resto)" button — hidden when 10 questions reached

**Footer (fixed, not scrollable):**
- "Annuler" ghost button + "Sove tout kesyon yo" primary button
- Primary button shows spinner and is disabled while saving

---

## Validation Rules

| Rule | Behaviour |
|------|-----------|
| Question text empty | Red border + inline error, block save |
| Fewer than 2 options filled | Inline error on empty option fields, block save |
| No correct answer selected | Inline error, block save |
| More than 10 questions | "+ Ajoute" button disappears |
| 0 questions on save | Block save with toast: "Ajoute omwen 1 kesyon" |

---

## Error Handling

- Validation errors are shown inline per question block before any API call is made.
- API errors (network, 4xx/5xx) are shown as a toast. The modal stays open.
- Partial save failures (some questions saved, some failed) are reported per-question in the toast message.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/BulkQuizEditorModal.tsx` | **New** — full bulk editor component |
| `src/pages/admin/academy/[moduleId]/page.tsx` | Remove old single-question modal; integrate `BulkQuizEditorModal` |

No other files change.
