# Module Cover Images & Lesson Thumbnails — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajoute yon `coverImage` pou chak modul ak yon `thumbnail` pou chak leson — admin jere yo via `ImageUpload`, itilizatè wè yo nan formation pages yo.

**Architecture:** Reutilize `ImageUpload` component (`src/components/ui/ImageUpload.tsx`) ki deja konekte ak `POST /api/upload`. Admin forms yo ap itilize `useState` pou jere valè imaj asenkwon yo. User-facing pages ap afiche imaj si yo egziste, sinon fallback (emoji / badge nimewo).

**Tech Stack:** React 18, TypeScript, TanStack Query, Vitest + @testing-library/react

**Note backend:** Backend dwe ajoute `cover_image` (nullable string) sou table `modules` ak `thumbnail` (nullable string) sou table `lessons`. API response dwe retounen `coverImage` (camelCase) pou modul ak `thumbnail` pou leson.

---

## File Map

| Fichye | Wòl chanjman |
|--------|--------------|
| `src/pages/admin/academy/page.tsx` | Ajoute `coverImage` nan `Module` interface, ajoute `coverImage` useState, ranplase emoji input ak `ImageUpload`, mete ajou payload |
| `src/pages/admin/academy/[moduleId]/page.tsx` | Ajoute `thumbnail` nan `Lesson` interface, ajoute `thumbnail` useState, ajoute `ImageUpload` nan fòm leson |
| `src/pages/app/formation/page.tsx` | Ajoute `coverImage` nan `Module` interface, chanje affichage h-40 kat modul la |
| `src/pages/app/formation/ModuleLessonsPage.tsx` | Ajoute `coverImage` + `thumbnail` nan interfaces, chanje module header + chak leson w-12 h-12 div |
| `src/test/formation/FormationPage.test.tsx` | Ajoute tests pou `coverImage` display + fallback |
| `src/test/formation/ModuleLessonsPage.test.tsx` | Ajoute tests pou `thumbnail` display + fallback |

---

## Task 1: Admin — Module form (coverImage)

**Files:**
- Modify: `src/pages/admin/academy/page.tsx`

### Objetif
Retire champ emoji, ajoute `ImageUpload` pou `cover_image`, jere valè a via useState.

- [ ] **Step 1.1: Mete ajou `Module` interface** (line 8-16)

Chanje:
```ts
interface Module {
  id: string;
  titre: string;
  description: string;
  icone: string;
  ordre: number;
  actif: boolean;
  lessons: any[];
}
```
Pou:
```ts
interface Module {
  id: string;
  titre: string;
  description: string;
  icone: string;
  coverImage?: string;
  ordre: number;
  actif: boolean;
  lessons: any[];
}
```

- [ ] **Step 1.2: Ajoute import `ImageUpload`**

Anwo fichye a, ajoute import:
```ts
import { ImageUpload } from '../../../components/ui/ImageUpload';
```

- [ ] **Step 1.3: Ajoute `coverImage` state ak `useEffect` pou pre-populate**

Anba `const [editingModule, setEditingModule] = useState<Module | null>(null);` (line ~72), ajoute:
```ts
const [coverImage, setCoverImage] = useState('');
```

Apre `const { addToast } = useToast();` (line ~76), ajoute:
```ts
React.useEffect(() => {
  setCoverImage(editingModule?.coverImage || '');
}, [editingModule]);
```

- [ ] **Step 1.4: Mete ajou `handleSubmit` pou voye `cover_image`**

Chanje `handleSubmit` (line 159-168):
```ts
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  saveModule.mutate({
    titre: formData.get('titre') as string,
    description: formData.get('description') as string,
    cover_image: coverImage || null,
    ordre: Number(formData.get('ordre')),
    actif: formData.get('actif') === 'on'
  });
};
```

Nan `Module` interface pou mutation (`Partial<Module>`), TypeScript ap aksepte `cover_image` kòm string extra — si li plenyen, chanje type mutation nan:
```ts
saveModule.mutate({
  // ...
} as any);
```

- [ ] **Step 1.5: Ranplase emoji input ak `ImageUpload` nan modal la**

Nan fòm modal la (anviwon line 662-740), retire blòk `<div>` ki gen `icone` input la:
```tsx
{/* RETIRE SA: */}
<div>
  <label className="block text-sm font-bold text-txt-2 mb-1">Icône (Emoji)</label>
  <input
    name="icone"
    defaultValue={editingModule?.icone}
    required
    className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-txt focus:outline-none focus:border-loss transition-colors"
    placeholder="Ex: 📈"
  />
</div>
```

