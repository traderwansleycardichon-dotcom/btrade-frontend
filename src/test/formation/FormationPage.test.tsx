import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import FormationPage from '../../pages/app/formation/page';
import api from '../../lib/api';
import userEvent from '@testing-library/user-event';

// Mock de l'API
vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock du hook usePlan pour contourner la FeatureGate
vi.mock('../../hooks/usePlan', () => ({
  usePlan: () => ({
    canUse: () => true, // Accès Pro accordé pour le test
  }),
}));

const mockFormationData = {
  data: {
    modules: [
      {
        id: '1',
        slug: 'module-1',
        titre: 'Bases du Trading',
        description: 'Apprendre les bases.',
        ordre: 1,
        icone: '📈',
        progressionPct: 50,
        certified: false,
        lessonsCount: 3,
        lessonsCompleted: 1,
        prochaineLessonId: 'lesson-1',
      },
      {
        id: '2',
        slug: 'module-2',
        titre: 'Price Action',
        description: 'Comprendre les chandeliers.',
        ordre: 2,
        icone: '🕯️',
        progressionPct: 100,
        certified: true,
        lessonsCount: 4,
        lessonsCompleted: 4,
        prochaineLessonId: null,
      },
    ],
    progressionGlobale: 75,
  },
};

describe('FormationPage (Academy)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche le loader pendant le chargement des modules', () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      // Promesse qui ne se résout jamais
      return new Promise(() => {});
    });
    
    render(<FormationPage />);
    expect(screen.getByText("Chargement de l'Academy...")).toBeInTheDocument();
  });

  it('affiche la liste des modules une fois chargés', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: mockFormationData };
    });
    
    render(<FormationPage />);

    // Attendre que le composant de base s'affiche
    await screen.findByText(/BTrade Academy/i);
    screen.debug();

    // Vérifie que les modules sont affichés
    expect(screen.getAllByText(/Bases du Trading/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Price Action/i).length).toBeGreaterThan(0);

    // Vérifie les stats globales (certification)
    expect(screen.getAllByText(/1 \/ 2 Certifiés/i).length).toBeGreaterThan(0);
  });

  it('permet de filtrer les modules via la barre de recherche', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      return { data: mockFormationData };
    });
    const user = userEvent.setup();

    render(<FormationPage />);

    await screen.findAllByText(/Price Action/i);

    const searchInput = screen.getByPlaceholderText('Rechercher un cours...');

    // Tape 'bases' dans la barre de recherche
    await user.type(searchInput, 'bases');

    // 'Bases du Trading' devrait être là, mais 'Price Action' devrait disparaître
    expect(screen.getAllByText(/Bases du Trading/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/Price Action/i).length).toBe(0);
  });

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
      // Cherche spécifiquement un <img> element (pas un <span role="img">)
      const img = document.querySelector('img[alt="Bases du Trading"]');
      expect(img).toBeTruthy();
      expect(img).toHaveAttribute('src', 'https://example.com/cover.jpg');
    });
  });

  it('affiche le fallback emoji quand coverImage est absent', async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url.includes('/api/settings')) return { data: { data: {} } };
      if (url.includes('/api/formation/modules')) return { data: mockFormationData };
      return { data: {} };
    });

    render(<FormationPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Bases du Trading/i).length).toBeGreaterThan(0);
    });
    // Vérifie qu'aucun <img> element (pas span) n'est rendu pour le module
    const imgElements = document.querySelectorAll('img[alt="Bases du Trading"]');
    expect(imgElements).toHaveLength(0);
  });
});
