# Delete User Confirm Modal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le `window.confirm` natif par un modal animé avec Lottie lors de la suppression d'un utilisateur dans l'admin.

**Architecture:** Créer un composant `DeleteConfirmModal` réutilisable dans `src/components/admin/`, qui suit exactement le pattern des modaux existants (`EditPlanModal`, `InviteStaffModal`). Le composant utilise `lottie-react` pour l'animation warning et `framer-motion` via le `Modal` UI existant pour les transitions entrée/sortie. `AdminUsersPage` remplace son `window.confirm` par l'ouverture de ce modal.

**Tech Stack:** React, TypeScript, `lottie-react` v2.4.1, `framer-motion` v11, Vitest, @testing-library/react

---

## File Map

| Action | Fichier | Rôle |
|--------|---------|------|
| Create | `src/components/admin/DeleteConfirmModal.tsx` | Modal de confirmation de suppression avec Lottie |
| Modify | `src/pages/admin/users/page.tsx` | Remplace `window.confirm` par le nouveau modal |
| Create | `src/test/admin/DeleteConfirmModal.test.tsx` | Tests du composant |

---

### Task 1: Créer le composant `DeleteConfirmModal`

**Files:**
- Create: `src/components/admin/DeleteConfirmModal.tsx`

- [ ] **Step 1: Créer le fichier avec le composant complet**

```tsx
import React from 'react';
import Lottie from 'lottie-react';
import { Modal } from '../ui/Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  userEmail: string;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userEmail,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmer la suppression"
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn-ghost"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 bg-loss text-white font-bold rounded-xl hover:bg-loss/90 transition-colors disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Suppression...' : 'Supprimer définitivement'}
          </button>
        </div>
      }
    >
      <div className="space-y-5 text-center">
        <div className="w-32 h-32 mx-auto">
          <Lottie
            path="https://assets2.lottiefiles.com/packages/lf20_jvysiwkn.json"
            loop={false}
            autoplay
          />
        </div>

        <div className="space-y-1">
          <p className="text-txt font-bold text-base">
            Supprimer <span className="text-loss">{userName || userEmail}</span> ?
          </p>
          <p className="text-xs text-txt-2">{userEmail}</p>
        </div>

        <div className="p-3 rounded-xl bg-loss/5 border border-loss/20 text-xs text-txt-2 text-left">
          <span className="text-loss font-bold block mb-1">Action irréversible</span>
          Toutes les données de cet utilisateur seront supprimées définitivement : comptes de trading, trades, progression academy, etc.
        </div>
      </div>
    </Modal>
  );
};
```

> **Note:** Si l'URL Lottie ne charge pas, remplacer par n'importe quelle animation "warning" ou "delete" trouvée sur lottiefiles.com en utilisant le bouton "Get URL" de l'animation.

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/DeleteConfirmModal.tsx
git commit -m "feat: add DeleteConfirmModal component with Lottie animation"
```

---

### Task 2: Mettre à jour `AdminUsersPage`

**Files:**
- Modify: `src/pages/admin/users/page.tsx`

- [ ] **Step 1: Ajouter l'import du nouveau composant et les états**

Ajouter en haut du fichier, après les imports existants :

```tsx
import { DeleteConfirmModal } from '../../../components/admin/DeleteConfirmModal';
```

Ajouter ces deux états dans le composant, après les états existants (ligne ~21) :

```tsx
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [userToDelete, setUserToDelete] = useState<any>(null);
```

- [ ] **Step 2: Remplacer `handleDeleteUser` par deux fonctions**

Remplacer la fonction `handleDeleteUser` existante (lignes 48-61) par :

```tsx
const openDeleteModal = (user: any) => {
  setUserToDelete(user);
  setIsDeleteModalOpen(true);
  setOpenMenuId(null);
};

const handleDeleteUser = async () => {
  if (!userToDelete) return;
  try {
    await api.delete(`/api/admin/users/${userToDelete.id}`);
    addToast('Utilisateur supprimé avec succès.', 'success');
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    fetchUsers();
  } catch (err: any) {
    addToast(err.response?.data?.error || 'Erreur lors de la suppression de l\'utilisateur.', 'error');
  }
};
```

- [ ] **Step 3: Mettre à jour l'appel dans le dropdown**

Dans le JSX, remplacer :
```tsx
onClick={() => handleDeleteUser(user.id)}
```
par :
```tsx
onClick={() => openDeleteModal(user)}
```

- [ ] **Step 4: Ajouter le modal dans le JSX**

Après `</EditPlanModal>` (juste avant la fermeture `</div>` finale), ajouter :

```tsx
<DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  onClose={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
  onConfirm={handleDeleteUser}
  userName={userToDelete?.fullName || ''}
  userEmail={userToDelete?.email || ''}
/>
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/users/page.tsx
git commit -m "feat: replace window.confirm with DeleteConfirmModal in admin users page"
```

---

### Task 3: Tests du composant `DeleteConfirmModal`

**Files:**
- Create: `src/test/admin/DeleteConfirmModal.test.tsx`

- [ ] **Step 1: Créer le fichier de test**

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeleteConfirmModal } from '../../components/admin/DeleteConfirmModal';

// Mock lottie-react pour éviter les erreurs de fetch dans les tests
vi.mock('lottie-react', () => ({
  default: () => <div data-testid="lottie-animation" />,
}));

// Mock createPortal pour que le modal s'affiche dans le DOM de test
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    createPortal: (node: React.ReactNode) => node,
  };
});

describe('DeleteConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    userName: 'Jean Dupont',
    userEmail: 'jean@example.com',
  };

  it('affiche le nom et email de l\'utilisateur', () => {
    render(<DeleteConfirmModal {...defaultProps} />);
    expect(screen.getByText(/Jean Dupont/i)).toBeInTheDocument();
    expect(screen.getByText('jean@example.com')).toBeInTheDocument();
  });

  it('appelle onConfirm au clic sur "Supprimer définitivement"', () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText(/Supprimer définitivement/i));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('appelle onClose au clic sur "Annuler"', () => {
    const onClose = vi.fn();
    render(<DeleteConfirmModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('désactive les boutons quand isLoading est true', () => {
    render(<DeleteConfirmModal {...defaultProps} isLoading={true} />);
    expect(screen.getByText('Suppression...')).toBeDisabled();
    expect(screen.getByText('Annuler')).toBeDisabled();
  });

  it('n\'affiche rien quand isOpen est false', () => {
    render(<DeleteConfirmModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/Jean Dupont/i)).not.toBeInTheDocument();
  });

  it('utilise l\'email si userName est vide', () => {
    render(<DeleteConfirmModal {...defaultProps} userName="" />);
    expect(screen.getByText(/jean@example.com/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Lancer les tests**

```bash
cd /Users/frantzleyadolphe/Documents/btrade/btrade-frontend
npm test -- src/test/admin/DeleteConfirmModal.test.tsx
```

Expected: 6 tests passent en vert.

- [ ] **Step 3: Commit**

```bash
git add src/test/admin/DeleteConfirmModal.test.tsx
git commit -m "test: add unit tests for DeleteConfirmModal"
```
