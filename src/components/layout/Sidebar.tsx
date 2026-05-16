import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  LineChart, 
  Calendar, 
  BookOpen, 
  Layers, 
  BarChart3, 
  Newspaper, 
  Wallet, 
  CreditCard, 
  Settings,
  LogOut,
  ChevronRight,
  RefreshCw,
  GraduationCap,
  Sparkles,
  Landmark,
  DollarSign,
  TrendingUp,
  Brain,
  Activity,
  ArrowUpRight,
  Target,
  Globe,
  FileText,
  Lock,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAccounts } from '../../hooks/useAccounts';
import { MOCK_STREAK } from '../../lib/mocks';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LucideIcon } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  live?: boolean;
  badge?: string;
  proOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { accounts } = useAccounts();
  const location = useLocation();

  const isPro = user?.plan === 'pro' || user?.role === 'admin';
  const accountsList = Array.isArray(accounts) ? accounts : [];
  
  const navGroups: NavGroup[] = [
    {
      title: 'Trading',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/app/dashboard' },
        { label: 'Comptes', icon: Wallet, href: '/app/accounts' },
        { label: 'Mes Trades', icon: Activity, href: '/app/trades' },
        { label: 'Journal', icon: BookOpen, href: '/app/journal' },
        { label: 'Calendrier', icon: Calendar, href: '/app/calendar' },
      ]
    },
    {
      title: 'Finance',
      items: [
        { label: 'Patrimoine', icon: Landmark, href: '/app/patrimoine' },
        { label: 'Budget & Flux', icon: CreditCard, href: '/app/finance' },
        { label: 'Objectifs', icon: Target, href: '/app/goals' },
        { label: 'Retraits', icon: ArrowUpRight, href: '/app/payouts' },
      ]
    },
    {
      title: 'Analyse & École',
      items: [
        { label: 'Insights IA', icon: Sparkles, href: '/app/ai-insights', proOnly: true },
        { label: 'Psychologie', icon: Brain, href: '/app/psychology' },
        { label: 'Academy', icon: GraduationCap, href: '/app/formation', proOnly: true },
        { label: 'Playbooks', icon: FileText, href: '/app/playbooks', proOnly: true },
      ]
    },
    {
      title: 'Gestion',
      items: [
        { label: 'Calendrier Éco', icon: Globe, href: '/app/economic' },
        { label: 'Analyses', icon: BarChart3, href: '/app/reports', proOnly: true },
        { label: 'Paramètres', icon: Settings, href: '/app/settings' },
      ]
    }
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
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(243,108,0,0.4)]">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="font-bold text-base md:text-lg tracking-tight">BTrade</span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-txt-2 hover:bg-elevated rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Account Selector */}
        <div className="px-4 mb-6">
          <button className="w-full p-3 rounded-xl bg-elevated border border-border hover:border-accent/30 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-center mb-1 relative">
               <span className="text-txt-2 text-[11px] md:text-[10px] font-bold uppercase tracking-widest">Balance Globale</span>
              <RefreshCw size={12} className="text-txt-2 group-hover:rotate-180 transition-transform duration-500" />
            </div>
            <div className="flex items-center gap-2 mb-2 relative">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
              <span className="font-bold text-sm truncate">{accountsList.length > 0 ? 'Tous les comptes' : 'Chargement...'}</span>
            </div>
            <div className="flex justify-between items-end relative">
               <span className="text-lg md:text-xl font-mono font-bold">${accountsList.reduce((acc, a) => acc + Number(a.balanceCourante || 0), 0).toLocaleString()}</span>
              <span className="text-[10px] font-bold text-win bg-win/10 px-1.5 py-0.5 rounded">PRO</span>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-6 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="px-3 mb-2 text-[11px] md:text-[10px] font-bold text-txt-3 uppercase tracking-[0.2em]">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={(!item.proOnly || isPro) ? item.href : '/app/upgrade'}
                    onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                    className={({ isActive }) => cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                      isActive 
                        ? "bg-accent/10 text-accent border-l-2 border-accent rounded-l-none" 
                        : "text-txt-2 hover:text-txt hover:bg-elevated",
                      item.proOnly && !isPro && "opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.proOnly && !isPro && (
                        <Lock size={12} className="text-txt-3" />
                      )}
                      {item.live && (
                        <span className="text-[9px] font-black bg-accent text-white px-1.5 py-0.5 rounded leading-none animate-pulse">LIVE</span>
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
              </div>
            </div>
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
    </>
  );
};