Ranplase ak:
```tsx
<div>
  <label className="block text-sm font-bold text-txt-2 mb-1">Image Cover du Module</label>
  <ImageUpload
    value={coverImage}
    onChange={setCoverImage}
  />
</div>
```

Retire tou `className="grid grid-cols-2 gap-4"` wrapper ki te genyen `icone` ak `ordre` ensemble — mete `ordre` seul nan yon `<div>` pou kont li.

- [ ] **Step 1.6: Mete ajou `handleOpenModal`** — retire `setEditingModule` ka kote fòm la reset, useState `coverImage` ap reset via `useEffect` deja.

- [ ] **Step 1.7: Verify TypeScript compile**

```bash
cd /Users/frantzleyadolphe/Documents/btrade/btrade-frontend
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors (oswa sèlman errors ki pa relate ak chanjman sa yo)

- [ ] **Step 1.8: Commit**

```bash
git add src/pages/admin/academy/page.tsx
git commit -m "feat: add coverImage field to admin module form via ImageUpload"
```

---

## Task 2: Admin — Lesson form (thumbnail)

**Files:**
- Modify: `src/pages/admin/academy/[moduleId]/page.tsx`

### Objetif
Ajoute `ImageUpload` pou `thumbnail` leson nan fòm admin la.

- [ ] **Step 2.1: Mete ajou `Lesson` interface** (line 18-25)

Chanje:
```ts
interface Lesson {
  id: string;
  titre: string;
  contenu: string;
  videoUrl?: string;
  ordre: number;
  actif: boolean;
  quizQuestions: Question[];
}
```
Pou:
```ts
interface Lesson {
  id: string;
  titre: string;
  contenu: string;
  videoUrl?: string;
  thumbnail?: string;
  ordre: number;
  actif: boolean;
  quizQuestions: Question[];
}
```

- [ ] **Step 2.2: Ajoute import `ImageUpload`**

```ts
import { ImageUpload } from '../../../../components/ui/ImageUpload';
```

- [ ] **Step 2.3: Ajoute `thumbnail` state ak `useEffect`**

Anba `const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);` (line ~34), ajoute:
```ts
const [thumbnail, setThumbnail] = useState('');
```

Apre imports/hooks, ajoute useEffect:
```ts
React.useEffect(() => {
  setThumbnail(editingLesson?.thumbnail || '');
}, [editingLesson]);
```

- [ ] **Step 2.4: Ajoute `thumbnail` nan saveLesson payload**

Nan fòm `onSubmit` (line ~242-253), ajoute `thumbnail` nan objè ki pase nan `saveLesson.mutate`:
```tsx
saveLesson.mutate({
  module_id: moduleId,
  titre: formData.get('titre') as string,
  contenu: formData.get('contenu') as string,
  video_url: formData.get('video_url') as string,
  thumbnail: thumbnail || null,
  ordre: Number(formData.get('ordre')),
  actif: formData.get('actif') === 'on'
});
```

Si TypeScript plenyen sou `thumbnail` nan type `Partial<Lesson>`, ajoute `as any` oswa enstale type correctly nan mutation `mutationFn`.

- [ ] **Step 2.5: Ajoute `ImageUpload` nan lesson modal form** (anba champ `titre`, avan `video_url`)

Anba blòk `titre` input la (line ~256), ajoute:
```tsx
<div>
  <label className="block text-sm font-bold text-txt-2 mb-1">Thumbnail de la Leçon</label>
  <ImageUpload
    value={thumbnail}
    onChange={setThumbnail}
    className="[&_.aspect-video]:aspect-square [&_.aspect-video]:max-h-[120px]"
  />
</div>
```

**Note:** `ImageUpload` component la gen `aspect-video max-h-[200px]` hardcodé. Pou jwenn format kare, ajoute class override via Tailwind arbitrary variant. Si CSS override pa travay, chanje dirèkteman `ImageUpload` pou aksepte yon prop `aspectClass?: string` (pa rekomande — evite modifye composant shared la si posib).

Altènativ pli senp — si `className` prop pa suffize, ajoute sou wrapper `<div>` ak `max-w-[120px]`:
```tsx
<div className="max-w-[120px]">
  <ImageUpload value={thumbnail} onChange={setThumbnail} />
