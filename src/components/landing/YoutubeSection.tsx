import React, { useState } from 'react';
import { Youtube, Play, Radio, ArrowUpRight } from 'lucide-react';

// ─── Chaîne YouTube ──────────────────────────────────────────────────────
const CHANNEL_HANDLE = '@behindthetrades0';
const CHANNEL_URL = `https://www.youtube.com/${CHANNEL_HANDLE}`;
// /live redirige automatiquement vers le direct en cours OU vers la chaîne s'il n'y en a pas
const LIVE_URL = `${CHANNEL_URL}/live`;
const STREAMS_URL = `${CHANNEL_URL}/streams`;

// ─── Vidéos récentes ─────────────────────────────────────────────────────
// Pour mettre à jour : colle l'ID YouTube (la partie après "?v=" dans l'URL)
// Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ  →  id: 'dQw4w9WgXcQ'
// Le thumbnail est automatique : https://i.ytimg.com/vi/{id}/hqdefault.jpg
const RECENT_VIDEOS: { id: string; title: string; date: string }[] = [
  { id: '', title: 'Setup londonien : EUR/USD breakout du matin', date: 'Récent' },
  { id: '', title: 'Gestion du risque sur un compte FTMO 100k', date: 'Récent' },
  { id: '', title: 'Backtester ses setups en 2026', date: 'Récent' },
  { id: '', title: "Pourquoi je n'ai pas pris ce trade", date: 'Récent' },
];

// Backdrop pour la carte Live (image trading Unsplash)
const LIVE_BG = 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=2400&q=80';
// Fallback pour les vignettes vides
const VIDEO_FALLBACK = 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1200&q=80';

const thumbUrl = (id: string) =>
  id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : VIDEO_FALLBACK;
const watchUrl = (id: string) =>
  id ? `https://www.youtube.com/watch?v=${id}` : CHANNEL_URL;

const VideoThumb: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [errored, setErrored] = useState(false);
  return (
    <img
      src={errored ? VIDEO_FALLBACK : src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
    />
  );
};

export const YoutubeSection: React.FC = () => {
  return (
    <section id="youtube" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Youtube size={16} className="text-rose-500" />
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-rose-400">
                YouTube
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-white leading-[1.05]">
              Sessions live &amp; replay.
            </h2>
            <p className="text-white/55 mt-3 max-w-xl">
              Analyses marché en direct, debriefs de setup et leçons des trades
              récents — chaque semaine sur la chaîne Behind the Trades.
            </p>
          </div>
          <a
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/70 hover:text-white transition-colors whitespace-nowrap"
          >
            Voir la chaîne
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Live card */}
        <a
          href={LIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block rounded-2xl overflow-hidden glass-frost glass-rim mb-6 group"
          aria-label="Regarder le direct ou le dernier replay sur YouTube"
        >
          <div className="relative aspect-[21/9] md:aspect-[21/8]">
            <img
              src={LIVE_BG}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-[1.02] transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(40%_50%_at_30%_60%,rgba(243,108,0,0.18),transparent_70%)]" />

            <div className="relative h-full flex flex-col justify-end p-6 sm:p-10">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 self-start mb-4 rounded-full bg-rose-500/15 backdrop-blur-md border border-rose-500/30 px-3 py-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 animate-ping opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-300">
                  Live / Dernier replay
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2 leading-tight">
                Rejoignez la session en cours
              </h3>
              <p className="text-white/65 max-w-xl mb-6 text-[15px] leading-relaxed">
                Direct ou dernière diffusion — vous arrivez toujours sur la
                vidéo la plus récente de la chaîne.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-[13px] shadow-[0_10px_30px_-10px_rgba(244,63,94,0.6)] transition-all">
                  <Radio size={15} />
                  Regarder maintenant
                </span>
                <a
                  href={STREAMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl glass-subtle text-white/85 hover:text-white text-[13px] font-medium transition-colors"
                >
                  Tous les replays
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>

            {/* Decorative play */}
            <div className="hidden md:flex absolute top-1/2 right-12 -translate-y-1/2 h-20 w-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 items-center justify-center group-hover:bg-white/15 group-hover:scale-110 transition-all">
              <Play size={28} className="text-white fill-white translate-x-0.5" />
            </div>
          </div>
        </a>

        {/* Recent videos grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RECENT_VIDEOS.map((v, i) => (
            <a
              key={i}
              href={watchUrl(v.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass-frost glass-rim rounded-xl overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5"
            >
              <div className="relative aspect-video overflow-hidden">
                <VideoThumb src={thumbUrl(v.id)} alt={v.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Hover play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-500 shadow-lg">
                    <Play size={18} className="text-white fill-white translate-x-0.5" />
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="text-[14px] font-semibold text-white leading-snug line-clamp-2 group-hover:text-rose-300 transition-colors">
                  {v.title}
                </h4>
                <p className="text-[11px] text-white/45 mt-2">{v.date}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
