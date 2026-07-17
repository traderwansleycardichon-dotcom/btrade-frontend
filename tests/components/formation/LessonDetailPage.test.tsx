import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import LessonDetailPage from '@/pages/app/formation/LessonDetailPage';
import api from '@/lib/api';
import userEvent from '@testing-library/user-event';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: 'price-action', lessonId: 'lesson-1' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/hooks/usePlan', () => ({
  usePlan: () => ({ canUse: () => true }),
}));

const mockModuleData = {
  data: {
    module: {
      id: '1',
      slug: 'price-action',
      titre: 'Maitriser le Price Action',
      description: 'Test description',
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
      {
        id: 'lesson-2',
        titre: 'Les Chandeliers Japonais',
        ordre: 2,
        statut: 'locked',
        lecture_done: false,
        quiz_passed: false,
        devoir_done: false,
      },
    ],
  },
};

const mockLessonData = {
  data: {
    id: 'lesson-1',
    titre: 'Introduction au Price Action',
    contenu: '# Bienvenue\nCeci est le contenu de la leçon. Il est très important de lire ce contenu.',
    ordre: 1,
    moduleId: '1',
  },
};

const mockQuizData = {
  data: [
    {
      id: 'q1',
      question: 'Qu\'est-ce que le price action ?',
      options: ['Une option', 'L\'action du prix', 'Rien'],
      ordre: 1,
    },
  ],
};

describe('LessonDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setupApiMocks = () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/quiz')) return { data: mockQuizData };
      if (url.includes('/lessons/lesson-1')) return { data: mockLessonData };
      if (url.includes('/lessons')) return { data: mockModuleData };
      return { data: {} };
    });
  };

  it('affiche le contenu de la leçon (lecture)', async () => {
    setupApiMocks();
    render(<LessonDetailPage />);

    await screen.findAllByText('Introduction au Price Action');
    expect(screen.getByText('Bienvenue')).toBeInTheDocument();
    expect(screen.getByText(/Ceci est le contenu/i)).toBeInTheDocument();
    
    // Vérifier l'onglet actif
    expect(screen.getByText(/1. Lecture/i)).toBeInTheDocument();
  });

  it('permet de marquer la leçon comme lue et de passer au quiz', async () => {
    setupApiMocks();
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } });
    
    const user = userEvent.setup();
    render(<LessonDetailPage />);

    await screen.findAllByText('Introduction au Price Action');

    const marquerLuBtn = screen.getByText(/Marquer comme lu/i);
    await user.click(marquerLuBtn);

    expect(api.post).toHaveBeenCalledWith('/api/formation/lessons/lesson-1/lecture-done');
  });

  it('affiche un message derreur si la leçon est introuvable ou bloquée', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/lessons/lesson-1')) return Promise.reject(new Error('Access denied'));
      if (url.includes('/lessons')) return { data: mockModuleData };
      return { data: {} };
    });

    render(<LessonDetailPage />);

    await screen.findByText(/Accès refusé/i);
    expect(screen.getByText(/Veuillez compléter/i)).toBeInTheDocument();
  });
});
