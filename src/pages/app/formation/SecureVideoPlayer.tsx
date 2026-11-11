import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { clickable } from '../../../lib/a11y';

interface SecureVideoPlayerProps {
  videoId: string;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

let apiLoaded = false;
let callbacks: (() => void)[] = [];

// Helper to load the YouTube API globally once
function loadYoutubeApi(callback: () => void) {
  if (apiLoaded || (window.YT && window.YT.Player)) {
    callback();
    return;
  }
  callbacks.push(callback);
  
  const existingScript = document.getElementById('youtube-iframe-api-script') as HTMLScriptElement | null;
  if (existingScript) {
    if (existingScript.src && !existingScript.src.includes('youtube.com/iframe_api')) {
      // Recreate script if pointing to an invalid source (like youtube-nocookie.com/iframe_api)
      existingScript.remove();
    } else {
      // Script tag already exists and is correct. Poll for initialization.
      const interval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(interval);
          apiLoaded = true;
          callbacks.forEach(cb => cb());
          callbacks = [];
        }
      }, 100);
      return;
    }
  }
  
  // Assign the callback before appending script to prevent race conditions
  window.onYouTubeIframeAPIReady = () => {
    apiLoaded = true;
    callbacks.forEach(cb => cb());
    callbacks = [];
  };

  const tag = document.createElement('script');
  tag.id = 'youtube-iframe-api-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
}

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({ videoId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log("SecureVideoPlayer: videoId changed to", videoId);
    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    loadYoutubeApi(() => {
      if (!isMounted) {
        console.log("SecureVideoPlayer: callback triggered after unmount, ignoring.");
        return;
      }
      if (!playerContainerRef.current) {
        console.warn("SecureVideoPlayer: player container element not found in DOM");
        return;
      }

      console.log("SecureVideoPlayer: Initializing YT.Player for videoId", videoId);
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,           // Hide standard controls
          disablekb: 1,          // Disable keyboard shortcuts
          fs: 0,                 // Hide full screen button
          modestbranding: 1,     // Minimize branding
          rel: 0,                // Do not show unrelated videos
          showinfo: 0,
          iv_load_policy: 3,     // Hide video annotations
          autohide: 1,
          enablejsapi: 1,        // REQUIRED to control player via iframe API
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            if (!isMounted) return;
            console.log("SecureVideoPlayer: Player onReady event triggered");
            setIsReady(true);
            setDuration(event.target.getDuration());
            event.target.setVolume(volume);
          },
          onStateChange: (event: any) => {
            if (!isMounted) return;
            console.log("SecureVideoPlayer: Player state changed to", event.data);
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            const state = event.data;
            if (state === 1) {
              setIsPlaying(true);
              startTimeProgress();
            } else {
              setIsPlaying(false);
              stopTimeProgress();
            }
          },
          onError: (event: any) => {
            console.error("SecureVideoPlayer: Player error occurred:", event.data);
          }
        }
      });
    });

    return () => {
      console.log("SecureVideoPlayer: cleaning up player for videoId", videoId);
      isMounted = false;
      stopTimeProgress();
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  // Handle auto-hiding controls when inactive
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  const startTimeProgress = () => {
    stopTimeProgress();
    progressIntervalRef.current = window.setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);
  };

  const stopTimeProgress = () => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    console.log("SecureVideoPlayer: togglePlay triggered. isReady =", isReady, "playerRef.current =", playerRef.current ? "exists" : "null");
    if (!isReady || !playerRef.current || typeof playerRef.current.playVideo !== 'function') {
      console.warn("SecureVideoPlayer: Play blocked because player is not ready or API methods are missing. isReady =", isReady, "playVideo function =", playerRef.current ? typeof playerRef.current.playVideo : "undefined");
      return;
    }

    if (isPlaying) {
      console.log("SecureVideoPlayer: calling pauseVideo()");
      playerRef.current.pauseVideo();
    } else {
      console.log("SecureVideoPlayer: calling playVideo()");
      playerRef.current.playVideo();
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isReady || !playerRef.current || typeof playerRef.current.seekTo !== 'function') return;
    const seekTo = parseFloat(e.target.value);
    playerRef.current.seekTo(seekTo, true);
    setCurrentTime(seekTo);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isReady || !playerRef.current || typeof playerRef.current.setVolume !== 'function') return;
    const vol = parseInt(e.target.value, 10);
    setVolume(vol);
    setIsMuted(vol === 0);
    playerRef.current.setVolume(vol);
    playerRef.current.unMute();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReady || !playerRef.current || typeof playerRef.current.mute !== 'function') return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
      playerRef.current.setVolume(volume || 30);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Fullscreen error", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Monitor document fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={(e) => e.preventDefault()} // Intercept right click completely
      className="relative aspect-video w-full overflow-hidden bg-black border border-border group select-none"
      style={{ borderRadius: '0.375rem' }}
    >
      {/* Target element for YT Player */}
      <div className="absolute inset-0 w-full h-full pointer-events-none scale-[1.015]">
        <div ref={playerContainerRef} className="w-full h-full" />
      </div>

      {/* Transparent Clickable Overlay Covering the Entire Video Screen */}
      <div 
        {...clickable(togglePlay)}
        onDoubleClick={toggleFullscreen}
        className="absolute inset-0 w-full h-full cursor-pointer z-10 bg-transparent flex items-center justify-center"
      >
        {/* Buffering/Loading Indicator */}
        {!isReady && (
          <div className="flex flex-col items-center gap-2 bg-black/60 p-4 rounded">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-txt-2 font-mono">Chargement du lecteur sécurisé...</span>
          </div>
        )}
      </div>

      {/* Custom Control Bar (Slide-in overlays) */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2 transition-all duration-300 pointer-events-auto ${
          showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Custom Seek Bar Slider */}
        <div className="w-full flex items-center gap-2 group/seek">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full h-1 dark:bg-white/20 bg-black/20 accent-accent hover:h-1.5 transition-all cursor-pointer rounded-lg outline-none appearance-none"
            style={{
              background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${
                duration ? (currentTime / duration) * 100 : 0
              }%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Playback Buttons, Volume, Time details & Fullscreen */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play / Pause */}
            <button 
              onClick={togglePlay}
              className="p-1 text-txt hover:text-accent transition-colors"
              title={isPlaying ? 'Pause' : 'Lire'}
            >
              {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
            </button>

            {/* Volume controls */}
            <div className="flex items-center gap-1.5 group/volume">
              <button 
                onClick={toggleMute}
                className="p-1 text-txt hover:text-accent transition-colors"
                title={isMuted ? 'Activer le son' : 'Couper le son'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-16 h-1 dark:bg-white/20 bg-black/20 accent-accent transition-all duration-200 cursor-pointer rounded-lg outline-none appearance-none"
              />
            </div>

            {/* Time Indicators */}
            <div className="text-[10px] font-mono text-txt-2">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-txt-3">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen */}
            <button 
              onClick={toggleFullscreen}
              className="p-1 text-txt hover:text-accent transition-colors"
              title="Plein écran"
            >
              {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
