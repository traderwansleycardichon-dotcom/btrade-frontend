import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Upload, Bell, Command, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useNotifications } from '../../hooks/useNotifications';
import { ImportTradesModal } from '../trading/ImportTradesModal';

interface TopBarProps {
  onOpenMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMenu }) => {
  const location = useLocation();
  const [now, setNow] = useState(new Date());
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { unreadCount } = useNotifications();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/trades')) return 'Trades';
    if (path.includes('/calendar')) return 'Calendrier';
    if (path.includes('/accounts')) return 'Comptes';
    if (path.includes('/payouts')) return 'Retraits';
    if (path.includes('/journal')) return 'Journal';
    if (path.includes('/psychology')) return 'Psychologie';
    if (path.includes('/playbooks')) return 'Playbooks';
    if (path.includes('/economic')) return 'Calendrier Éco';
    if (path.includes('/ai-chat')) return 'Chat IA';
    if (path.includes('/ai-insights')) return 'Insights IA';
    if (path.includes('/finance')) return 'Finance';
    if (path.includes('/goals')) return 'Objectifs';
    if (path.includes('/patrimoine')) return 'Patrimoine';
    if (path.includes('/formation')) return 'Academy';
    if (path.includes('/settings')) return 'Paramètres';
    if (path.includes('/reports')) return 'Analyses';
    return 'BTrade';
  };

  return (
    <header className="h-14 sm:h-16 bg-surface/50 backdrop-blur-xl border-b border-border px-3 sm:px-5 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
        {/* Hamburger mobile */}
        <button
          onClick={onOpenMenu}
          className="lg:hidden p-1.5 -ml-1 text-txt-2 hover:text-txt hover:bg-elevated rounded-lg transition-colors flex-shrink-0"
          title="Menu"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-base sm:text-xl font-bold text-txt truncate">
          {getPageTitle()}
        </h1>

        <div className="h-4 w-px bg-border hidden sm:block flex-shrink-0" />

        <div className="text-xs sm:text-sm text-txt-2 hidden md:block flex-shrink-0">
          {format(now, "EEE d MMM", { locale: fr })}
          <span className="mx-1">·</span>
          <span className="font-mono text-txt font-medium">{format(now, "HH:mm")}</span>
          <span className="text-[10px] ml-1 font-bold hidden lg:inline">GMT+1</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Search — desktop seulement */}
        <div className="relative group hidden xl:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-3 group-focus-within:text-accent transition-colors"
            size={14}
          />
          <input
            type="text"
            placeholder="Recherche..."
            className="bg-elevated/50 border border-border rounded-xl py-2 pl-9 pr-11 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all w-56"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-surface px-1.5 py-0.5 rounded border border-border text-[10px] font-bold text-txt-3">
            <Command size={9} /> K
          </div>
        </div>

        {/* Bouton recherche mobile/tablet */}
        <button className="xl:hidden p-2 text-txt-2 hover:text-txt hover:bg-elevated rounded-xl transition-colors">
          <Search size={18} />
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2 hover:text-txt hover:bg-elevated rounded-xl transition-colors relative ${isNotifOpen ? 'text-txt bg-elevated' : 'text-txt-2'}`}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse" />
            )}
          </button>
          
          <NotificationsDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        <button 
          onClick={() => setIsImportOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-2 text-xs font-bold text-txt-2 hover:text-txt hover:bg-elevated rounded-xl transition-colors"
        >
          <Upload size={16} />
          <span>Importer</span>
        </button>

        <ImportTradesModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      </div>
    </header>
  );
};
