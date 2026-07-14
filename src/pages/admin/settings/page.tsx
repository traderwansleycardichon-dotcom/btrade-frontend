import React, { useState } from 'react';
import { Settings, User, Lock, Bell, Shield, Save, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import api from '../../../lib/api';
import { ImageUpload } from '../../../components/ui/ImageUpload';
import { useSettings } from '../../../contexts/SettingsContext';

export default function AdminSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const { settings, refreshSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'profile' | 'security' | 'permissions' | 'apparence' | 'facturation' | 'social'>('profile');
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });

  const [emailChange, setEmailChange] = useState({
    newEmail: '',
    password: '',
  });
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [socialLinks, setSocialLinks] = useState({
    discord_link: settings.discord_link || '',
    telegram_link: settings.telegram_link || '',
  });

  React.useEffect(() => {
    setSocialLinks({
      discord_link: settings.discord_link || '',
      telegram_link: settings.telegram_link || '',
    });
  }, [settings.discord_link, settings.telegram_link]);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailChange.newEmail || !emailChange.password) return;
    setEmailChangeLoading(true);
    try {
      await api.patch('/api/me/email', {
        email: emailChange.newEmail,
        current_password: emailChange.password,
      });
      await refreshUser();
      addToast('Email mis à jour avec succès', 'success');
      setEmailChange({ newEmail: '', password: '' });
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erreur lors du changement d\'email', 'error');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleSaveSocialLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/api/settings', {
        discord_link: socialLinks.discord_link.trim(),
        telegram_link: socialLinks.telegram_link.trim(),
      });
      await refreshSettings();
      addToast('Liens sociaux mis à jour', 'success');
    } catch (err) {
      addToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
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
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-loss to-orange-500 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-xl overflow-hidden border-2 border-surface">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || 'A'
              )}
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
            <button 
              onClick={() => setCurrentTab('apparence')}
              className={`w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 transition-all ${currentTab === 'apparence' ? 'bg-loss/10 text-loss border-l-4 border-loss' : 'text-txt-2 hover:bg-elevated'}`}
            >
              <Settings size={18} /> Apparence
            </button>
            <button
              onClick={() => setCurrentTab('facturation')}
              className={`w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 transition-all ${currentTab === 'facturation' ? 'bg-loss/10 text-loss border-l-4 border-loss' : 'text-txt-2 hover:bg-elevated'}`}
            >
              <CreditCard size={18} /> Facturation
            </button>
            <button
              onClick={() => setCurrentTab('social')}
              className={`w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 transition-all ${currentTab === 'social' ? 'bg-loss/10 text-loss border-l-4 border-loss' : 'text-txt-2 hover:bg-elevated'}`}
            >
              <Bell size={18} /> Réseaux sociaux
            </button>
          </nav>
        </div>

        <div className="md:col-span-2 space-y-8">
          {currentTab === 'profile' && (
            <>
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
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Email actuel</label>
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

            {/* Email change — one-time only */}
            {(user as any)?.emailChangedAt ? (
              <div className="glass p-6 rounded-3xl border border-border animate-[slideUp_0.3s_ease-out]">
                <div className="flex items-start gap-3 text-sm text-txt-2">
                  <CheckCircle size={16} className="text-win shrink-0 mt-0.5" />
                  <p>L'email administrateur a déjà été modifié une fois. Ce changement ne peut pas être répété.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleChangeEmail} className="glass p-8 rounded-3xl border border-amber-500/20 space-y-6 animate-[slideUp_0.3s_ease-out]">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2 mb-1">
                    <AlertTriangle size={18} className="text-amber-500" />
                    Changer l'email administrateur
                  </h3>
                  <p className="text-xs text-txt-2">Cette action n'est autorisée qu'une seule fois. Confirmez votre mot de passe pour continuer.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Nouvel email</label>
                    <input
                      type="email"
                      required
                      value={emailChange.newEmail}
                      onChange={e => setEmailChange(p => ({ ...p, newEmail: e.target.value }))}
                      className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Mot de passe actuel</label>
                    <input
                      type="password"
                      required
                      value={emailChange.password}
                      onChange={e => setEmailChange(p => ({ ...p, password: e.target.value }))}
                      className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={emailChangeLoading || !emailChange.newEmail || !emailChange.password}
                  className="btn-primary bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2 disabled:opacity-50"
                >
                  <Save size={16} />
                  {emailChangeLoading ? 'Mise à jour...' : 'Confirmer le changement d\'email'}
                </button>
              </form>
            )}
            </>
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

          {currentTab === 'apparence' && (
            <div className="glass p-8 rounded-3xl border border-border space-y-8 animate-[slideUp_0.3s_ease-out]">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Settings size={20} className="text-loss" />
                Apparence de la plateforme
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Logo de la plateforme</label>
                  <p className="text-xs text-txt-2 mb-4">Ce logo remplacera le texte "Behind The Trade" dans la barre de navigation et le menu latéral.</p>
                  
                  <div className="max-w-xs">
                    <ImageUpload
                      label="Upload Logo (PNG, JPG)"
                      value={settings?.platform_logo || ''}
                      onChange={async (url) => {
                        try {
                          await api.patch('/api/settings', { platform_logo: url });
                          await refreshSettings();
                          addToast('Logo mis à jour', 'success');
                        } catch (err) {
                          addToast('Erreur lors de la mise à jour du logo', 'error');
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border/40">
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Logo du certificat</label>
                  <p className="text-xs text-txt-2 mb-4">Logo officiel qui sera affiché sur les certificats de réussite de l'Academy (PNG, JPG).</p>
                  
                  <div className="max-w-xs">
                    <ImageUpload
                      label="Upload Logo Certificat"
                      value={settings?.certificate_logo || ''}
                      onChange={async (url) => {
                        try {
                          await api.patch('/api/settings', { certificate_logo: url });
                          await refreshSettings();
                          addToast('Logo du certificat mis à jour', 'success');
                        } catch (err) {
                          addToast('Erreur lors de la mise à jour', 'error');
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border/40">
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Signature du certificat (Image)</label>
                  <p className="text-xs text-txt-2 mb-4">Signature officielle de l'administrateur qui sera affichée sur les certificats (PNG transparent recommandé).</p>
                  
                  <div className="max-w-xs">
                    <ImageUpload
                      label="Upload Signature"
                      value={settings?.certificate_signature_image || ''}
                      onChange={async (url) => {
                        try {
                          await api.patch('/api/settings', { certificate_signature_image: url });
                          await refreshSettings();
                          addToast('Signature du certificat mise à jour', 'success');
                        } catch (err) {
                          addToast('Erreur lors de la mise à jour', 'error');
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-border/40 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Nom du signataire / Rôle</label>
                    <p className="text-xs text-txt-2 mb-2">Le nom et rôle de l'administrateur qui apparaîtront sous la signature du certificat.</p>
                    
                    <div className="flex gap-3 max-w-md">
                      <input 
                        type="text" 
                        defaultValue={settings?.certificate_signer_name || ''}
                        id="certificate_signer_name_input"
                        placeholder="Ex: Frantzley Adolphe, Fondateur Behind The Trade"
                        className="flex-1 bg-elevated border border-border rounded-xl px-4 py-2.5 text-xs focus:border-loss/50 outline-none transition-all text-txt"
                      />
                      <button
                        onClick={async () => {
                          const val = (document.getElementById('certificate_signer_name_input') as HTMLInputElement)?.value;
                          try {
                            await api.patch('/api/settings', { certificate_signer_name: val });
                            await refreshSettings();
                            addToast('Nom du signataire enregistré', 'success');
                          } catch (err) {
                            addToast('Erreur lors de l\'enregistrement', 'error');
                          }
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-loss hover:bg-loss/80 rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'social' && (
            <form onSubmit={handleSaveSocialLinks} className="glass p-8 rounded-3xl border border-border space-y-8 animate-[slideUp_0.3s_ease-out]">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Bell size={20} className="text-loss" />
                Réseaux sociaux
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Lien Discord (PRO uniquement)</label>
                  <p className="text-xs text-txt-2 mb-3">Seuls les membres PRO pourront accéder à ce lien depuis l'en-tête de la plateforme.</p>
                  <input
                    type="url"
                    value={socialLinks.discord_link}
                    onChange={e => setSocialLinks(p => ({ ...p, discord_link: e.target.value }))}
                    placeholder="https://discord.gg/..."
                    className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:border-loss/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Lien Telegram (tout le monde)</label>
                  <p className="text-xs text-txt-2 mb-3">Tous les utilisateurs connectés pourront cliquer sur ce lien depuis l'en-tête.</p>
                  <input
                    type="url"
                    value={socialLinks.telegram_link}
                    onChange={e => setSocialLinks(p => ({ ...p, telegram_link: e.target.value }))}
                    placeholder="https://t.me/..."
                    className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:border-loss/50 outline-none transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary bg-loss hover:bg-loss/80 text-white flex items-center gap-2"
              >
                <Save size={18} />
                {loading ? 'Sauvegarde...' : 'Enregistrer les liens'}
              </button>
            </form>
          )}

          {currentTab === 'facturation' && (
            <div className="glass p-8 rounded-3xl border border-border space-y-8 animate-[slideUp_0.3s_ease-out]">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-loss" />
                Paramètres de facturation et paiements
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Taux de change (USD vers HTG)</label>
                  <p className="text-xs text-txt-2 mb-2">Le taux de conversion utilisé pour facturer les clients qui paient avec MonCash (ex: 131).</p>
                  
                  <div className="flex gap-3 max-w-md">
                    <input 
                      type="number" 
                      step="0.01"
                      defaultValue={settings?.USD_TO_HTG_RATE || ''}
                      id="usd_to_htg_rate_input"
                      placeholder="Ex: 131"
                      className="flex-1 bg-elevated border border-border rounded-xl px-4 py-2.5 text-xs focus:border-loss/50 outline-none transition-all text-txt"
                    />
                    <button
                      onClick={async () => {
                        const val = (document.getElementById('usd_to_htg_rate_input') as HTMLInputElement)?.value;
                        try {
                          await api.patch('/api/settings', { USD_TO_HTG_RATE: val });
                          await refreshSettings();
                          addToast('Taux de change enregistré', 'success');
                        } catch (err) {
                          addToast('Erreur lors de l\'enregistrement', 'error');
                        }
                      }}
                      className="px-4 py-2 text-xs font-bold text-white bg-loss hover:bg-loss/80 rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
