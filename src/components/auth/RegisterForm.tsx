import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  initialPlan?: string | null;
  initialGateway?: string | null;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, initialPlan, initialGateway }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    plan: initialPlan || 'free',
    gateway: initialGateway || 'stripe'
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/register', formData);
      
      // Si l'API retourne un checkoutUrl, cela signifie que c'est une inscription payante en attente.
      // On redirige immédiatement vers la passerelle de paiement (Moncash ou Stripe).
      if (data.checkoutUrl) {
        addToast('Redirection vers le paiement...', 'success');
        window.location.href = data.checkoutUrl;
        return;
      }

      // Inscription gratuite ou sans paiement requis
      addToast('Inscription réussie !');
      login(data.data.accessToken, data.data.refreshToken, data.data.user);
    } catch (err: any) {
      addToast(err.response?.data?.error || "Erreur lors de l'inscription", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center">
        <h2 className="text-3xl font-black mb-2 tracking-tight">Créer un compte</h2>
        <p className="text-txt-2 text-sm">Rejoignez la communauté Behind The Trade dès aujourd'hui.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3 group-focus-within:text-accent transition-colors" size={20} />
            <input 
              type="text" 
              required
              placeholder="Nom complet" 
              className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all text-sm"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3 group-focus-within:text-accent transition-colors" size={20} />
            <input 
              type="email" 
              required
              placeholder="Email professionnel" 
              className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all text-sm"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3 group-focus-within:text-accent transition-colors" size={20} />
            <input 
              type="password" 
              required
              placeholder="Mot de passe" 
              className="w-full bg-surface border border-border rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all text-sm"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-start gap-3">
          <div className="mt-0.5">
            <ShieldCheck size={16} className="text-accent" />
          </div>
          <p className="text-[10px] text-txt-2 leading-relaxed">
            En créant un compte, vous acceptez nos <Link to="/legal/terms" className="text-accent font-bold cursor-pointer hover:underline">Conditions d'Utilisation</Link> et notre <Link to="/legal/privacy" className="text-accent font-bold cursor-pointer hover:underline">Politique de Confidentialité</Link>.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-2 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(243,108,0,0.2)] flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Commencer maintenant
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="text-center">
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm font-bold text-txt-2 hover:text-accent transition-colors"
          >
            Déjà un compte ? <span className="text-accent">Connectez-vous</span>
          </button>
        </div>
      </form>
    </div>
  );
};
