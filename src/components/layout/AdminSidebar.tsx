import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings,
  LogOut,
  Shield,
  Activity,
  CreditCard,
  LifeBuoy,
  Megaphone,
  BookOpen,
  Server,
  X,
  Ticket,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSwitchToClientMode = () => {
    // Efface tout le cache React Query pour garantir que l'admin
    // ne voit JAMAIS des données d'un autre utilisateur
    queryClient.clear();
    navigate('/app/dashboard');
  };

  const navItems = [
    { label: 'Dashboard',      icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Utilisateurs',   icon: Users,           href: '/admin/users' },
    { label: 'Messagerie',     icon: MessageSquare,   href: '/admin/messaging' },
    { label: 'Finance',        icon: CreditCard,      href: '/admin/billing' },
    { label: 'Plans Tarifaires',icon: Ticket,         href: '/admin/pricing' },
    { label: 'Codes Promo',    icon: Ticket,          href: '/admin/promo-codes' },
    { label: 'Helpdesk',       icon: LifeBuoy,        href: '/admin/support' },
    { label: 'Broadcast',      icon: Megaphone,       href: '/admin/broadcast' },
    { label: 'Playbooks',      icon: BookOpen,        href: '/admin/cms' },
    { label: 'Légal',          icon: Shield,          href: '/admin/legal' },
    { label: 'Système',        icon: Server,          href: '/admin/system' },
    { label: 'Paramètres',     icon: Settings,        href: '/admin/settings' },
  ];

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
            <div className="w-8 h-8 bg-loss rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-tight">BTrade</span>
              <span className="text-[10px] font-black text-loss uppercase tracking-widest">Admin Control</span>
            </div>
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
        <div className="px-4 py-2 mt-auto">
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-loss to-orange-500 flex items-center justify-center font-bold text-lg text-white shadow-lg">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{user?.fullName || 'Administrateur'}</div>
              <div className="text-[10px] font-bold text-loss uppercase tracking-tighter">Super Admin</div>
            </div>
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
