// Sound effects utilities for MVP 1
export class SoundManager {
  private static instance: SoundManager;
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private musicPlaying: HTMLAudioElement | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private volume: number = 0.5;

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSounds();
    }
  }

  private initializeSounds() {
    // Create audio contexts for different sound types
    const soundPaths = {
      click: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBy2E0fPTgjMGHm7A7+OYFQ',
      collect: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBy2E0fPTgjMGHm7A7+OYFQ',
      upgrade: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBy2E0fPTgjMGHm7A7+OYFQ',
      purchase: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBy2E0fPTgjMGHm7A7+OYFQ',
      unlock: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBy2E0fPTgjMGHm7A7+OYFQ',
      achievement: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBy2E0fPTgjMGHm7A7+OYFQ',
    };

    // Initialize sound objects
    Object.entries(soundPaths).forEach(([name, path]) => {
      const audio = new Audio();
      audio.volume = this.volume;
      audio.preload = 'auto';
      // For now using placeholder sounds - in production would use real audio files
      this.sounds[name] = audio;
    });
  }

  playSound(soundName: string) {
    if (!this.soundEnabled || typeof window === 'undefined') return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      try {
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Sound play failed:', e));
      } catch (error) {
        console.log('Sound error:', error);
      }
    }
  }

  playBackgroundMusic() {
    if (!this.musicEnabled || typeof window === 'undefined') return;
    
    // In production, this would play actual Vietnamese traditional music
    console.log('🎵 Playing Vietnamese traditional background music');
  }

  stopBackgroundMusic() {
    if (this.musicPlaying) {
      this.musicPlaying.pause();
      this.musicPlaying = null;
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('katagame_sound_enabled', enabled.toString());
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    localStorage.setItem('katagame_music_enabled', enabled.toString());
    
    if (!enabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('katagame_volume', this.volume.toString());
    
    // Update all sound volumes
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  loadSettings() {
    if (typeof window === 'undefined') return;
    
    const soundEnabled = localStorage.getItem('katagame_sound_enabled');
    const musicEnabled = localStorage.getItem('katagame_music_enabled');
    const volume = localStorage.getItem('katagame_volume');
    
    if (soundEnabled !== null) this.soundEnabled = soundEnabled === 'true';
    if (musicEnabled !== null) this.musicEnabled = musicEnabled === 'true';
    if (volume !== null) this.setVolume(parseFloat(volume));
  }

  getSoundEnabled() { return this.soundEnabled; }
  getMusicEnabled() { return this.musicEnabled; }
  getVolume() { return this.volume; }
}

// Hook for using sound in components
export const useSound = () => {
  return SoundManager.getInstance();
};