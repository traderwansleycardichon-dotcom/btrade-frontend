import React, { useRef, useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Bell, Check, Info, AlertTriangle, Target, Wallet, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal } from '../ui/Modal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'system': return <Info size={16} className="text-accent" />;
    case 'alert': return <AlertTriangle size={16} className="text-loss" />;
    case 'goal': return <Target size={16} className="text-win" />;
    case 'finance': return <Wallet size={16} className="text-win" />;
    default: return <Bell size={16} className="text-txt-3" />;
  }
};

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Réinitialise la notification sélectionnée à chaque fois que le dropdown
  // s'ouvre ou se ferme — empêche le modal de réapparaître automatiquement
  useEffect(() => {
    if (!isOpen) {
      setSelectedNotif(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;


  return (
    <>
      <div 
        ref={dropdownRef}
        className="absolute top-14 right-8 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-[fadeIn_0.2s_ease-out]"
      >
        <div className="p-4 border-b border-border flex justify-between items-center bg-elevated/50">
          <div className="flex items-center gap-2">
            <h3 className="font-bold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllAsRead.mutate()}
              className="text-[10px] font-bold text-accent hover:text-txt uppercase tracking-widest transition-colors"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-txt-3 text-sm italic">
              Aucune notification pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notifications.map((notif: any) => (
                <div 
                  key={notif.id}
                  className={`p-4 hover:bg-elevated/50 transition-colors cursor-pointer flex gap-4 ${notif.lu ? 'opacity-60' : 'bg-accent/5'}`}
                  onClick={() => {
                    if (!notif.lu) markAsRead.mutate(notif.id);
                    if (notif.type === 'NEW_MESSAGE') {
                      onClose();
                      if (user?.role === 'admin') {
                        navigate('/admin/messaging');
                      } else {
                        navigate('/app/messages');
                      }
                    } else {
                      setSelectedNotif(notif);
                    }
                  }}
                >
                  <div className="shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-elevated flex items-center justify-center">
                      {getIconForType(notif.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm ${notif.lu ? 'font-medium' : 'font-bold'}`}>{notif.titre}</h4>
                    {notif.body && (
                      <p className="text-xs text-txt-2 mt-1 line-clamp-2">{notif.body}</p>
                    )}
                    <div className="text-[10px] text-txt-3 mt-2">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                    </div>
                  </div>
                  {!notif.lu && (
                    <div className="shrink-0">
                      <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedNotif}
        onClose={() => setSelectedNotif(null)}
        title={selectedNotif?.titre || 'Notification'}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-elevated/50 border border-border/50">
            <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border">
              {selectedNotif && getIconForType(selectedNotif.type)}
            </div>
            <div>
              <div className="text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-0.5">Catégorie</div>
              <div className="text-sm font-bold capitalize text-accent">{selectedNotif?.type}</div>
            </div>
          </div>

          <div className="text-txt-2 text-sm leading-relaxed whitespace-pre-wrap">
            {selectedNotif?.body}
          </div>

          <div className="pt-4 border-t border-border flex items-center gap-2 text-txt-3">
            <Clock size={14} />
            <span className="text-xs">
              Reçu {selectedNotif && formatDistanceToNow(new Date(selectedNotif.createdAt), { addSuffix: true, locale: fr })}
            </span>
          </div>

          <button
            onClick={() => setSelectedNotif(null)}
            className="w-full py-3 bg-accent hover:bg-accent-2 text-white font-bold rounded-xl transition-all shadow-lg shadow-accent/20 mt-4"
          >
            Fermer
          </button>
        </div>
      </Modal>
    </>
  );
};

