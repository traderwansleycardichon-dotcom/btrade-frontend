import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Shield,
  Activity,
  Trophy,
  CreditCard,
  LifeBuoy,
  Megaphone,
  BookOpen,
  Server,
  X,
  Ticket,
  MessageSquare,
  Video,
  Volume2,
  VolumeX,
  Wallet,
  Mail,
  Send,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../contexts/SettingsContext';
import { useQueryClient } from '@tanstack/react-query';
import { useSound } from '../../context/SoundContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { muted, toggleMute } = useSound();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [isStaffMode, setIsStaffMode] = React.useState(
    sessionStorage.getItem('btt_staff_mode') === 'true'
  );

  const handleSwitchToClientMode = () => {
    // Efface tout le cache React Query pour garantir que l'admin
    // ne voit JAMAIS des données d'un autre utilisateur
    queryClient.clear();
    navigate('/app/dashboard');
  };

  const handleSwitchToStaffMode = () => {
    sessionStorage.setItem('btt_staff_mode', 'true');
    setIsStaffMode(true);
    navigate('/admin/dashboard');
  };

  const handleExitStaffMode = () => {
    sessionStorage.removeItem('btt_staff_mode');
    setIsStaffMode(false);
  };

  const isCTO = user?.role === 'cto' && !isStaffMode;
  const isStaff = user?.role === 'staff' || isStaffMode;

  const allNavItems = [
    { label: 'Dashboard',       icon: LayoutDashboard, href: '/admin/dashboard',   adminOnly: false, staffAllowed: true },
    { label: 'Utilisateurs',    icon: Users,           href: '/admin/users',       adminOnly: false, staffAllowed: true },
    { label: 'Messagerie',      icon: MessageSquare,   href: '/admin/messaging',   adminOnly: false, staffAllowed: true },
    { label: 'Finance',         icon: CreditCard,      href: '/admin/billing',     adminOnly: true,  staffAllowed: false },
    { label: 'Wallet',          icon: Wallet,          href: '/admin/wallet',      adminOnly: true,  staffAllowed: false },
    { label: 'Emails',          icon: Mail,            href: '/admin/emails',      adminOnly: false, staffAllowed: false },
    { label: 'Campagnes',       icon: Send,            href: '/admin/campaigns',   adminOnly: false, staffAllowed: false },
    { label: 'Plans Tarifaires',icon: Ticket,          href: '/admin/pricing',     adminOnly: false, staffAllowed: false },
    { label: 'Codes Promo',     icon: Ticket,          href: '/admin/promo-codes', adminOnly: false, staffAllowed: false },
    { label: 'Simulator',       icon: Trophy,          href: '/admin/simulator',   adminOnly: false, staffAllowed: false },
    { label: 'Academy',         icon: BookOpen,        href: '/admin/academy',     adminOnly: false, staffAllowed: true },
    { label: 'Coaching',        icon: Video,           href: '/admin/coaching',    adminOnly: false, staffAllowed: true },
    { label: 'Helpdesk',        icon: LifeBuoy,        href: '/admin/support',     adminOnly: false, staffAllowed: true },
    { label: 'Broadcast',       icon: Megaphone,       href: '/admin/broadcast',   adminOnly: false, staffAllowed: false },
    { label: 'Légal',           icon: Shield,          href: '/admin/legal',       adminOnly: false, staffAllowed: false },
    { label: 'Contrats',        icon: BookOpen,        href: '/admin/contracts',   adminOnly: false, staffAllowed: false },
    { label: 'Système',         icon: Server,          href: '/admin/system',      adminOnly: false, staffAllowed: false },
    { label: 'Mises à jour',    icon: Megaphone,       href: '/admin/updates',     adminOnly: false, staffAllowed: false },
    { label: 'Paramètres',      icon: Settings,        href: '/admin/settings',    adminOnly: false, staffAllowed: false },
  ];

  const navItems = allNavItems.filter(item => {
    if (isStaff) return item.staffAllowed;
    if (isCTO) return !item.adminOnly;
    return true;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-[fadeIn_0.2s_ease-out]" 
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed lg:sticky top-0 left-0 h-screen w-64 bg-surface border-r border-border flex flex-col z-[70] transition-transform duration-300 ease-in-out shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Brand & Close Mobile */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.platform_logo ? (
              <>
                <img src={settings.platform_logo} alt="Logo Behind The Trades" className="h-8 w-auto object-contain" />
                <div>
                  <span className="text-[10px] font-black text-loss uppercase tracking-widest block leading-tight mt-1">Admin Control</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-loss rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-lg tracking-tight block leading-tight">Behind The Trades</span>
                  <span className="text-[10px] font-black text-loss uppercase tracking-widest">Admin Control</span>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-txt-2 hover:bg-elevated rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                isActive 
                  ? "bg-loss/10 text-loss border border-loss/20" 
                  : "text-txt-2 hover:text-txt hover:bg-elevated border border-transparent"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mode Client Switch */}
        <div className="px-4 py-2 mt-auto space-y-2">
          {user?.role === 'cto' && !isStaffMode && (
            <button
              onClick={handleSwitchToStaffMode}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent/10 text-accent border border-accent/20 rounded-xl font-bold hover:bg-accent/20 transition-colors"
            >
              <Shield size={18} />
              Mode Staff
            </button>
          )}

          {isStaffMode && user?.role === 'cto' && (
            <button
              onClick={handleExitStaffMode}
              className="w-full flex items-center justify-center gap-2 py-3 bg-loss/10 text-loss border border-loss/20 rounded-xl font-bold hover:bg-loss/20 transition-colors"
            >
              <Shield size={18} />
              Retour CTO
            </button>
          )}

          <button
            onClick={handleSwitchToClientMode}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-bg rounded-xl font-bold hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
          >
            <Activity size={18} />
            Mode Client (Pro)
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border mt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-loss to-orange-500 flex items-center justify-center font-bold text-lg text-white shadow-lg overflow-hidden border border-border/10">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || 'A'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{user?.fullName || 'Administrateur'}</div>
              <div className="text-[10px] font-bold text-loss uppercase tracking-tighter">
                {user?.role === 'cto' ? 'CTO' : user?.role === 'staff' ? 'Staff' : 'Super Admin'}
              </div>
            </div>
            <button
              onClick={toggleMute}
              className="p-2 text-txt-2 hover:text-txt transition-colors"
              title={muted ? 'Activer le son' : 'Désactiver le son'}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={logout}
              className="p-2 text-txt-2 hover:text-loss transition-colors"
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
