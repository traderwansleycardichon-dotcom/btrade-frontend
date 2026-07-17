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
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Nouveautés sur BTrade</h2>
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
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {updates.map((update) => (
            <div key={update.id} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black mono text-accent bg-accent/10 px-2 py-1 rounded">
                  v{update.version}
                </span>
                <span className="text-sm text-txt-3">
                  {new Date(update.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <h3 className="text-2xl font-bold">{update.title}</h3>
              <div 
                className="prose prose-invert prose-p:text-txt-2 prose-a:text-accent hover:prose-a:text-accent-2"
                dangerouslySetInnerHTML={{ __html: update.description }}
              />
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-border flex justify-end">
          <button
            onClick={handleClose}
            className="bg-accent text-white px-6 py-2.5 rounded-lg font-bold hover:bg-accent-2 transition"
          >
            J'ai compris, fermer
          </button>
        </div>

      </div>
    </div>
  );
}