</div>
```

- [ ] **Step 2.6: Mete ajou `handleOpenModal` pou leson** — asire `setEditingLesson(null)` ak `setEditingLesson(lesson)` toujou rele kòrèkteman (yo deja la). `useEffect` ap reseté `thumbnail` otomatikman.

- [ ] **Step 2.7: Verify TypeScript compile**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors relative ak chanjman sa yo.

- [ ] **Step 2.8: Commit**

```bash
git add src/pages/admin/academy/[moduleId]/page.tsx
git commit -m "feat: add thumbnail field to admin lesson form via ImageUpload"
```

---

## Task 3: User-facing — Formation page (module cards)

**Files:**
- Modify: `src/pages/app/formation/page.tsx`
- Modify: `src/test/formation/FormationPage.test.tsx`

### Objetif
Afiche `coverImage` kòm bannye kat modul la. Si pa gen imaj, garde fallback egzistan.

- [ ] **Step 3.1: Ekri failing test pou coverImage display**

Nan `src/test/formation/FormationPage.test.tsx`, ajoute nouvo `it` blòk anba tès egzistan yo (avan fèmen `describe`):

```ts
it('affiche coverImage comme bannière quand elle est définie', async () => {
  const mockWithImage = {
    data: {
      modules: [
        {
          id: '1',
          slug: 'module-1',
          titre: 'Bases du Trading',
          description: 'Apprendre les bases.',
          ordre: 1,
          icone: '📈',
          coverImage: 'https://example.com/cover.jpg',
          progressionPct: 50,
          certified: false,
          lessonsCount: 3,
          lessonsCompleted: 1,
          prochaineLessonId: 'lesson-1',
        },
      ],
      progressionGlobale: 50,
    },
  };

  vi.mocked(api.get).mockImplementation(async (url) => {
    if (url.includes('/api/settings')) return { data: { data: {} } };
    if (url.includes('/api/formation/modules')) return { data: mockWithImage };
    return { data: {} };
  });

  render(<FormationPage />);

  await waitFor(() => {
    const img = screen.getByRole('img', { name: /bases du trading/i });
    expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
  });
});

it('affiche le fallback (BookOpen) quand coverImage est absent', async () => {
  vi.mocked(api.get).mockImplementation(async (url) => {
    if (url.includes('/api/settings')) return { data: { data: {} } };
    if (url.includes('/api/formation/modules')) return { data: mockFormationData };
    return { data: {} };
  });

  render(<FormationPage />);

  await waitFor(() => {
    expect(screen.getByText('Bases du Trading')).toBeInTheDocument();
  });
  // Aucun img avec alt du module titre
  const imgs = screen.queryAllByRole('img', { name: /bases du trading/i });
  expect(imgs).toHaveLength(0);
});
```

- [ ] **Step 3.2: Run test — verify FAIL**

```bash
npx vitest run src/test/formation/FormationPage.test.tsx 2>&1 | tail -20
```

Expected: FAIL — `getByRole('img', { name: /bases du trading/i })` pa jwenn anyen.

- [ ] **Step 3.3: Mete ajou `Module` interface** (line 11-23) pou ajoute `coverImage?`:

```ts
interface Module {
  id: string;
  slug: string;
  titre: string;
  description: string;
  ordre: number;
  icone: string;
  coverImage?: string;
  progressionPct: number;
  certified: boolean;
  lessonsCount: number;
  lessonsCompleted: number;
  prochaineLessonId: string | null;
}
```

- [ ] **Step 3.4: Chanje affichage kat modul la**

Jwenn blòk `<div className="h-40 flex flex-col items-center justify-center ...">` (line ~353-365) epi ranplase entèyè blòk la ak sa:

```tsx
<div className="h-40 relative border-b border-border/20 overflow-hidden">
  {mod.coverImage ? (
    <>
      <img
        src={mod.coverImage}
        alt={mod.titre}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </>
  ) : (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] flex items-center justify-center">
      <div className="relative flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        <span role="img" aria-label={mod.titre}>
          {mod.icone || '📖'}
        </span>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-125 opacity-40 group-hover:opacity-100 transition-opacity">
          <CircularProgress progress={mod.progressionPct} size={84} strokeWidth={2} progressColor="var(--accent)" trackColor="rgba(255,255,255,0.05)" />
        </div>
      </div>
    </div>
  )}

  {/* CircularProgress overlay pou coverImage case */}
  {mod.coverImage && (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
      <CircularProgress progress={mod.progressionPct} size={84} strokeWidth={2} progressColor="var(--accent)" trackColor="rgba(255,255,255,0.2)" />
    </div>
  )}

  {isCompleted && (
    <div className="absolute top-4 right-4 bg-win/20 text-win border border-win/30 rounded-full p-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-scale-in" title="Module complété">
      <CheckCircle size={14} />
    </div>
  )}
