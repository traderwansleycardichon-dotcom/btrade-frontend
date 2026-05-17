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
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAccounts } from '../../hooks/useAccounts';
import { useMultiAccountTrades } from '../../hooks/useMultiAccountTrades';
import { Flame, BarChart2 } from 'lucide-react';
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
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Sidebar Component
 * Gère la navigation principale de l'application BTrade.
 * Les liens sont regroupés par sections logiques pour une meilleure UX.
 */

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  /**
   * Configuration de la navigation
   * Chaque groupe contient un titre et une liste d'items (NavItem)
   */
  const navGroups: NavGroup[] = [
    {
      title: 'Trading',
      items: [
        { label: 'Dashboard',  icon: LayoutDashboard, href: '/app/dashboard' },
        { label: 'Comptes',    icon: Wallet,          href: '/app/accounts' },
        { label: 'Mes Trades', icon: Activity,        href: '/app/trades' },
        { label: 'Calendrier', icon: Calendar,        href: '/app/calendar' },
        { label: 'Playbooks',  icon: FileText,        href: '/app/playbooks' },
      ]
    },
    {
      title: 'Journal',
      items: [
        { label: 'Journal de trading', icon: BookOpen, href: '/app/journal' },
        { label: 'Psychologie',        icon: Brain,    href: '/app/psychology' },
        { label: 'Analyses techniques',icon: BarChart3,href: '/app/reports' },
      ]
    },
    {
      title: 'Finance',
      items: [
        { label: 'Patrimoine',  icon: Landmark,     href: '/app/patrimoine' },
        { label: 'Budget',      icon: CreditCard,   href: '/app/finance' },
        { label: 'Objectifs',   icon: Target,       href: '/app/goals' },
        { label: 'Retraits',    icon: ArrowUpRight, href: '/app/payouts' },
      ]
    },
    {
      title: 'Formation',
      items: [
        { label: 'Academy',           icon: GraduationCap, href: '/app/formation', badge: 'New' },
      ]
    },
    {
      title: 'IA',
      items: [
        { label: 'Insights IA',       icon: Sparkles, href: '/app/ai-insights', live: true },
        { label: 'Calendrier Éco',    icon: Globe,    href: '/app/economic' },
      ]
    },
    {
      title: 'Système',
      items: [
        { label: 'Paramètres', icon: Settings, href: '/app/settings' },
      ]
    }
  ];

  return (
    <>
      {/* Backdrop (mobile uniquement, quand drawer ouvert) */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-bg/80 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          bg-surface border-r border-border flex flex-col w-64 shrink-0
          fixed lg:sticky inset-y-0 left-0 z-50 lg:z-auto
          h-screen lg:top-0
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
      {/* Brand */}
      <div className="p-5 lg:p-6 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(243,108,0,0.4)]">
            <TrendingUp size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">BTrade</span>
        </div>
        {/* Bouton fermer (mobile uniquement) */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1 text-txt-2 hover:text-txt"
          title="Fermer"
        >
          <ChevronRight size={18} className="rotate-180" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-6 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-2 text-[10px] font-bold text-txt-3 uppercase tracking-[0.2em]">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
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

      {/* Winning Streak — calculé depuis les vrais trades */}
      <WinningStreakBlock />

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

// ── Winning Streak ─────────────────────────────────────────────────────
const WinningStreakBlock: React.FC = () => {
  const { accounts } = useAccounts();
  const ids = (Array.isArray(accounts) ? accounts : []).map((a: any) => a.id);
  const { trades } = useMultiAccountTrades(ids);

  // Streak en JOURS consécutifs (P&L journalier positif)
  const { current, history } = React.useMemo(() => {
    if (!trades || trades.length === 0) return { current: 0, history: [] as boolean[] };

    // Aggréger P&L par jour
    const byDay = new Map<string, number>();
    trades.forEach((t: any) => {
      const d = t.dateEntree ? new Date(t.dateEntree) : null;
      if (!d) return;
      const k = d.toISOString().slice(0, 10);
      byDay.set(k, (byDay.get(k) || 0) + Number(t.plNet ?? 0));
    });

    // Tri jours desc par date
    const days = Array.from(byDay.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    if (days.length === 0) return { current: 0, history: [] };

    // Streak depuis le plus récent
    let streak = 0;
    for (const [, pl] of days) {
      if (pl > 0) streak++;
      else break;
    }

    // Historique des 10 derniers jours, inversé pour affichage L→R (ancien→récent)
    const hist = days.slice(0, 10).map(([, pl]) => pl > 0).reverse();
    return { current: streak, history: hist };
  }, [trades]);

  return (
    <div className="p-4 border-t border-border">
      <div className="bg-elevated rounded-xl p-3.5 border border-border relative overflow-hidden">
        {/* Top row : flame + label + icon */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Flame size={14} className={current >= 3 ? 'text-accent' : 'text-txt-3'} />
            <span className="text-[9px] font-bold text-txt-2 uppercase tracking-[0.18em]">
              Winning Streak
            </span>
          </div>
          <BarChart2 size={14} className="text-txt-3" />
        </div>

        {/* Big number */}
        <div className="text-2xl font-black mb-2.5 leading-none">
          {current > 0 ? `${current} jour${current > 1 ? 's' : ''}` : '0 jour'}
        </div>

        {/* Bars : 10 derniers jours */}
        {history.length > 0 ? (
          <div className="flex gap-1">
            {history.map((win, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-sm ${win ? 'bg-accent' : 'bg-loss/60'}`}
                title={win ? 'Jour gagnant' : 'Jour perdant'}
              />
            ))}
            {Array.from({ length: Math.max(0, 10 - history.length) }).map((_, i) => (
              <div key={'pad-' + i} className="h-2 flex-1 rounded-sm bg-border" />
            ))}
          </div>
        ) : (
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-2 flex-1 rounded-sm bg-border" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
