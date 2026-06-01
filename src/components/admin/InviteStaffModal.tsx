import React, { useState } from 'react';
import Lottie from 'lottie-react';
import graduationIcon from '../../assets/animations/1f393.json';
import { UserPlus, Mail, User, X, Copy, Check, Shield } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import api from '../../lib/api';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteStaffModal: React.FC<InviteStaffModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitedUser, setInvitedUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/admin/users/invite-staff', { email, fullName });
      setInvitedUser(res.data.data);
      addToast('Staff invité avec succès', 'success');
      onSuccess();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erreur lors de l\'invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const text = `Identifiants BTrade Staff:\nEmail: ${invitedUser.user.email}\nMot de passe temporaire: ${invitedUser.tempPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Copié dans le presse-papier', 'success');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-md glass rounded-3xl border border-border shadow-2xl overflow-hidden animate-[zoomIn_0.3s_ease-out]">
        <div className="px-8 py-6 border-b border-border bg-surface/50 flex justify-between items-center">
          <h3 className="font-black text-xl flex items-center gap-2">
            <div className="w-10 h-10 shrink-0"><Lottie animationData={graduationIcon} loop={false} autoplay /></div>
            Inviter un Staff
          </h3>
          <button onClick={onClose} className="p-2 text-txt-3 hover:text-txt transition-colors"><X size={20} /></button>
        </div>

        <div className="p-8">
          {!invitedUser ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-xs text-txt-2">
                Créez un compte avec des accès restreints pour un membre de votre équipe. 
                Le staff pourra répondre aux tickets de support mais n'aura pas accès aux finances globales.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Nom Complet</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" />
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Jean Dupont"
                      className="w-full bg-elevated border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:border-loss/50 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Email Professionnel</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="staff@votre-domaine.com"
                      className="w-full bg-elevated border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:border-loss/50 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !email || !fullName}
                className="w-full btn-primary bg-loss hover:bg-loss/80 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(239,68,68,0.2)]"
              >
                {loading ? 'Création en cours...' : 'Générer les accès'}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center animate-[fadeIn_0.4s_ease-out]">
              <div className="w-16 h-16 bg-win/10 text-win rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <div>
                <h4 className="font-bold text-lg">Accès générés !</h4>
                <p className="text-xs text-txt-2">Veuillez transmettre ces identifiants de manière sécurisée au nouveau membre du staff.</p>
              </div>

              <div className="bg-elevated p-4 rounded-2xl border border-border text-left space-y-3">
                <div>
                  <div className="text-[10px] font-bold text-txt-3 uppercase mb-1">Email</div>
                  <div className="text-sm font-mono">{invitedUser.user.email}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-txt-3 uppercase mb-1">Mot de passe temporaire</div>
                  <div className="text-sm font-mono text-loss font-bold">{invitedUser.tempPassword}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={copyToClipboard}
                  className="flex-1 btn-primary bg-surface border border-border text-txt py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-elevated transition-all"
                >
                  {copied ? <Check size={18} className="text-win" /> : <Copy size={18} />}
                  {copied ? 'Copié !' : 'Copier les accès'}
                </button>
                <button 
                  onClick={onClose}
                  className="flex-1 btn-primary bg-win text-white py-3 rounded-xl font-bold hover:bg-win/80 transition-all"
                >
                  Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
