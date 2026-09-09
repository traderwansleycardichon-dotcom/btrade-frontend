import React, { useEffect, useState } from 'react';
import { Award, Star } from 'lucide-react';
import api from '../../lib/api';

export const BadgesPanel: React.FC = () => {
  const [badges, setBadges] = useState<any[]>([]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const { data } = await api.get('/api/badges');
        setBadges(data);
      } catch (err) {
        console.error("Impossible de charger les badges", err);
      }
    };
    fetchBadges();
  }, []);

  if (badges.length === 0) return null;

  return (
    <div className="glass p-6 rounded-3xl group mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Award className="text-accent w-5 h-5" />
          Vos Succès
        </h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {badges.map((b) => (
          <div key={b.id} className="relative flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/20 rounded-xl overflow-hidden group-hover:border-yellow-500/40 transition-colors" title={b.description}>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-txt">{b.type.replace('_', ' ')}</span>
              {b.level > 1 && (
                <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-wider">Niveau {b.level}</span>
              )}
            </div>
            <div className="absolute inset-0 dark:bg-white/5 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
};
