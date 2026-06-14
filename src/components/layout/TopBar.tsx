import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Upload, Bell, Command, Menu, Volume2, VolumeX } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NotificationsDropdown } from './NotificationsDropdown';
import { useNotifications } from '../../hooks/useNotifications';
import { useSound } from '../../context/SoundContext';
import { ImportTradesModal } from '../trading/ImportTradesModal';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../hooks/useAuth';
import { DiscordUpgradeModal } from '../modals/DiscordUpgradeModal';

interface TopBarProps {
  onOpenMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMenu }) => {
  const location = useLocation();
  const [now, setNow] = useState(new Date());
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { muted, toggleMute } = useSound();
  const { settings } = useSettings();
  const { user } = useAuth();
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);

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
    return 'Behind The Trade';
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
        {/* Telegram — visible à tous */}
        {settings.telegram_link && (
          <a
            href={settings.telegram_link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-txt-2 hover:text-[#229ED9] hover:bg-elevated rounded-xl transition-colors hidden sm:flex items-center"
            title="Rejoindre Telegram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.36l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.537-.194 1.006.131.978.198z" />
            </svg>
          </a>
        )}

        {/* Discord — PRO seulement */}
        {settings.discord_link && (
          <button
            onClick={() => {
              if (user?.plan === 'pro') {
                window.open(settings.discord_link, '_blank', 'noopener,noreferrer');
              } else {
                setIsDiscordModalOpen(true);
              }
            }}
            className="p-2 text-txt-2 hover:text-[#5865F2] hover:bg-elevated rounded-xl transition-colors hidden sm:flex items-center"
            title="Communauté Discord"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </button>
        )}

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
          onClick={toggleMute}
          className="p-2 text-txt-2 hover:text-txt hover:bg-elevated rounded-xl transition-colors"
          title={muted ? 'Activer le son' : 'Désactiver le son'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <button
          onClick={() => setIsImportOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-2 text-xs font-bold text-txt-2 hover:text-txt hover:bg-elevated rounded-xl transition-colors"
        >
          <Upload size={16} />
          <span>Importer</span>
        </button>

        <ImportTradesModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      </div>

      {isDiscordModalOpen && (
        <DiscordUpgradeModal onClose={() => setIsDiscordModalOpen(false)} />
      )}
    </header>
  );
};
