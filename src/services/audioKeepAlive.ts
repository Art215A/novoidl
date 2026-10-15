/**
 * Audio Keep-Alive Service
 * Generates a valid 5-second looping WAV blob and Web Audio oscillator.
 * Keeps Android CPU and background network alive via MediaSession.
 */

function createSilentWavBlobUrl(durationSeconds = 5): string {
  const sampleRate = 8000;
  const numChannels = 1;
  const numSamples = sampleRate * durationSeconds;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF Chunk
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');

  // fmt Sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
  view.setUint16(32, numChannels * 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16-bit)

  // data Sub-chunk
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // PCM data (silence: all 0)
  // DataView is initialized with zeros, so buffer is already silent 16-bit PCM

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

class AudioKeepAliveService {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isRunning = false;
  private isAudibleTick = false;
  private listeners: Set<(active: boolean) => void> = new Set();
  private blobUrl: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.blobUrl = createSilentWavBlobUrl(5);
        this.createAudioElement();
      } catch (e) {
        console.warn('Silent audio creation fallback', e);
      }
    }
  }

  private createAudioElement() {
    if (!this.blobUrl) return;
    const audio = new Audio(this.blobUrl);
    audio.loop = true;
    audio.setAttribute('playsinline', 'true');
    audio.preload = 'auto';
    // 0.02 volume ensures Android OS registers real audible output without being disruptive
    audio.volume = 0.02;
    this.audioElement = audio;

    audio.addEventListener('error', (e) => {
      console.warn('Audio element error:', e);
    });
  }

  public subscribe(callback: (active: boolean) => void) {
    this.listeners.add(callback);
    callback(this.isRunning);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isRunning));
  }

  public async playTestSound(): Promise<boolean> {
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Play pleasant Pokemon level-up chord (C5 -> E5 -> G5)
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };

      playTone(523.25, 0, 0.2); // C5
      playTone(659.25, 0.15, 0.2); // E5
      playTone(783.99, 0.3, 0.4); // G5

      // Also start keep alive
      await this.start();
      return true;
    } catch (e) {
      console.warn('Test sound error:', e);
      return false;
    }
  }

  public async start(): Promise<boolean> {
    try {
      // 1. Initialize & resume Web Audio API
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      // 2. Play HTML5 audio
      if (!this.audioElement) {
        this.createAudioElement();
      }

      if (this.audioElement) {
        this.audioElement.volume = this.isAudibleTick ? 0.1 : 0.02;
        await this.audioElement.play();
      }

      // 3. Web Audio Oscillator
      if (!this.oscillator && this.audioCtx) {
        this.oscillator = this.audioCtx.createOscillator();
        this.gainNode = this.audioCtx.createGain();

        // 30Hz inaudible sine wave
        this.oscillator.type = 'sine';
        this.oscillator.frequency.setValueAtTime(30, this.audioCtx.currentTime);
        this.gainNode.gain.setValueAtTime(0.005, this.audioCtx.currentTime);

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);
        this.oscillator.start();
      }

      // 4. Register MediaSession notification on Android
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'PokeIdle Background Runner',
          artist: 'Anti-Suspensão Ativo 24/7',
          album: 'Farm em Segundo Plano',
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
      // Even if HTML5 audio had an autoplay block, keep WebAudio running if active
      if (this.audioCtx && this.audioCtx.state === 'running') {
        this.isRunning = true;
        this.notify();
        return true;
      }
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
