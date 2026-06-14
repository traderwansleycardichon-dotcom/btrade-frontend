import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import { ToastContainer } from '../ui/Toast';
import { UnreadMessagePopup } from '../messaging/UnreadMessagePopup';
import { ShieldAlert, Menu, Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../../context/SoundContext';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth();
  const { muted, toggleMute } = useSound();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-loss border-t-transparent rounded-full animate-spin" />
          <span className="text-txt-2 font-medium animate-pulse">Vérification des accès administrateur...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!['admin', 'cto'].includes(user?.role || '')) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full glass p-8 rounded-3xl text-center border-loss/20">
          <div className="w-16 h-16 rounded-full bg-loss/10 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} className="text-loss" />
          </div>
          <h1 className="text-2xl font-black mb-2">Accès Refusé</h1>
          <p className="text-txt-2 mb-8">
            Vous ne disposez pas des privilèges nécessaires pour accéder au tableau de bord administrateur.
          </p>
          <Link to="/app/dashboard" className="btn-primary inline-flex">
            Retour à l'application
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg text-txt dashboard-view">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header for Admin */}
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-xl lg:hidden flex items-center px-4 sticky top-0 z-50">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-txt-2 hover:bg-elevated rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="ml-4 font-bold flex-1">Admin Panel</span>
          <button
            onClick={toggleMute}
            className="p-2 text-txt-2 hover:bg-elevated rounded-lg transition-colors"
            title={muted ? 'Activer le son' : 'Désactiver le son'}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
      <UnreadMessagePopup />
    </div>
  );
};
