/**
 * Picture-in-Picture (PiP) Engine
 * Creates a live canvas and stream for native Android PiP floating window.
 * Keeps PokeIdle runner active across apps on Android with floating status.
 */

export interface PiPStats {
  elapsedSeconds: number;
  antiSleepActive: boolean;
  wakeLockActive: boolean;
  gameStatus: string;
}

class PipEngineService {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number | null = null;
  private isInPip = false;
  private listeners: Set<(inPip: boolean) => void> = new Set();
  private stats: PiPStats = {
    elapsedSeconds: 0,
    antiSleepActive: true,
    wakeLockActive: true,
    gameStatus: 'Online - pokeidle.io/app',
  };

  public isSupported(): boolean {
    return (
      typeof document !== 'undefined' &&
      'pictureInPictureEnabled' in document &&
      document.pictureInPictureEnabled
    );
  }

  public subscribe(callback: (inPip: boolean) => void) {
    this.listeners.add(callback);
    callback(this.isInPip);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.isInPip));
  }

  public updateStats(newStats: Partial<PiPStats>) {
    this.stats = { ...this.stats, ...newStats };
  }

  private initElements() {
    if (this.canvasElement && this.videoElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 270;
    this.canvasElement = canvas;
    this.ctx = canvas.getContext('2d');

    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    // Keep offscreen
    video.style.position = 'fixed';
    video.style.opacity = '0';
    video.style.pointerEvents = 'none';
    video.style.bottom = '-9999px';
    document.body.appendChild(video);
    this.videoElement = video;

    video.addEventListener('enterpictureinpicture', () => {
      this.isInPip = true;
      this.notify();
    });

    video.addEventListener('leavepictureinpicture', () => {
      this.isInPip = false;
      this.notify();
    });
  }

  private renderCanvas() {
    if (!this.ctx || !this.canvasElement) return;
    const ctx = this.ctx;
    const w = this.canvasElement.width;
    const h = this.canvasElement.height;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Glowing border
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    // Header badge
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(16, 16, 140, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText('⚡ POKEIDLE 24/7', 24, 35);

    // Status Indicator
    const now = Date.now();
    const pulse = (Math.sin(now / 300) + 1) / 2;
    ctx.beginPath();
    ctx.arc(440, 30, 8, 0, Math.PI * 2);
    ctx.fillStyle = this.stats.antiSleepActive ? `rgba(34, 197, 94, ${0.4 + pulse * 0.6})` : '#ef4444';
    ctx.fill();

    // Pokeball graphic
    const pcx = 70;
    const pcy = 150;
    const pr = 42;
    // Top
    ctx.beginPath();
    ctx.arc(pcx, pcy, pr, Math.PI, 0, false);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    // Bottom
    ctx.beginPath();
    ctx.arc(pcx, pcy, pr, 0, Math.PI, false);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    // Belt
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pcx - pr, pcy - 4, pr * 2, 8);
    // Center button
    ctx.beginPath();
    ctx.arc(pcx, pcy, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pcx, pcy, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    // Time elapsed display
    const hrs = Math.floor(this.stats.elapsedSeconds / 3600);
    const mins = Math.floor((this.stats.elapsedSeconds % 3600) / 60);
    const secs = this.stats.elapsedSeconds % 60;
    const timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('TEMPO ATIVO EM 2º PLANO:', 140, 100);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(timeStr, 140, 140);

    // Status subtitle
    ctx.fillStyle = '#a7f3d0';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText('● Proteção Anti-Sleep Ativa', 140, 175);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('Janela Flutuante PiP ativa sobre outros apps', 140, 205);

    // Footer bar
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(16, 230, w - 32, 24);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('Toque para expandir | pokeidle.io/app ativo', 26, 246);
  }

  public async startPiP(): Promise<boolean> {
    if (!this.isSupported()) {
      alert('Picture-in-Picture não é suportado neste navegador. Use o Chrome no Android.');
      return false;
    }

    this.initElements();
    if (!this.videoElement || !this.canvasElement) return false;

    // Start render loop
    const loop = () => {
      this.renderCanvas();
      this.animId = requestAnimationFrame(loop);
    };
    loop();

    try {
      const stream = (this.canvasElement as unknown as { captureStream: (fps: number) => MediaStream }).captureStream(15);
      this.videoElement.srcObject = stream;
      await this.videoElement.play();
      await this.videoElement.requestPictureInPicture();
      this.isInPip = true;
      this.notify();
      return true;
    } catch (err) {
      console.warn('PiP start failed:', err);
      if (this.animId) cancelAnimationFrame(this.animId);
      this.isInPip = false;
      this.notify();
      return false;
    }
  }

  public async stopPiP() {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    }
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.isInPip = false;
    this.notify();
  }

  public getInPip() {
    return this.isInPip;
  }
}

export const pipEngine = new PipEngineService();
