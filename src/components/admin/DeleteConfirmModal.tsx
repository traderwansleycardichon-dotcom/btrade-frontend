import React from 'react';
import Lottie from 'lottie-react';
import { Modal } from '../ui/Modal';
import warningAnimation from '../../assets/animations/warning.json';

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
      preventClose={isLoading}
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
            animationData={warningAnimation}
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
