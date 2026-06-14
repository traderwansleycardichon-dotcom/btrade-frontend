import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSent(true);
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
            <img src={settings.platform_logo} alt="BTrade" className="h-10 w-auto object-contain" />
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-win/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-win" />
              </div>
              <h2 className="text-2xl font-black mb-3">Email envoyé !</h2>
              <p className="text-txt-2 text-sm leading-relaxed mb-6">
                Si un compte existe pour <strong className="text-txt">{email}</strong>,
                vous recevrez un lien de réinitialisation dans quelques instants.
                Vérifiez aussi vos spams.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-accent font-bold text-sm hover:text-accent-2 transition-colors"
              >
                <ArrowLeft size={14} />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-black mb-2">Mot de passe oublié ?</h2>
                <p className="text-txt-2 text-sm leading-relaxed">
                  Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-txt-2 uppercase tracking-widest mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
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
                  className="w-full py-3.5 bg-accent hover:bg-accent-2 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : 'Envoyer le lien'}
                </button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm text-txt-2 hover:text-accent transition-colors font-medium"
                  >
                    <ArrowLeft size={14} />
                    Retour à la connexion
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
