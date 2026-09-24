import React, { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';
import api from '../../lib/api';

interface SystemUpdate {
  id: string;
  version: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function SystemUpdatesModal() {
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<SystemUpdate | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const { data } = await api.get('/api/system-updates');
        
        if (data.updates && data.updates.length > 0) {
          const latestUpdate = data.updates[0];
          const lastRead = data.lastReadAt ? new Date(data.lastReadAt) : null;
          const updateDate = new Date(latestUpdate.createdAt);

          if (!lastRead || updateDate > lastRead) {
            setUpdates(data.updates);
            setSelectedUpdate(latestUpdate);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch system updates', err);
      }
    };
    fetchUpdates();
  }, []);

  const handleClose = async () => {
    setIsOpen(false);
    try {
      await api.post('/api/system-updates/mark-read');
    } catch (err) {
      console.error('Failed to mark updates as read', err);
    }
  };

  if (!isOpen || updates.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg text-txt w-full max-w-2xl rounded-2xl border border-border shadow-2xl flex flex-col max-h-[85vh] animate-[fadeIn_0.2s_ease-out]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Nouveautés sur BEHIND THE TRADES</h2>
              <p className="text-sm text-txt-3">Découvrez ce qui a changé depuis votre dernière connexion.</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-txt-3 hover:text-txt transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto flex-1">
          {selectedUpdate && (
            <div className="space-y-3 animate-[fadeIn_0.2s_ease-out]" key={selectedUpdate.id}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black mono text-accent bg-accent/10 px-2 py-1 rounded">
                  v{selectedUpdate.version}
                </span>
                <span className="text-sm text-txt-3">
                  {new Date(selectedUpdate.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <h3 className="text-2xl font-bold">{selectedUpdate.title}</h3>
              <div 
                className="whitespace-pre-wrap prose prose-invert prose-p:text-txt-2 prose-a:text-accent hover:prose-a:text-accent-2"
                dangerouslySetInnerHTML={{ __html: selectedUpdate.description }}
              />
            </div>
          )}
        </div>

        {/* OLDER UPDATES (BUTTONS) */}
        {updates.length > 1 && (
          <div className="px-6 py-4 bg-elevated/30 border-t border-border flex flex-col gap-2 shrink-0">
            <h4 className="text-xs font-bold text-txt-3 uppercase tracking-wider">Mises à jour disponibles</h4>
            <div className="flex flex-wrap gap-2">
              {updates.map((update) => (
                <button
                  key={update.id}
                  onClick={() => setSelectedUpdate(update)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                    selectedUpdate?.id === update.id 
                      ? 'bg-accent/20 border-accent/40 text-accent' 
                      : 'bg-surface border-border text-txt-2 hover:bg-elevated hover:text-txt'
                  }`}
                >
                  v{update.version}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="p-6 border-t border-border flex justify-end shrink-0">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-accent hover:bg-accent/90 text-white font-bold rounded-lg transition"
          >
            J'ai compris
          </button>
        </div>

      </div>
    </div>
  );
}
