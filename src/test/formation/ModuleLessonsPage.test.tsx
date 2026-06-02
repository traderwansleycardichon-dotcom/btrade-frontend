import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import ModuleLessonsPage from '../../pages/app/formation/ModuleLessonsPage';
import api from '../../lib/api';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: 'price-action' }),
    useNavigate: () => vi.fn(),
  };
});

// Mock de l'API
vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock du hook usePlan pour contourner la FeatureGate
vi.mock('../../hooks/usePlan', () => ({
  usePlan: () => ({
    canUse: () => true,
  }),
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
        statut: 'completed',
        lecture_done: true,
        quiz_passed: true,
        devoir_done: true,
      },
      {
        id: 'lesson-2',
        titre: 'Les Chandeliers Japonais',
        ordre: 2,
        statut: 'in_progress',
        lecture_done: true,
        quiz_passed: false,
        devoir_done: false,
      },
      {
        id: 'lesson-3',
        titre: 'Figures Chartistes',
        ordre: 3,
        statut: 'locked',
        lecture_done: false,
        quiz_passed: false,
        devoir_done: false,
      },
    ],
  },
};

describe('ModuleLessonsPage (Academy)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche les détails du module et ses leçons', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/lessons')) return { data: mockModuleData };
      return { data: {} };
    });
    
    render(<ModuleLessonsPage />);

    // Attendre le header du module
    await waitFor(() => {
      expect(screen.getByText('Maitriser le Price Action')).toBeInTheDocument();
    });

    // Vérifier les leçons
    expect(screen.getByText('Introduction au Price Action')).toBeInTheDocument();
    expect(screen.getByText('Les Chandeliers Japonais')).toBeInTheDocument();
    expect(screen.getByText('Figures Chartistes')).toBeInTheDocument();

    // Vérifier l'état "Verrouillé"
    expect(screen.getByText('Verrouillé')).toBeInTheDocument();
    
    // Vérifier l'état "Complété"
    expect(screen.getByText('Complété')).toBeInTheDocument();
  });

  it('affiche un message derreur si le module nexiste pas', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return Promise.reject(new Error('Not found'));
    });

    render(<ModuleLessonsPage />);

    await waitFor(() => {
      expect(screen.getByText('Module introuvable')).toBeInTheDocument();
    });
  });
});

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
      const img = document.querySelector('img[alt="Maitriser le Price Action"]');
      expect(img).toBeTruthy();
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
      const img = document.querySelector('img[alt="Introduction au Price Action"]');
      expect(img).toBeTruthy();
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
      expect(screen.getByText('1')).toBeInTheDocument();
    });
    const imgElements = document.querySelectorAll('img[alt="Introduction au Price Action"]');
    expect(imgElements).toHaveLength(0);
  });
});
