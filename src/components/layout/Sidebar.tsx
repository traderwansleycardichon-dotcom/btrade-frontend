import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LineChart, 
  Calendar, 
  BookOpen, 
  Layers, 
  BarChart3, 
  StickyNote, 
  Newspaper, 
  Wallet, 
  CreditCard, 
  Settings,
  LogOut,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAccounts } from '../../hooks/useAccounts';
import { MOCK_STREAK } from '../../lib/mocks';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { accounts, isLoading } = useAccounts();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/app/dashboard' },
    { label: 'Trades', icon: LineChart, href: '/app/trades', badge: '12' },
    { label: 'Calendrier', icon: Calendar, href: '/app/calendar' },
    { label: 'Journal', icon: BookOpen, href: '/app/journal', live: true },
    { label: 'Playbooks', icon: Layers, href: '/app/playbooks', badge: '3' },
    { label: 'Rapports', icon: BarChart3, href: '/app/reports' },
    { label: 'Notebook', icon: StickyNote, href: '/app/notebook' },
    { label: 'News', icon: Newspaper, href: '/app/economic', badge: '8' },
    { label: 'Mes comptes', icon: Wallet, href: '/app/accounts', badge: accounts.length.toString() },
    { label: 'Paiements', icon: CreditCard, href: '/app/payouts' },
    { label: 'Paramètres', icon: Settings, href: '/app/settings' },
  ];

  const activeAccount = accounts.find(a => a.statut === 'actif') || accounts[0];

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(243,108,0,0.4)]">
          <LineChart size={20} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">BTrade</span>
      </div>

      {/* Account Selector */}
      <div className="px-4 mb-6">
        <button className="w-full p-3 rounded-xl bg-elevated border border-border hover:border-accent/30 transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-center mb-1 relative">
            <span className="text-txt-2 text-[10px] font-bold uppercase tracking-widest">Compte Actif</span>
            <RefreshCw size={12} className="text-txt-2 group-hover:rotate-180 transition-transform duration-500" />
          </div>
          <div className="flex items-center gap-2 mb-2 relative">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
            <span className="font-bold text-sm truncate">{activeAccount?.nom || 'Chargement...'}</span>
          </div>
          <div className="flex justify-between items-end relative">
            <span className="text-xl font-mono font-bold">${Number(activeAccount?.balanceCourante || 0).toLocaleString()}</span>
            <span className="text-[10px] font-bold text-win bg-win/10 px-1.5 py-0.5 rounded">PRO</span>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) => cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
              isActive 
                ? "bg-accent/10 text-accent border-l-2 border-accent rounded-l-none" 
                : "text-txt-2 hover:text-txt hover:bg-elevated"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} />
              <span>{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.live && (
                <span className="text-[9px] font-black bg-accent text-white px-1.5 py-0.5 rounded leading-none">LIVE</span>
              )}
              {item.badge && (
                <span className="text-[10px] font-bold bg-border text-txt-2 group-hover:bg-accent group-hover:text-white px-1.5 py-0.5 rounded transition-colors">
                  {item.badge}
                </span>
              )}
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Streak */}
      <div className="p-4">
        <div className="bg-elevated rounded-2xl p-4 border border-border relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 size={40} />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-[10px] font-bold text-txt-2 uppercase tracking-widest">Winning Streak</div>
              <div className="text-lg font-bold">{MOCK_STREAK.current} jours</div>
            </div>
          </div>
          <div className="flex gap-1">
            {MOCK_STREAK.history.map((win, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  win ? "bg-win" : "bg-loss/30"
                )} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center font-bold text-lg text-white shadow-lg">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">{user?.fullName || 'Utilisateur'}</div>
            <div className="text-[10px] font-bold text-accent uppercase tracking-tighter">Plan {user?.plan || 'Free'}</div>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-txt-2 hover:text-loss transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
