import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Chrome } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      const { accessToken, refreshToken, user } = data.data;
      
      login(accessToken, refreshToken, user);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-[slideUp_0.6s_ease-out_forwards]">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Bon retour !</h2>
        <p className="text-txt-2">Connectez-vous pour suivre vos performances.</p>
      </div>

      <div className="space-y-4 mb-8">
        <button className="w-full py-3 px-4 rounded-xl border border-border bg-surface hover:bg-elevated flex items-center justify-center gap-3 font-bold transition-all group">
          <Chrome size={20} className="text-txt-2 group-hover:text-txt transition-colors" />
          Continuer avec Google
        </button>
        <button className="w-full py-3 px-4 rounded-xl border border-border bg-surface hover:bg-elevated flex items-center justify-center gap-3 font-bold transition-all group">
          <span className="text-lg"></span>
          Continuer avec Apple
        </button>
      </div>

      <div className="relative mb-8 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <span className="relative px-4 bg-bg text-txt-3 text-xs font-bold uppercase tracking-widest">ou</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2 ml-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all"
            placeholder="nom@exemple.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="text-xs font-bold text-txt-2 uppercase tracking-widest">Mot de passe</label>
            <Link to="/forgot-password" size="sm" className="text-xs font-bold text-accent hover:text-accent-2 transition-colors">Oublié ?</Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-3 px-4 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all pr-12"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-2 hover:text-txt transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-loss/10 border border-loss/20 text-loss text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-accent hover:bg-accent-2 disabled:bg-accent/50 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(243,108,0,0.2)] flex items-center justify-center gap-2 group"
        >
          {loading ? 'Connexion...' : (
            <>
              Se connecter
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-center text-sm text-txt-2 pt-4">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-accent font-bold hover:text-accent-2 transition-colors">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
};
