import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';

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
    expect(screen.getAllByText('jean@example.com').length).toBeGreaterThan(0);
  });
});
