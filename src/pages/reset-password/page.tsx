import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const { settings } = useSettings();

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/auth/reset-password', { token, newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          {settings?.platform_logo ? (
            <img src={settings.platform_logo} alt="Haitian Wall Street" className="h-10 w-auto object-contain" />
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shadow-lg">
                <span className="font-black text-white text-lg">B</span>
              </div>
              <span className="font-black text-xl tracking-tight">Behind The Trade</span>
            </div>
          )}
        </div>

        <div className="glass rounded-3xl border border-border p-8">
          {!token ? (
            <div className="text-center py-4">
              <AlertTriangle size={40} className="text-loss mx-auto mb-4" />
              <h2 className="text-xl font-black mb-2">Lien invalide</h2>
              <p className="text-txt-2 text-sm mb-6">Ce lien de réinitialisation est manquant ou corrompu.</p>
              <Link to="/forgot-password" className="text-accent font-bold text-sm hover:text-accent-2 transition-colors">
                Demander un nouveau lien
              </Link>
            </div>
          ) : done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-win/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-win" />
              </div>
              <h2 className="text-2xl font-black mb-3">Mot de passe modifié !</h2>
              <p className="text-txt-2 text-sm mb-2">
                Votre mot de passe a été réinitialisé avec succès.
              </p>
              <p className="text-txt-3 text-xs">Redirection vers la connexion dans 3 secondes...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black mb-2">Nouveau mot de passe</h2>
                <p className="text-txt-2 text-sm">Choisissez un mot de passe sécurisé d'au moins 8 caractères.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={18} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="8 caractères minimum"
                      className="w-full bg-elevated border border-border rounded-xl py-3 pl-11 pr-12 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-3 hover:text-txt transition-colors"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={18} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className="w-full bg-elevated border border-border rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all text-sm"
                    />
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
                  className="w-full py-3.5 bg-accent hover:bg-accent-2 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Réinitialiser le mot de passe'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
