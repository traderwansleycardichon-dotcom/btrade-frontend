import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Plus, Upload, Bell, Command, Menu } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { NotificationsDropdown } from './NotificationsDropdown';
import { ImportTradesModal } from '../trading/ImportTradesModal';
import { useNotifications } from '../../hooks/useNotifications';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
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
    if (path.includes('/trades')) return 'Journal des Trades';
    if (path.includes('/calendar')) return 'Calendrier P&L';
    if (path.includes('/accounts')) return 'Mes Comptes';
    if (path.includes('/payouts')) return 'Paiements & Retraits';
    if (path.includes('/journal')) return 'Journal de Trading';
    if (path.includes('/playbooks')) return 'Mes Playbooks';
    if (path.includes('/settings')) return 'Paramètres';
    return 'BTrade';
  };

  return (
    <header className="h-16 bg-surface/50 backdrop-blur-xl border-b border-border px-4 lg:px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4 lg:gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-txt-2 hover:bg-elevated rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base sm:text-lg lg:text-xl font-bold text-txt truncate max-w-[150px] lg:max-w-none">{getPageTitle()}</h1>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <div className="text-sm text-txt-2 hidden md:block">
          {format(now, "EEEE d MMMM", { locale: fr })} <span className="mx-1">·</span> 
          <span className="font-mono text-txt font-medium">{format(now, "HH:mm")}</span> 
          <span className="text-[10px] ml-1 font-bold">GMT+1</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative group hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-3 group-focus-within:text-accent transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Recherche..." 
            className="bg-elevated/50 border border-border rounded-xl py-2 pl-10 pr-12 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all w-64"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-surface px-1.5 py-0.5 rounded border border-border text-[10px] font-bold text-txt-3">
            <Command size={10} /> K
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`p-2 rounded-xl transition-all relative ${isNotifOpen ? 'text-accent bg-accent/10' : 'text-txt-2 hover:text-txt hover:bg-elevated'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-surface animate-pulse" />
            )}
          </button>
          
          <NotificationsDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          
          <button 
            onClick={() => setIsImportOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-bold text-txt-2 hover:text-txt hover:bg-elevated rounded-xl transition-all"
          >
            <Upload size={18} />
            <span>Importer</span>
          </button>

          <ImportTradesModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

          <button className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-2 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(243,108,0,0.2)] active:scale-95">
            <Plus size={18} />
            <span>Nouveau Trade</span>
          </button>
        </div>
      </div>
    </header>
  );
};
