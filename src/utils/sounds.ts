// Sound Effect Utility

class SoundManager {
  private enabled: boolean = true;
  private sounds: Record<string, HTMLAudioElement> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      // Create audio elements for standard events using free generic sounds
      this.sounds = {
        open: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'),
        close: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
        profit: new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3'),
        loss: new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3'),
      };

      // Preload
      Object.values(this.sounds).forEach(audio => {
        audio.load();
      });
      
      const stored = localStorage.getItem('btrade_sounds_enabled');
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('btrade_sounds_enabled', this.enabled.toString());
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  play(event: 'open' | 'close' | 'profit' | 'loss') {
    if (!this.enabled || !this.sounds[event]) return;
    
    // Clone node to allow overlapping sounds
    const sound = this.sounds[event].cloneNode() as HTMLAudioElement;
    sound.volume = 0.5;
    sound.play().catch(e => console.warn('Audio play failed:', e));
  }
}

export const sounds = new SoundManager();