</div>
```

- [ ] **Step 3.5: Run test — verify PASS**

```bash
npx vitest run src/test/formation/FormationPage.test.tsx 2>&1 | tail -20
```

Expected: PASS — tout tests pase.

- [ ] **Step 3.6: Commit**

```bash
git add src/pages/app/formation/page.tsx src/test/formation/FormationPage.test.tsx
git commit -m "feat: display module coverImage as card banner on formation page"
```

---

## Task 4: User-facing — ModuleLessonsPage (module header + lesson thumbnails)

**Files:**
- Modify: `src/pages/app/formation/ModuleLessonsPage.tsx`
- Modify: `src/test/formation/ModuleLessonsPage.test.tsx`

### Objetif
Afiche `coverImage` nan module header, afiche `thumbnail` pou chak leson nan lis la.

- [ ] **Step 4.1: Ekri failing tests**

Nan `src/test/formation/ModuleLessonsPage.test.tsx`, ajoute yon `describe` blòk separe apre tès egzistan yo:

```ts
describe('ModuleLessonsPage — coverImage & thumbnails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche coverImage dans le header du module quand définie', async () => {
    const mockWithCoverImage = {
      data: {
        module: {
          id: '1',
          slug: 'price-action',
          titre: 'Maitriser le Price Action',
          description: 'Test description',
          ordre: 1,
          icone: '📈',
          coverImage: 'https://example.com/module-cover.jpg',
        },
        lessons: [],
      },
    };

    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/lessons')) return { data: mockWithCoverImage };
      return { data: {} };
    });

    render(<ModuleLessonsPage />);

    await waitFor(() => {
      const img = screen.getByRole('img', { name: /maitriser le price action/i });
      expect(img).toHaveAttribute('src', 'https://example.com/module-cover.jpg');
    });
  });

  it('affiche le thumbnail de leçon quand défini', async () => {
    const mockWithThumbnail = {
      data: {
        module: {
          id: '1',
          slug: 'price-action',
          titre: 'Maitriser le Price Action',
          description: 'Test',
          ordre: 1,
          icone: '📈',
        },
        lessons: [
          {
            id: 'lesson-1',
            titre: 'Introduction au Price Action',
            ordre: 1,
            thumbnail: 'https://example.com/lesson-thumb.jpg',
            statut: 'available',
            lecture_done: false,
            quiz_passed: false,
            devoir_done: false,
          },
        ],
      },
    };

    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/lessons')) return { data: mockWithThumbnail };
      return { data: {} };
    });

    render(<ModuleLessonsPage />);

    await waitFor(() => {
      const img = screen.getByRole('img', { name: /introduction au price action/i });
      expect(img).toHaveAttribute('src', 'https://example.com/lesson-thumb.jpg');
    });
  });

  it('affiche le badge numéro quand thumbnail est absent', async () => {
    const mockNoThumbnail = {
      data: {
        module: {
          id: '1',
          slug: 'price-action',
          titre: 'Maitriser le Price Action',
          description: 'Test',
          ordre: 1,
          icone: '📈',
        },
        lessons: [
          {
            id: 'lesson-1',
            titre: 'Introduction au Price Action',
            ordre: 1,
            statut: 'available',
            lecture_done: false,
            quiz_passed: false,
            devoir_done: false,
          },
        ],
      },
    };

    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/lessons')) return { data: mockNoThumbnail };
      return { data: {} };
    });

    render(<ModuleLessonsPage />);

    await waitFor(() => {
      // Badge nimewo "1" dwe afiche (san thumbnail)
      expect(screen.getByText('1')).toBeInTheDocument();
    });
    // Pa gen img pou leson an
    const imgs = screen.queryAllByRole('img', { name: /introduction au price action/i });
    expect(imgs).toHaveLength(0);
  });
});
```

- [ ] **Step 4.2: Run tests — verify FAIL**

```bash
npx vitest run src/test/formation/ModuleLessonsPage.test.tsx 2>&1 | tail -25
```

Expected: 3 nouveaux tests FAIL.

- [ ] **Step 4.3: Mete ajou interfaces nan `ModuleLessonsPage.tsx`**

Chanje `ModuleInfo` interface (line 8-15) pou ajoute `coverImage?`:
```ts
interface ModuleInfo {
  id: string;
  slug: string;
  titre: string;
  description: string;
  ordre: number;
  icone: string;
  coverImage?: string;
}
```

Chanje `LessonListItem` interface (line 17-25) pou ajoute `thumbnail?`:
```ts
interface LessonListItem {
  id: string;
  titre: string;
  ordre: number;
  thumbnail?: string;
  statut: 'locked' | 'available' | 'in_progress' | 'completed';
  lecture_done: boolean;
  quiz_passed: boolean;
  devoir_done: boolean;
}
```

- [ ] **Step 4.4: Chanje module header** (line ~87-90)

Jwenn div `w-20 h-20 rounded-[2rem]` ki genyen emoji a, chanje konsa:

```tsx
<div className="relative w-20 h-20 rounded-[2rem] bg-accent/10 border border-accent/20 flex items-center justify-center text-5xl shrink-0 shadow-[0_0_30px_rgba(243,108,0,0.2)] overflow-hidden">
  <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
  {module.coverImage ? (
    <img
      src={module.coverImage}
      alt={module.titre}
      className="w-full h-full object-cover relative z-10 rounded-[2rem]"
    />
  ) : (
    <span className="relative z-10 drop-shadow-md">{module.icone || '📖'}</span>
  )}
