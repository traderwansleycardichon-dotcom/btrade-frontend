# Design Spec — Module Cover Images & Lesson Thumbnails

**Date:** 2026-06-01  
**Status:** Approved

---

## Overview

Ajoute imaj cover pou chak modul ak yon ti thumbnail pou chak leson nan BTrade Academy. Admin ap kapab ajoute yo lè li ap kreye oswa edite modul/leson yo via fòm egzistan yo. Itilizatè yo ap wè yo nan paj formation an ak nan lis leson yo.

---

## Architecture

### Nouvò champ yo (Backend dwe ajoute)

| Table    | Kolòn        | Type   | Nullable |
|----------|--------------|--------|----------|
| modules  | cover_image  | string | yes      |
| lessons  | thumbnail    | string | yes      |

API response dwe retounen `coverImage` (camelCase) pou modul ak `thumbnail` pou leson.

### Upload infrastructure

Reutilize `ImageUpload` component ki egziste nan `src/components/ui/ImageUpload.tsx`. Li upload fichye via `POST /api/upload` epi retounen yon URL. Pa gen chanjman pou fè nan upload logic la.

---

## Interfaces TypeScript

```ts
// Module — admin + user facing
interface Module {
  id: string;
  titre: string;
  description: string;
  icone: string;        // kenbe kòm fallback display
  coverImage?: string;  // URL upload (nullable)
  ordre: number;
  actif: boolean;
  lessons?: any[];
}

// Lesson — admin
interface Lesson {
  id: string;
  titre: string;
  contenu: string;
  videoUrl?: string;
  thumbnail?: string;   // URL upload (nullable)
  ordre: number;
  actif: boolean;
  quizQuestions: Question[];
}

// LessonListItem — user facing (ModuleLessonsPage)
interface LessonListItem {
  id: string;
  titre: string;
  ordre: number;
  thumbnail?: string;   // nouvo
  statut: 'locked' | 'available' | 'in_progress' | 'completed';
  lecture_done: boolean;
  quiz_passed: boolean;
  devoir_done: boolean;
}
```

---

## Admin Forms

### Fòm Modul (`src/pages/admin/academy/page.tsx`)

**Refactor:** Konvèti fòm nan pou itilize `useState` pou jere valè imaj la (pa posib ak `FormData` natif natal paske `ImageUpload` rele `onChange` asenkwon).

**Chanjman:**
- Retire champ `icone` tèks input la
- Ajoute `const [coverImage, setCoverImage] = useState(editingModule?.coverImage || '')`
- Ajoute `<ImageUpload value={coverImage} onChange={setCoverImage} label="Image Cover du Module" />` nan fòm nan
- `handleSubmit` ap li `coverImage` state la (pa `FormData`)
- Payload: `{ titre, description, cover_image: coverImage, ordre, actif }`

**Popilasyon pou edit:** `useEffect` ki watch `editingModule` pou reset `coverImage` state la.

### Fòm Leson (`src/pages/admin/academy/[moduleId]/page.tsx`)

**Refactor:** Menm konvèsyon pou itilize `useState` pou `thumbnail`.

**Chanjman:**
- Ajoute `const [thumbnail, setThumbnail] = useState(editingLesson?.thumbnail || '')`
- Ajoute `<ImageUpload value={thumbnail} onChange={setThumbnail} label="Thumbnail de la Leçon" className="aspect-square max-h-[120px]" />` anba champ `titre` a
- Payload ajoute: `thumbnail`

---

## Affichage Côté Utilisateur

### Page Formation (`src/pages/app/formation/page.tsx`)

**Div `h-40` nan kat modul la** (aktyèlman: emoji 5xl):

```tsx
// Si coverImage defini
<div className="h-40 relative border-b border-border/20 overflow-hidden">
  <img src={mod.coverImage} alt={mod.titre} className="w-full h-full object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
  {/* CircularProgress ak CheckCircle rete jan yo ye */}
</div>

// Sinon (fallback)
<div className="h-40 flex flex-col items-center justify-center relative border-b border-border/20 overflow-hidden">
  {/* egzistan gradient + BookOpen icone oswa emoji si toujou la */}
</div>
```

### Page Leson List (`src/pages/app/formation/ModuleLessonsPage.tsx`)

**Header modul `w-20 h-20`** (aktyèlman: emoji):
```tsx
{module.coverImage
  ? <img src={module.coverImage} alt={module.titre} className="w-full h-full object-cover rounded-[2rem] relative z-10" />
  : <span className="relative z-10 drop-shadow-md">{module.icone || '📖'}</span>
}
```

**Chak leson `w-12 h-12 rounded-2xl`** (aktyèlman: nimewo/checkmark/lock):
```tsx
{lesson.thumbnail && !isLocked
  ? <img src={lesson.thumbnail} alt={lesson.titre} className="w-full h-full object-cover rounded-2xl" />
  : /* konpòtman egzistan: nimewo, checkmark, lock */
}
```

---

## Fichye ki Touche

| Fichye | Chanjman |
|--------|----------|
| `src/pages/admin/academy/page.tsx` | Ajoute `coverImage` state, ranplase emoji input ak `ImageUpload`, mete ajou payload |
| `src/pages/admin/academy/[moduleId]/page.tsx` | Ajoute `thumbnail` state, ajoute `ImageUpload` nan fòm leson, mete ajou payload |
| `src/pages/app/formation/page.tsx` | Ajoute `coverImage` nan `Module` interface, chanje affichage kat la |
| `src/pages/app/formation/ModuleLessonsPage.tsx` | Ajoute `coverImage` + `thumbnail` nan interfaces, chanje header modul + chak leson |

`src/components/ui/ImageUpload.tsx` — **pa chanje**, reutilize jan li ye.

---

## Backward Compatibility

- Modul ki pa gen `coverImage` ap toujou afiche yo nòmalman (emoji fallback oswa gradient)
- Leson ki pa gen `thumbnail` ap toujou afiche badge nimewo/checkmark/lock jan yo te ye
- Pa gen brekaj pou done egzistan yo
