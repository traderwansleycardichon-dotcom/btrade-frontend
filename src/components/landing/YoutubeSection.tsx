import React, { useState } from 'react';
import { Youtube, Play, Radio, ArrowUpRight } from 'lucide-react';
import { useYoutubeRecent } from '../../hooks/useYoutubeRecent';

// ─── Embeds ──────────────────────────────────────────────────────────────
const liveEmbed = (channelId: string) =>
  `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&rel=0`;
const videoEmbed = (id: string) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

const thumbMax = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
const thumbHq = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

// Date relative simple
const relativeDate = (iso: string | null): string => {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffH = Math.round((now - then) / 36e5);
  if (diffH < 1) return "à l'instant";
  if (diffH < 24) return `il y a ${diffH} h`;
  const d = Math.round(diffH / 24);
  if (d === 1) return 'hier';
  if (d < 7) return `il y a ${d} j`;
  const w = Math.round(d / 7);
  return w === 1 ? 'il y a 1 sem' : `il y a ${w} sem`;
};

// Coupe les titres très longs et nettoie les suffixes type ",This is not financial advice. ⚠️"
const cleanTitle = (raw: string): string => {
  if (!raw) return '';
  const cut = raw.split(/,\s*This is not financial advice|,\s*This is not/i)[0];
  return cut.replace(/Behind The Trades\s*\|\s*/i, '').trim() || raw.trim();
};

// ─── Thumbnail avec fallback maxres → hq ─────────────────────────────────
const Thumb: React.FC<{ id: string; alt: string; className?: string }> = ({
  id,
  alt,
  className = '',
}) => {
  const [src, setSrc] = useState(thumbMax(id));
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => {
        if (src.includes('maxres')) setSrc(thumbHq(id));
      }}
      className={className}
    />
  );
};

// ─── Carte vidéo avec embed click-to-play ────────────────────────────────
const VideoCard: React.FC<{
  id: string;
  title: string;
  publishedAt: string | null;
}> = ({ id, title, publishedAt }) => {
  const [playing, setPlaying] = useState(false);
  const cleaned = cleanTitle(title);
  return (
    <div className="group glass-frost glass-rim rounded-xl overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5">
      <div className="relative aspect-video overflow-hidden bg-black">
        {playing ? (
          <iframe
            src={videoEmbed(id)}
            title={cleaned}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full"
            aria-label={`Lire : ${cleaned}`}
          >
            <Thumb
              id={id}
              alt={cleaned}
              className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-rose-500 shadow-[0_8px_24px_rgba(244,63,94,0.55)] group-hover:scale-110 transition-transform">
                <Play size={18} className="text-white fill-white translate-x-0.5" />
              </span>
            </div>
          </button>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h4 className="text-[14px] font-semibold text-white leading-snug line-clamp-2 group-hover:text-rose-300 transition-colors">
          {cleaned}
        </h4>
        <p className="text-[11px] text-white/45 mt-2">{relativeDate(publishedAt)}</p>
      </div>
    </div>
  );
};

// ─── Section principale ──────────────────────────────────────────────────
export const YoutubeSection: React.FC = () => {
  const [liveOn, setLiveOn] = useState(false);
  const { feed } = useYoutubeRecent(4);

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
              Sessions live &amp; replays.
            </h2>
            <p className="text-white/55 mt-3 max-w-xl">
              Analyses marché en direct, debriefs institutionnels et lecture des
              flux temps réel — sur la chaîne {feed.channelTitle || 'Behind The Trades'}.
            </p>
          </div>
          <a
            href={feed.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/70 hover:text-white transition-colors whitespace-nowrap"
          >
            Voir la chaîne
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Live card — click to embed */}
        <div className="relative rounded-2xl overflow-hidden glass-frost glass-rim mb-6">
          <div className="relative aspect-[21/9] md:aspect-[21/8] bg-black">
            {liveOn ? (
              <iframe
                src={liveEmbed(feed.channelId)}
                title={`Live ${feed.channelTitle || 'YouTube'}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <>
                {feed.videos[0] && (
                  <Thumb
                    id={feed.videos[0].id}
                    alt="Cover du live"
                    className="absolute inset-0 h-full w-full object-cover opacity-65"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/55 to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(40%_50%_at_30%_60%,rgba(243,108,0,0.18),transparent_70%)]" />

                <div className="relative h-full flex flex-col justify-end p-6 sm:p-10">
                  <div className="inline-flex items-center gap-2 self-start mb-4 rounded-full bg-rose-500/20 backdrop-blur-md border border-rose-500/35 px-3 py-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 animate-ping opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-rose-200">
                      Live / Dernier replay
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2 leading-tight">
                    Session institutionnelle en direct
                  </h3>
                  <p className="text-white/65 max-w-xl mb-6 text-[15px] leading-relaxed">
                    Cliquez pour lancer le live en cours — ou la dernière
                    diffusion si la chaîne est hors-ligne.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLiveOn(true)}
                      className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-[13px] shadow-[0_10px_30px_-10px_rgba(244,63,94,0.6)] transition-all"
                    >
                      <Radio size={15} />
                      Lancer le live ici
                    </button>
                    <a
                      href={feed.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl glass-subtle text-white/85 hover:text-white text-[13px] font-medium transition-colors"
                    >
                      Ouvrir sur YouTube
                      <ArrowUpRight size={13} />
                    </a>
                    <a
                      href={feed.streamsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl text-white/65 hover:text-white text-[13px] font-medium transition-colors"
                    >
                      Tous les replays
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setLiveOn(true)}
                  aria-label="Lancer le live"
                  className="hidden md:flex absolute top-1/2 right-12 -translate-y-1/2 h-20 w-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 items-center justify-center hover:bg-white/15 hover:scale-110 transition-all"
                >
                  <Play size={28} className="text-white fill-white translate-x-0.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent videos grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {feed.videos.slice(0, 4).map((v) => (
            <VideoCard
              key={v.id}
              id={v.id}
              title={v.title}
              publishedAt={v.publishedAt}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
