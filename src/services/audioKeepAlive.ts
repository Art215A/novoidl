/**
 * Audio Keep-Alive Service
 * Plays an inaudible audio loop using HTML5 Audio & Web Audio API
 * Sets MediaSession metadata so Android registers active media playback.
 * This prevents Android Chrome/WebView from suspending timers when minimized.
 */

class AudioKeepAliveService {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isRunning = false;
  private listeners: Set<(active: boolean) => void> = new Set();

  constructor() {
    this.createAudioElement();
  }

  private createAudioElement() {
    // Generate a valid 1-second silent WAV data URI
    // 44.1kHz, 16-bit, mono silence
    const silentWavBase64 =
      'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
    const audio = new Audio(silentWavBase64);
    audio.loop = true;
    audio.preload = 'auto';
    this.audioElement = audio;
  }

  public subscribe(callback: (active: boolean) => void) {
    this.listeners.add(callback);
    callback(this.isRunning);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isRunning));
  }

  public async start(): Promise<boolean> {
    try {
      // 1. Start HTML5 Audio loop
      if (this.audioElement) {
        await this.audioElement.play();
      }

      // 2. Start Web Audio API at 0.0001 volume (inaudible)
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      if (!this.oscillator) {
        this.oscillator = this.audioCtx.createOscillator();
        this.gainNode = this.audioCtx.createGain();
        
        // 20Hz (inaudible low frequency) with negligible gain
        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(20, this.audioCtx.currentTime);
        this.gainNode.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);
        this.oscillator.start();
      }

      // 3. Register MediaSession for Android Status Bar & Notification
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'PokeIdle Background Runner',
          artist: 'Executando em 2º Plano (Anti-Pausa Ativo)',
          album: 'PokeIdle.io Background Master',
          artwork: [
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          ],
        });

        navigator.mediaSession.playbackState = 'playing';

        navigator.mediaSession.setActionHandler('play', () => {
          this.start();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          this.stop();
        });
      }

      this.isRunning = true;
      this.notify();
      return true;
    } catch (err) {
      console.warn('Failed to start Audio Keep-Alive:', err);
      this.isRunning = false;
      this.notify();
      return false;
    }
  }

  public stop() {
    try {
      if (this.audioElement) {
        this.audioElement.pause();
      }
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.audioCtx && this.audioCtx.state !== 'closed') {
        this.audioCtx.suspend();
      }
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    } catch (e) {
      console.warn('Error stopping audio keep alive', e);
    }
    this.isRunning = false;
    this.notify();
  }

  public getStatus() {
    return this.isRunning;
  }
}

export const audioKeepAlive = new AudioKeepAliveService();
