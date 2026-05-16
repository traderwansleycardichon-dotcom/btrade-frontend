import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Server
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Utilisateurs', icon: Users, href: '/admin/users' },
    { label: 'Finance', icon: CreditCard, href: '/admin/billing' },
    { label: 'Helpdesk', icon: LifeBuoy, href: '/admin/support' },
    { label: 'Broadcast', icon: Megaphone, href: '/admin/broadcast' },
    { label: 'Playbooks', icon: BookOpen, href: '/admin/cms' },
    { label: 'Système', icon: Server, href: '/admin/system' },
    { label: 'Paramètres', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-loss rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight block leading-tight">BTrade</span>
          <span className="text-[10px] font-black text-loss uppercase tracking-widest">Admin Control</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
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

      {/* User Profile */}
      <div className="p-4 border-t border-border">
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
  );
};
