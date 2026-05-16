import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import { ToastContainer } from '../ui/Toast';
import { ShieldAlert } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, location.pathname]);

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

  if (user?.role !== 'admin') {
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
          <a href="/app/dashboard" className="btn-primary inline-flex">
            Retour à l'application
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg text-txt">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
