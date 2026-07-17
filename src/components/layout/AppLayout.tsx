import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '../../hooks/useAuth';
import { ToastContainer } from '../ui/Toast';
import { UnreadMessagePopup } from '../messaging/UnreadMessagePopup';
import { Lock, CreditCard, LogOut } from 'lucide-react';
import { TodoSummaryModal } from '../todo/TodoSummaryModal';
import { PhoneModal } from '../modals/PhoneModal';
import { PendingContractModal } from '../modals/PendingContractModal';
import SystemUpdatesModal from '../modals/SystemUpdatesModal';

export const AppLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, refreshUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Ferme le drawer mobile à chaque changement de page
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Affiche le modal téléphone si l'utilisateur n'en a pas
  useEffect(() => {
    if (user && !user.phone) {
      setIsPhoneModalOpen(true);
    }
  }, [user?.id, user?.phone]);

  // Empêche le scroll body quand le drawer est ouvert sur mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-txt-2 font-medium animate-pulse">Initialisation de votre dashboard...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle Locked State
  if (user?.plan === 'locked' && location.pathname !== '/app/upgrade') {
    return (
      <div className="min-h-screen bg-bg text-txt flex items-center justify-center p-4">
        <div className="glass w-full max-w-lg p-10 rounded-[3rem] border-loss/30 bg-loss/5 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-loss/20 text-loss rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-black mb-4">Accès Verrouillé</h1>
          <p className="text-txt-2 mb-8 text-lg">
            Votre abonnement PRO a expiré ou le paiement a échoué. <br className="hidden sm:block" />
            Il n'est pas possible de repasser automatiquement au plan FREE. Vous devez régulariser votre paiement pour continuer à utiliser la plateforme.
          </p>
          <div className="flex flex-col w-full gap-4">
            <button 
              onClick={() => navigate('/app/upgrade')}
              className="w-full py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition-all text-lg shadow-lg shadow-accent/20"
            >
              <CreditCard size={20} />
              Payer maintenant
            </button>
            <button 
              onClick={logout}
              className="w-full py-4 bg-transparent border border-border text-txt rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-elevated transition-all"
            >
              <LogOut size={20} />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const isFreeTrial = user?.plan === 'free' && user?.trialEnd;
  const daysRemaining = isFreeTrial ? getDaysRemaining(user.trialEnd) : 0;

  return (
    <div className="flex min-h-screen bg-bg text-txt relative dashboard-view">
      <TodoSummaryModal />
      <PendingContractModal />
      
      {/* Sidebar — drawer mobile + fixe desktop */}
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {isFreeTrial && (
          <div className="bg-accent text-white px-4 py-2 flex items-center justify-between text-sm shadow-md z-50">
            <div className="flex items-center gap-2">
              <span className="font-bold">Période d'essai :</span>
              <span>Il vous reste {daysRemaining} jour{daysRemaining !== 1 ? 's' : ''}. Passez au plan PRO pour ne pas perdre l'accès.</span>
            </div>
            <button 
              onClick={() => navigate('/app/upgrade')}
              className="px-3 py-1 bg-white text-accent font-bold rounded-lg hover:bg-white/90 transition-colors text-xs"
            >
              Passer PRO
            </button>
          </div>
        )}
        <TopBar onOpenMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 p-3 sm:p-5 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
      <UnreadMessagePopup />
      {isPhoneModalOpen && (
        <PhoneModal onClose={() => setIsPhoneModalOpen(false)} />
      )}
      <SystemUpdatesModal />
    </div>
  );
};
