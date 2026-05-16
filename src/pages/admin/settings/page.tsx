import React, { useState } from 'react';
import { Settings, User, Lock, Bell, Shield, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import api from '../../../lib/api';

export default function AdminSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'profile' | 'security' | 'permissions'>('profile');
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/api/me', { full_name: formData.fullName });
      await refreshUser();
      addToast('Profil mis à jour', 'success');
    } catch (err) {
      addToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return addToast('Les mots de passe ne correspondent pas', 'error');
    }
    setLoading(true);
    try {
      await api.post('/api/me/password', {
        current_password: passwords.current,
        new_password: passwords.new
      });
      addToast('Mot de passe modifié avec succès', 'success');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erreur lors du changement', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-black mb-2 flex items-center gap-3">
          <Settings className="text-loss" />
          Paramètres Administrateur
        </h1>
        <p className="text-txt-2 text-sm">Gérez vos informations personnelles et la sécurité de votre compte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="glass p-6 rounded-3xl border border-border text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-loss to-orange-500 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <h3 className="font-bold">{user?.fullName}</h3>
            <p className="text-[10px] font-black text-loss uppercase tracking-widest mt-1">Super Administrateur</p>
          </div>

          <nav className="glass rounded-2xl border border-border overflow-hidden">
            <button 
              onClick={() => setCurrentTab('profile')}
              className={`w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 transition-all ${currentTab === 'profile' ? 'bg-loss/10 text-loss border-l-4 border-loss' : 'text-txt-2 hover:bg-elevated'}`}
            >
              <User size={18} /> Profil
            </button>
            <button 
              onClick={() => setCurrentTab('security')}
              className={`w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 transition-all ${currentTab === 'security' ? 'bg-loss/10 text-loss border-l-4 border-loss' : 'text-txt-2 hover:bg-elevated'}`}
            >
              <Lock size={18} /> Sécurité
            </button>
            <button 
              onClick={() => setCurrentTab('permissions')}
              className={`w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 transition-all ${currentTab === 'permissions' ? 'bg-loss/10 text-loss border-l-4 border-loss' : 'text-txt-2 hover:bg-elevated'}`}
            >
              <Shield size={18} /> Permissions
            </button>
          </nav>
        </div>

        <div className="md:col-span-2 space-y-8">
          {currentTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="glass p-8 rounded-3xl border border-border space-y-6 animate-[slideUp_0.3s_ease-out]">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <User size={20} className="text-loss" />
                Informations du profil
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Nom Complet</label>
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:border-loss/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Email (Lecture seule)</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-txt-3 cursor-not-allowed"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary bg-loss hover:bg-loss/80 text-white flex items-center gap-2"
              >
                <Save size={18} />
                Enregistrer les modifications
              </button>
            </form>
          )}

          {currentTab === 'security' && (
            <div className="space-y-8 animate-[slideUp_0.3s_ease-out]">
              <form onSubmit={handleChangePassword} className="glass p-8 rounded-3xl border border-border space-y-6">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Lock size={20} className="text-loss" />
                  Changer le mot de passe
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Mot de passe actuel</label>
                    <input 
                      type="password" 
                      value={passwords.current}
                      onChange={e => setPasswords({...passwords, current: e.target.value})}
                      className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:border-loss/50 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Nouveau mot de passe</label>
                      <input 
                        type="password" 
                        value={passwords.new}
                        onChange={e => setPasswords({...passwords, new: e.target.value})}
                        className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:border-loss/50 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Confirmer</label>
                      <input 
                        type="password" 
                        value={passwords.confirm}
                        onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                        className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:border-loss/50 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !passwords.current || !passwords.new}
                  className="btn-primary bg-surface border border-loss text-loss hover:bg-loss hover:text-white flex items-center gap-2"
                >
                  <Lock size={18} />
                  Mettre à jour le mot de passe
                </button>
              </form>

              <div className="glass p-8 rounded-3xl border border-border">
                <h3 className="font-bold mb-6 flex items-center gap-2">
                  <Shield size={20} className="text-loss" />
                  Sessions Actives
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-elevated rounded-2xl">
                    <div className="flex gap-4">
                      <div className="text-win"><Save size={20} /></div>
                      <div>
                        <div className="text-sm font-bold">MacBook Pro - Paris, FR</div>
                        <div className="text-[10px] text-txt-3">Session actuelle • IP: 192.168.1.1</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-win bg-win/10 px-2 py-0.5 rounded">ACTIF</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'permissions' && (
            <div className="glass p-8 rounded-3xl border border-border space-y-8 animate-[slideUp_0.3s_ease-out]">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Shield size={20} className="text-loss" />
                Matrice des Permissions (RBAC)
              </h3>

              <div className="space-y-6">
                {[
                  { category: 'Système', perms: ['Accès Root', 'Gestion Feature Flags', 'Accès Logs Serveur'] },
                  { category: 'Utilisateurs', perms: ['Suppression de comptes', 'Modification d\'abonnements', 'Broadcast Global'] },
                  { category: 'Finances', perms: ['Vue MRR', 'Gestion Remboursements', 'Configuration Stripe'] }
                ].map(cat => (
                  <div key={cat.category}>
                    <h4 className="text-[10px] font-black text-loss uppercase tracking-widest mb-3">{cat.category}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.perms.map(p => (
                        <div key={p} className="flex items-center gap-2 text-xs text-txt-2 p-2 bg-surface border border-border rounded-xl">
                          <CheckCircle className="text-win" size={14} />
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-loss/5 border border-loss/20 rounded-2xl">
                <div className="flex gap-3 text-xs text-txt-2">
                  <AlertTriangle size={16} className="text-loss shrink-0" />
                  <p>En tant que <strong>Super Administrateur</strong>, vous disposez de toutes les permissions. Ces réglages ne peuvent être modifiés que par un autre administrateur de niveau "Root".</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