</div>
```

- [ ] **Step 4.5: Chanje each lesson badge (w-12 h-12 div)** (line ~147-165)

Jwenn blòk `<div className={... w-12 h-12 rounded-2xl ...}>` ki afiche Lock/CheckCircle/nimewo, chanje konsa:

```tsx
<div className={`
  w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold font-mono text-sm transition-colors duration-300 overflow-hidden
  ${isLocked
    ? 'bg-white/5 text-txt-3'
    : isCompleted
      ? 'bg-win/10 text-win shadow-[0_0_15px_rgba(16,185,129,0.2)]'
      : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white shadow-[0_0_15px_rgba(243,108,0,0.2)]'
  }
`}>
  {lesson.thumbnail && !isLocked ? (
    <img
      src={lesson.thumbnail}
      alt={lesson.titre}
      className="w-full h-full object-cover rounded-2xl"
    />
  ) : isLocked ? (
    <Lock size={16} />
  ) : isCompleted ? (
    <CheckCircle size={20} />
  ) : (
    <span>{lesson.ordre}</span>
  )}
</div>
```

**Note:** Ajoute `overflow-hidden` sou div parent la pou imaj pa depase bò won yo.

- [ ] **Step 4.6: Run tests — verify PASS**

```bash
npx vitest run src/test/formation/ModuleLessonsPage.test.tsx 2>&1 | tail -25
```

Expected: Tout tests PASS.

- [ ] **Step 4.7: Run all tests pou verify pa gen regression**

```bash
npx vitest run 2>&1 | tail -15
```

Expected: Tout tests suite PASS.

- [ ] **Step 4.8: Commit**

```bash
git add src/pages/app/formation/ModuleLessonsPage.tsx src/test/formation/ModuleLessonsPage.test.tsx
git commit -m "feat: display module coverImage and lesson thumbnails on user-facing pages"
```

---

## Final Verification

- [ ] **Verify TypeScript compile final**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors.

- [ ] **Run complete test suite**

```bash
npx vitest run 2>&1 | tail -10
```

Expected: All tests pass.

- [ ] **Verify manyèlman** (si serveur disponib)
  - Ouvri admin → Gestion Academy → Klike "Nouveau Module" → Verify `ImageUpload` parèt nan plas emoji
  - Klike edit sou yon modul egzistan → Verify `coverImage` pre-populate kòrèkteman
  - Ale nan admin lesson form → Verify thumbnail `ImageUpload` parèt anba champ titre
  - Ale sou `/app/formation` → Verify kat modul yo afiche cover image oswa fallback gradient
  - Ale sou yon modul → Verify module header + leson thumbnails afiche kòrèkteman
