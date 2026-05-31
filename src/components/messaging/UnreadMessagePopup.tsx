import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUnreadMessagesCount } from '../../hooks/useMessaging';
import { MessageSquare, AlertCircle } from 'lucide-react';

export const UnreadMessagePopup: React.FC = () => {
  const { user } = useAuth();
  const { data: count = 0 } = useUnreadMessagesCount();
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  
  const isAdmin = user?.role === 'admin';

  // Affiche le popup de manière récurrente (toutes les 20 secondes) s'il y a des non-lus
  useEffect(() => {
    if (count > 0) {
      setVisible(true);
      const interval = setInterval(() => {
        setVisible(true);
      }, 20000); // Popup réapparaît toutes les 20 secondes si on le ferme sans lire
      return () => clearInterval(interval);
    } else {
      setVisible(false);
    }
  }, [count]);

  if (!visible || count === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-[slideUp_0.4s_ease-out]">
      <div className="bg-surface border-2 border-accent rounded-2xl shadow-[0_10px_40px_-10px_rgba(243,108,0,0.4)] p-4 w-80 max-w-[calc(100vw-2rem)]">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <MessageSquare size={20} className="text-accent" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-txt flex items-center gap-1.5">
              <AlertCircle size={14} className="text-accent" />
              Message important
            </h4>
            <p className="text-xs text-txt-2 mt-1 leading-relaxed">
              {isAdmin 
                ? "Un utilisateur vous a répondu. Veuillez lire le message pour retirer cette notification."
                : "L'administrateur vous a envoyé un message. Veuillez le lire pour retirer cette notification."}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button 
            onClick={() => setVisible(false)}
            className="flex-1 py-2 rounded-xl text-xs font-medium border border-border hover:bg-elevated transition-colors"
          >
            Plus tard
          </button>
          <button 
            onClick={() => {
              setVisible(false);
              navigate(isAdmin ? '/admin/messaging' : '/app/messages');
            }}
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-accent hover:bg-accent-2 text-white transition-colors shadow-lg shadow-accent/20"
          >
            Lire le message
          </button>
        </div>
      </div>
    </div>
  );
};
