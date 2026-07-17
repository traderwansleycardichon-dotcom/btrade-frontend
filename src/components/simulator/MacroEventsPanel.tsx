import React, { useEffect, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, Clock, Globe } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

interface MacroEvent {
  id: string;
  titre: string;
  dateEvent: string;
  pays: string;
  importance: number;
  valeurPrev?: number;
  valeurConsensus?: number;
  valeurActual?: number;
}

export function MacroEventsPanel() {
  const [events, setEvents] = useState<MacroEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayEvents();
  }, []);

  const fetchTodayEvents = async () => {
    try {
      setLoading(true);
      const today = new Date();
      // Set to beginning of today
      const from = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      // Set to 7 days ahead
      const to = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const res = await api.get('/api/macro/events', { params: { from, to } });
      const fetchedEvents = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      // Filter out events that are too old (more than 2 hours ago)
      const nowTime = today.getTime();
      const upcoming = fetchedEvents.filter((e: any) => {
         const d = new Date(e.dateEvent || e.date_event).getTime();
         return d > nowTime - 2 * 60 * 60 * 1000;
      });

      // Sort by time
      upcoming.sort((a: any, b: any) => new Date(a.dateEvent || a.date_event).getTime() - new Date(b.dateEvent || b.date_event).getTime());

      // Limit to 10
      setEvents(upcoming.slice(0, 10));
    } catch (err: any) {
      console.error('Error fetching macro events', err);
      toast.error('Erreur lors du chargement des nouvelles économiques');
    } finally {
      setLoading(false);
    }
  };

  const getImportanceStars = (importance: number) => {
    const color = importance === 3 ? 'text-red-500' : importance === 2 ? 'text-orange-500' : 'text-yellow-500';
    return (
      <div className={`flex gap-0.5 ${color}`}>
        {Array.from({ length: importance }).map((_, i) => (
          <AlertCircle key={i} className="w-3 h-3 fill-current" />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-surface border border-border rounded-lg overflow-hidden">
      <div className="p-3 border-b border-border bg-background/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-text text-sm">Calendrier Économique (À venir)</h3>
        </div>
        <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
          {events.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-text-muted">
            <Globe className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Aucune nouvelle majeure aujourd'hui</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {events.map((event) => {
              const eventDate = new Date(event.dateEvent || (event as any).date_event);
              const isPast = eventDate.getTime() < new Date().getTime();

              return (
                <div key={event.id} className={`p-3 flex items-center gap-3 hover:bg-white/5 transition-colors ${isPast ? 'opacity-60' : ''}`}>
                  <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-xs font-mono font-bold text-text">{format(eventDate, 'HH:mm')}</span>
                    <span className="text-[10px] text-text-muted font-bold">{event.pays}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-text truncate" title={event.titre}>
                      {event.titre}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-text-muted">
                      {event.valeurActual !== undefined && event.valeurActual !== null && (
                         <span>Act: {Number(event.valeurActual)}</span>
                      )}
                      {event.valeurConsensus !== undefined && event.valeurConsensus !== null && (
                         <span>Prév: {Number(event.valeurConsensus)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {getImportanceStars(event.importance || 1)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
