import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { HeroPane } from '../components/auth/HeroPane';
import { useSettings } from '../contexts/SettingsContext';
import api from '../lib/api';

const LoginPage: React.FC<{ defaultRegister?: boolean }> = ({ defaultRegister = false }) => {
  const { isAuthenticated, isLoading, refreshUser, user } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryPlan = params.get('plan');
  const [isRegister, setIsRegister] = React.useState(defaultRegister || queryPlan !== null);

  React.useEffect(() => {
    // Si on a un token mais pas de données user, on refresh
    if (isAuthenticated && !user && isLoading) {
      refreshUser();
    }

    if (isAuthenticated && !isLoading && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      // Reprise du checkout si un plan payant attendait
      const pending =
        queryPlan ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('btt_pending_plan') : null);
      if (pending && pending !== 'free' && user.plan !== pending) {
        try { sessionStorage.removeItem('btt_pending_plan'); } catch {}
        (async () => {
          try {
            const res = await api.post('/api/billing/create-checkout-session', { planId: pending });
            if (res.data?.url) {
              window.location.href = res.data.url;
              return;
            }
          } catch (err) {
            console.error('Reprise checkout impossible:', err);
          }
          navigate('/app/dashboard', { replace: true });
        })();
        return;
      }

      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user, refreshUser, queryPlan]);

  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex overflow-hidden">
      <HeroPane />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          {settings?.platform_logo ? (
            <img src={settings.platform_logo} alt="Logo Behind The Trade" className="h-8 w-auto object-contain" />
          ) : (
            <>
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                 <span className="font-black text-white">B</span>
              </div>
              <span className="font-black text-xl tracking-tighter">Behind The Trade</span>
            </>
          )}
        </div>

        {isRegister ? (
          <RegisterForm onSwitchToLogin={() => setIsRegister(false)} />
        ) : (
          <LoginForm onSwitchToRegister={() => setIsRegister(true)} />
        )}

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-txt-3 font-bold uppercase tracking-[0.2em] mb-4">
            Secured by AES-256 Encryption
          </p>
          <div className="flex gap-4 justify-center grayscale opacity-30">
             <div className="w-8 h-4 bg-white/20 rounded" />
             <div className="w-8 h-4 bg-white/20 rounded" />
             <div className="w-8 h-4 bg-white/20 rounded" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
