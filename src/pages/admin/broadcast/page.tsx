import React, { useState } from 'react';
import { Megaphone, Send, Info, AlertTriangle, CheckCircle, Zap, Clock } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const { addToast } = useToast();

  React.useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // On récupère les notifications de type system envoyées récemment
      // Note: On peut aussi créer un endpoint dédié plus tard
      const res = await api.get('/api/admin/broadcast/history');
      setHistory(res.data.data);
    } catch (err) {
      console.error('Erreur history:', err);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    if (!confirm('Êtes-vous sûr de vouloir envoyer ce message à TOUS les utilisateurs ?')) return;

    setLoading(true);
    try {
      const res = await api.post('/api/admin/broadcast', { title, body });
      addToast(res.data.data.message, 'success');
      setTitle('');
      setBody('');
      fetchHistory();
    } catch (err) {
      addToast('Erreur lors de l\'envoi du broadcast', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center">
        <div className="w-16 h-16 bg-loss/10 text-loss rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Megaphone size={32} />
        </div>
        <h1 className="text-2xl font-black mb-2">Broadcast Global</h1>
        <p className="text-txt-2 text-sm">Envoyez une notification système à l'ensemble des membres de Behind The Trade.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleBroadcast} className="glass p-8 rounded-3xl border border-border space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Titre du Message</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ex: Maintenance Prévue"
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:border-loss/50 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Contenu du Message</label>
            <textarea 
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Décrivez l'annonce ici..."
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:border-loss/50 outline-none transition-all h-48 resize-none"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !title || !body}
            className="w-full btn-primary bg-loss hover:bg-loss/80 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(239,68,68,0.2)]"
          >
            <Send size={18} />
            {loading ? 'Envoi en cours...' : 'Diffuser le message'}
          </button>
        </form>

        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-border">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Info size={18} className="text-accent" />
              Directives d'envoi
            </h3>
            <ul className="text-xs text-txt-2 space-y-3 leading-relaxed">
              <li className="flex gap-2">
                <CheckCircle size={14} className="text-win shrink-0" />
                Le message apparaîtra instantanément dans le centre de notifications de tous les utilisateurs.
              </li>
              <li className="flex gap-2">
                <CheckCircle size={14} className="text-win shrink-0" />
                Utilisez des titres courts et percutants pour un meilleur engagement.
              </li>
              <li className="flex gap-2">
                <AlertTriangle size={14} className="text-loss shrink-0" />
                Action irréversible : une fois envoyé, vous ne pourrez pas annuler la notification individuellement.
              </li>
            </ul>
          </div>

          <div className="glass p-6 rounded-3xl border border-loss/20 bg-loss/5">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-loss">
              <Zap size={18} />
              Aperçu en temps réel
            </h3>
            <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-loss/10 text-loss flex items-center justify-center shrink-0">
                  <Megaphone size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-txt mb-1">
                    [BROADCAST] {title || "Titre de l'annonce"}
                  </div>
                  <div className="text-[10px] text-txt-2 line-clamp-2">
                    {body || "Le contenu de votre message s'affichera ici pour tous les traders..."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-surface/50 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <Clock size={18} className="text-txt-3" />
            Historique des diffusions
          </h3>
        </div>
        <div className="divide-y divide-border/50">
          {history.length === 0 ? (
            <div className="p-8 text-center text-txt-3 italic">Aucun broadcast envoyé récemment.</div>
          ) : history.map((item) => (
            <div key={item.id} className="p-4 hover:bg-surface/50 transition-colors flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-loss/10 text-loss rounded-lg">
                  <Megaphone size={16} />
                </div>
                <div>
                  <div className="text-sm font-bold">{item.titre}</div>
                  <div className="text-xs text-txt-2 line-clamp-1">{item.body}</div>
                </div>
              </div>
              <div className="text-[10px] font-bold text-txt-3 uppercase">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
