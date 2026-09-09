import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CheckSquare, 
  LineChart, 
  Calendar, 
  BookOpen, 
  Layers, 
  BarChart3, 
  Newspaper, 
  Wallet, 
  CreditCard, 
  Settings,
  LifeBuoy,
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
  FileText,
  Lock,
  MessageSquare,
  Video,
  BrainCircuit,
  FlaskConical,
  Trophy
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAccounts } from '../../hooks/useAccounts';
import { useMultiAccountTrades } from '../../hooks/useMultiAccountTrades';
import { usePlan } from '../../hooks/usePlan';
import { useSettings } from '../../contexts/SettingsContext';
import { Modal } from '../ui/Modal';
import { Flame, BarChart2, Sun, Moon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { useQueryClient } from '@tanstack/react-query';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../contexts/ThemeContext';
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

/**
 * Sidebar Component
 * Gère la navigation principale de l'application Haitian Wall Street 
 * Les liens sont regroupés par sections logiques pour une meilleure UX.
 */

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isFree } = usePlan();
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const handleReturnToAdmin = () => {
    // Efface le cache pour éviter toute fuite de données entre les contextes
    queryClient.clear();
    navigate('/admin/dashboard');
  };

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
  const [selectedFeature, setSelectedFeature] = React.useState('');
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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
        { label: 'Trader Simulator', icon: BrainCircuit,   href: '/app/simulator',   proOnly: true },
        { label: 'Calendrier', icon: Calendar,        href: '/app/calendar' },
        { label: 'Playbooks',  icon: FileText,        href: '/app/playbooks' },
      ]
    },
    {
      title: 'Journal',
      items: [
        { label: 'Journal de trading', icon: BookOpen, href: '/app/journal' },
        { label: 'To-Do List',         icon: CheckSquare, href: '/app/todo' },
        { label: 'Psychologie',        icon: Brain,    href: '/app/psychology' },
        { label: 'Analyses techniques',icon: BarChart3,href: '/app/reports', proOnly: true },
      ]
    },
    {
      title: 'Finance',
      items: [
        { label: 'Patrimoine',  icon: Landmark,     href: '/app/patrimoine', proOnly: true },
        { label: 'Budget',      icon: CreditCard,   href: '/app/finance', proOnly: true },
        { label: 'Objectifs',   icon: Target,       href: '/app/goals', proOnly: true },
        { label: 'Retraits',    icon: ArrowUpRight, href: '/app/payouts', proOnly: true },
      ]
    },
    {
      title: 'Formation',
      items: [
        { label: 'Academy',           icon: GraduationCap, href: '/app/formation', badge: 'New', proOnly: true },
      ]
    },
    {
      title: 'IA',
      items: [
        { label: 'Insights IA',       icon: Sparkles, href: '/app/ai-insights', live: true, proOnly: true },
        { label: 'Calendrier Éco',    icon: Globe,    href: '/app/economic' },
      ]
    },
    {
      title: 'Système',
      items: [
        { label: 'Messages',        icon: MessageSquare, href: '/app/messages' },
        { label: 'Coaching 1-on-1', icon: Video,         href: '/app/coaching' },
        { label: 'Support & Aide',  icon: LifeBuoy,      href: '/app/support' },
        { label: 'Contrats',        icon: FileText,      href: '/app/contracts' },
        { label: 'Paramètres', icon: Settings,       href: '/app/settings' },
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
          bg-surface border-r border-border flex flex-col shrink-0
          fixed lg:sticky inset-y-0 left-0 z-50 lg:z-auto
          h-screen lg:top-0
          transition-all duration-300 ease-out
          ${mobileOpen ? 'translate-x-0 w-64' : `-translate-x-full lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'}`}
        `}
      >
      {/* Brand */}
      <div className={`p-5 lg:p-6 flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          {settings?.platform_logo ? (
            <img src={settings.platform_logo} alt="Logo Haitian Wall Street" className="h-8 w-auto object-contain shrink-0" />
          ) : (
            <>
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(243,108,0,0.4)]">
                <TrendingUp size={20} className="text-txt" />
              </div>
              {!isCollapsed && <span className="font-bold text-lg tracking-tight">Haitian Wall Street</span>}
            </>
          )}
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
      <nav className="flex-1 overflow-y-auto px-2 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className={`px-3 mb-2 text-[10px] font-bold text-txt-3 uppercase tracking-[0.2em] ${isCollapsed ? 'text-center' : ''}`}>
              {isCollapsed ? '—' : group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isLocked = item.proOnly && isFree;
                
                return (
                  <NavLink
                    key={item.href}
                    to={isLocked ? '#' : item.href}
                    title={isCollapsed ? item.label : undefined}
                    onClick={(e) => {
                      if (isLocked) {
                        e.preventDefault();
                        setSelectedFeature(item.label);
                        setIsUpgradeModalOpen(true);
                      } else if (onMobileClose) {
                        onMobileClose();
                      }
                    }}
                    className={({ isActive }) => cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all group overflow-hidden whitespace-nowrap",
                      isCollapsed ? "justify-center" : "justify-between",
                      isLocked
                        ? "text-txt-3/60 hover:text-txt hover:bg-elevated/40 cursor-pointer"
                        : isActive 
                          ? `bg-accent/10 text-accent border-l-2 border-accent ${isCollapsed ? '' : 'rounded-l-none'}`
                          : "text-txt-2 hover:text-txt hover:bg-elevated"
                    )}
                  >
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'w-full justify-center' : ''}`}>
                      <item.icon size={18} className={`shrink-0 ${isLocked ? "text-txt-3/50" : ""}`} />
                      {!isCollapsed && <span className={isLocked ? "opacity-60" : ""}>{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center gap-2">
                        {isLocked ? (
                          <Lock size={12} className="text-accent shrink-0" />
                        ) : (
                          <>
                            {item.live && (
                              <span className="text-[9px] font-black bg-accent text-white px-1.5 py-0.5 rounded leading-none animate-pulse">LIVE</span>
                            )}
                            {item.badge && (
                              <span className="text-[10px] font-bold bg-border text-txt-2 group-hover:bg-accent group-hover:text-txt px-1.5 py-0.5 rounded transition-colors shrink-0">
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all shrink-0" />
                          </>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profil (Masqué si collapsé) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 bg-elevated/50 p-2.5 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center font-bold text-lg text-txt shadow-lg overflow-hidden border border-border/10 shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{user?.fullName || 'Utilisateur'}</div>
              <div className="text-[10px] font-bold text-accent uppercase tracking-tighter">Plan {user?.plan || 'Free'}</div>
            </div>
            <button 
              onClick={toggleTheme}
              className="p-2 text-txt-2 hover:text-txt transition-colors"
              title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={logout}
              className="p-2 text-txt-2 hover:text-loss transition-colors"
              title="Se déconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>

          {['admin', 'cto', 'staff'].includes(user?.role || '') && (
            <button
              onClick={handleReturnToAdmin}
              className="w-full flex items-center justify-center gap-2 py-2 mt-2 bg-loss/10 text-loss rounded-lg font-bold hover:bg-loss/20 transition-colors border border-loss/20 text-xs"
            >
              {user?.role === 'cto' ? 'Retour CTO Panel' : user?.role === 'staff' ? 'Retour Staff Panel' : 'Retour SuperAdmin'}
            </button>
          )}
        </div>
      )}

      {/* Streak (Masqué si collapsé) */}
      {!isCollapsed && <WinningStreakBlock />}

      {/* Collapse Toggle */}
      <div className={`p-4 border-t border-border flex ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-2 rounded-lg text-txt-2 hover:bg-elevated hover:text-txt transition-colors"
          title={isCollapsed ? "Ouvrir" : "Fermer"}
        >
          <ChevronRight size={18} className={`transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>
      </aside>

      {/* Upgrade Gating Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="💎 Fonctionnalité Premium Haitian Wall Street"
        size="md"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-16 h-16 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4 animate-bounce">
            <Sparkles size={28} />
          </div>
          
          <h3 className="text-lg font-black mb-2">
            Débloquez l'accès à : {selectedFeature}
          </h3>
          
          <p className="text-sm text-txt-2 max-w-sm mb-6 leading-relaxed">
            Cette fonctionnalité exclusive fait partie du plan <b>Haitian Wall Street Pro</b>. Améliorez votre expérience de trading avec nos outils professionnels avancés.
          </p>

          <div className="w-full bg-bg/50 border border-border rounded-2xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-win font-bold">✓</span>
              <span className="text-xs text-txt-2 font-medium">🎓 <b>Academy</b> — Cours, formations et tutoriels exclusifs</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-win font-bold">✓</span>
              <span className="text-xs text-txt-2 font-medium">🧠 <b>Insights IA</b> — Analyses de performances par IA</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-win font-bold">✓</span>
              <span className="text-xs text-txt-2 font-medium">💬 <b>Chat IA</b> — Session de chat intelligente avec Claude/GPT</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-win font-bold">✓</span>
              <span className="text-xs text-txt-2 font-medium">📈 <b>Analyses avancées</b> — Outils d'analyses de vos setups</span>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => setIsUpgradeModalOpen(false)}
              className="flex-1 py-3 rounded-xl border border-border font-bold hover:dark:bg-white/5 bg-black/5 transition-all text-xs"
            >
              Plus tard
            </button>
            <button
              onClick={() => {
                setIsUpgradeModalOpen(false);
                navigate('/app/upgrade');
              }}
              className="flex-1 bg-accent hover:bg-accent/90 text-white py-3 rounded-xl font-bold transition-all text-xs shadow-md hover:scale-105"
            >
              Découvrir les plans Pro
            </button>
          </div>
        </div>
      </Modal>
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
