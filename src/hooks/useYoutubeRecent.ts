import { useEffect, useState } from 'react';
import api from '../lib/api';

export interface YoutubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: string | null;
  author?: string | null;
  description?: string | null;
  views?: number | null;
}

export interface YoutubeFeed {
  channelId: string;
  channelTitle: string | null;
  channelUrl: string;
  liveUrl: string;
  streamsUrl: string;
  fetchedAt: string;
  videos: YoutubeVideo[];
  cached?: boolean;
  stale?: boolean;
}

const FALLBACK_CHANNEL_ID = 'UCZhjqMdTyq5ssfr9sIxf3mw';
const FALLBACK_HANDLE = '@behindthetrades0';

/** Données par défaut (snapshot) — utilisées tant que l'API n'a pas répondu */
const FALLBACK: YoutubeFeed = {
  channelId: FALLBACK_CHANNEL_ID,
  channelTitle: 'Behind The Trades',
  channelUrl: `https://www.youtube.com/${FALLBACK_HANDLE}`,
  liveUrl: `https://www.youtube.com/${FALLBACK_HANDLE}/live`,
  streamsUrl: `https://www.youtube.com/${FALLBACK_HANDLE}/streams`,
  fetchedAt: new Date().toISOString(),
  videos: [
    {
      id: '8d59IFSiemg',
      title: 'Session institutionnelle — live',
      url: 'https://www.youtube.com/watch?v=8d59IFSiemg',
      thumbnail: 'https://i.ytimg.com/vi/8d59IFSiemg/hqdefault.jpg',
      publishedAt: '2026-05-29T14:07:25Z',
    },
    {
      id: '4-Q-jCbn-c4',
      title: 'Session institutionnelle — live',
      url: 'https://www.youtube.com/watch?v=4-Q-jCbn-c4',
      thumbnail: 'https://i.ytimg.com/vi/4-Q-jCbn-c4/hqdefault.jpg',
      publishedAt: '2026-05-29T03:33:09Z',
    },
    {
      id: 'RQ4dUOkY5GI',
      title: 'Session institutionnelle — live',
      url: 'https://www.youtube.com/watch?v=RQ4dUOkY5GI',
      thumbnail: 'https://i.ytimg.com/vi/RQ4dUOkY5GI/hqdefault.jpg',
      publishedAt: '2026-05-28T12:45:50Z',
    },
    {
      id: 'elMQu7A02mk',
      title: 'Session institutionnelle — live',
      url: 'https://www.youtube.com/watch?v=elMQu7A02mk',
      thumbnail: 'https://i.ytimg.com/vi/elMQu7A02mk/hqdefault.jpg',
      publishedAt: '2026-05-27T14:42:28Z',
    },
  ],
};

export const useYoutubeRecent = (limit = 6) => {
  const [feed, setFeed] = useState<YoutubeFeed>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/youtube/recent?limit=${limit}`);
        if (!cancelled && data?.success && data?.data?.videos?.length) {
          setFeed(data.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.error || 'youtube_fetch_failed');
          // on garde le fallback déjà en state — pas de re-render destructeur
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { feed, loading, error };
};
