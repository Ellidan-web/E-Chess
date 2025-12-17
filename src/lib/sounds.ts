// Sound URLs for chess moves
export const SOUNDS = {
  move: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3',
  capture: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3',
  check: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3',
  castle: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/castle.mp3',
  promote: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/promote.mp3',
  gameEnd: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3',
  illegal: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/illegal.mp3',
};

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    // Preload sounds
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.sounds.set(key, audio);
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  play(sound: keyof typeof SOUNDS): void {
    if (!this.enabled) return;
    
    const audio = this.sounds.get(sound);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }
}

export const soundManager = new SoundManager();
