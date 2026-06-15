import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, Bell, CreditCard, Globe, LogOut, Camera, ChevronRight, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { Modal } from '../../../components/ui/Modal';
import { ImageUpload } from '../../../components/ui/ImageUpload';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';

interface NavItem {
  label: string;
  value: string;
  action?: () => void;
  badge?: string;
}

interface NavSection {
  id: string;
  title: string;
  icon: any;
  items: NavItem[];
}

const SettingsPage: React.FC = () => {
  const { user, subscription, logout, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // États pour les modales
  const [activeModal, setActiveModal] = useState<'profile' | 'password' | 'photo' | null>(null);
  
  // États pour les formulaires
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const formatJoinedDate = (dateStr?: string) => {
    if (!dateStr) return 'le 1 Mai 2024';
    try {
      const date = new Date(dateStr);
      const formatted = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      return 'le ' + formatted;
    } catch {
      return 'Mai 2024';
    }
  };

  const formatExactDate = (dateStr?: string) => {
    if (!dateStr) return 'Non défini';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return 'Non défini';
    }
  };

  // Mutation pour le profil
  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.patch('/api/me', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      refreshUser(); // Update auth store
      setActiveModal(null);
      setMessage({ type: 'success', text: 'Profil mis à jour !' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur lors de la mise à jour.' });
    }
  });

  // Mutation pour le mot de passe
  const updatePassword = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/me/password', data);
      return res.data;
    },
    onSuccess: () => {
      setActiveModal(null);
      setCurrentPassword('');
      setNewPassword('');
      setMessage({ type: 'success', text: 'Mot de passe modifié !' });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erreur mot de passe.' });
    }
  });

  const sections: NavSection[] = [
    {
      id: 'profile',
      title: 'Mon Profil',
      icon: User,
      items: [
        { label: 'Informations personnelles', value: user?.fullName || 'Utilisateur', action: () => { setFullName(user?.fullName || ''); setActiveModal('profile'); } },
        { label: 'Adresse Email', value: user?.email || 'email@example.com' },
        { label: 'Photo de profil', value: 'Changer', action: () => { setAvatarUrl(user?.avatarUrl || ''); setActiveModal('photo'); } },
      ]
    },
    {
      id: 'subscription',
      title: 'Abonnement',
      icon: CreditCard,
      items: [
        { 
          label: 'Plan Actuel', 
          value: user?.role === 'admin' ? 'PRO (Privilège Admin)' : (user?.plan ? user.plan.toUpperCase() : 'FREE'), 
          badge: (user?.plan === 'pro' || user?.role === 'admin') ? 'PRO' : undefined 
        },
        ...((user?.plan === 'pro' && user?.role !== 'admin') ? [
          { label: 'Prochain prélèvement', value: subscription?.currentPeriodEnd ? formatExactDate(subscription.currentPeriodEnd) : 'À venir' },
          ...(subscription?.stripeSubId ? [{ label: 'Mode de paiement', value: '•••• 4242' }] : []),
          { label: 'Gérer mon abonnement', value: 'Mettre à jour / Renouveler', action: () => navigate('/app/upgrade') }
        ] : [])
      ]
    },
    {
      id: 'security',
      title: 'Sécurité',
      icon: Shield,
      items: [
        { label: 'Mot de passe', value: 'Dernière modif: 2 mois', action: () => setActiveModal('password') },
        { label: 'Double authentification (2FA)', value: 'Désactivé' },
        { label: 'Sessions actives', value: '2 appareils' },
      ]
    },
    {
      id: 'preferences',
      title: 'Préférences',
      icon: Globe,
      items: [
        { label: 'Devise principale', value: 'USD ($)' },
        { label: 'Langue de l\'interface', value: 'Français (FR)' },
        { label: 'Fuseau horaire', value: 'Europe/Paris (UTC+2)' },
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-6 right-6 px-6 py-3 rounded-2xl shadow-2xl z-[200] animate-bounce-in flex items-center gap-3 ${
          message.type === 'success' ? 'bg-win text-white' : 'bg-loss text-white'
        }`}>
          <Shield size={18} />
          <span className="font-bold text-sm">{message.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-4xl font-bold text-white shadow-2xl group-hover:scale-105 transition-transform overflow-hidden border-4 border-surface">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.charAt(0) || 'U'
            )}
          </div>
          <button 
            onClick={() => { setAvatarUrl(user?.avatarUrl || ''); setActiveModal('photo'); }}
            className="absolute -bottom-2 -right-2 p-2 bg-surface border border-border rounded-xl text-txt-2 hover:text-accent shadow-xl transition-colors"
          >
            <Camera size={16} />
          </button>
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">{user?.fullName || 'Utilisateur'}</h2>
          <p className="text-txt-2">Membre Behind The Trades depuis {formatJoinedDate(user?.createdAt)} • <span className="text-accent font-bold">Plan {user?.plan ? user.plan.toUpperCase() : 'FREE'}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.id} className="glass p-8 rounded-[2.5rem] hover:border-accent/20 transition-all group">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center text-txt-2 group-hover:text-accent transition-colors">
                <section.icon size={20} />
              </div>
              <h3 className="font-bold text-lg">{section.title}</h3>
            </div>

            <div className="space-y-6">
              {section.items.map((item, i) => (
                <div 
                  key={i} 
                  onClick={item.action}
                  className={`flex justify-between items-center group/item ${item.action ? 'cursor-pointer' : ''}`}
                >
                  <div>
                    <div className="text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.value}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded bg-accent text-[9px] font-black text-white">{item.badge}</span>
                      )}
                    </div>
                  </div>
                  {item.action && (
                    <ChevronRight size={16} className="text-txt-3 group-hover/item:text-accent group-hover/item:translate-x-1 transition-all" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="glass p-8 rounded-[2.5rem] border-loss/20 bg-loss/5">
        <h3 className="text-loss font-bold mb-4 flex items-center gap-2">
          <Shield size={20} />
          Zone Sensible
        </h3>
        <p className="text-sm text-txt-2 mb-6">
          Ces actions sont irréversibles. Soyez prudent avant de procéder.
        </p>
        <div className="flex flex-wrap gap-4">
          <button onClick={logout} className="px-6 py-3 bg-elevated border border-border rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-loss/10 hover:text-loss transition-all">
            <LogOut size={18} />
            Se déconnecter
          </button>
          <button className="px-6 py-3 bg-loss/10 border border-loss/20 rounded-2xl text-sm font-bold text-loss hover:bg-loss transition-all hover:text-white">
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Modal Profile */}
      {activeModal === 'profile' && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border-accent/20 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Modifier Profil</h3>
              <button onClick={() => setActiveModal(null)} className="p-2 text-txt-3 hover:text-txt transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2 block">Nom Complet</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-2xl py-3 px-4 focus:outline-none focus:border-accent transition-all"
                  placeholder="Votre nom"
                />
              </div>
              <button 
                onClick={() => updateProfile.mutate({ full_name: fullName })}
                disabled={updateProfile.isPending}
                className="w-full py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-2 transition-all"
              >
                {updateProfile.isPending ? <Loader2 className="animate-spin" /> : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Password */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border-accent/20 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Changer Mot de Passe</h3>
              <button onClick={() => setActiveModal(null)} className="p-2 text-txt-3 hover:text-txt transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2 block">Mot de passe actuel</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-2xl py-3 px-4 focus:outline-none focus:border-accent transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2 block">Nouveau mot de passe</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-elevated border border-border rounded-2xl py-3 px-4 focus:outline-none focus:border-accent transition-all"
                />
              </div>
              <button 
                onClick={() => updatePassword.mutate({ current_password: currentPassword, new_password: newPassword })}
                disabled={updatePassword.isPending}
                className="w-full py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-2 transition-all"
              >
                {updatePassword.isPending ? <Loader2 className="animate-spin" /> : 'Mettre à jour'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Photo */}
      {activeModal === 'photo' && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border-accent/20 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Photo de Profil</h3>
              <button onClick={() => setActiveModal(null)} className="p-2 text-txt-3 hover:text-txt transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <ImageUpload 
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  className="w-full"
                />
              </div>
              <button 
                onClick={() => updateProfile.mutate({ avatar_url: avatarUrl })}
                disabled={updateProfile.isPending}
                className="w-full py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-2 transition-all"
              >
                {updateProfile.isPending ? <Loader2 className="animate-spin" /> : 'Mettre à jour la photo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
