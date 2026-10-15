/**
 * Web Worker Timer Service
 * Uses a dedicated Web Worker to bypass main thread timer throttling on mobile browsers
 */

class WorkerTimerService {
  private worker: Worker | null = null;
  private tickCallbacks: Set<(elapsed: number) => void> = new Set();
  private elapsedSeconds = 0;
  private isRunning = false;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    const workerCode = `
      let timerId = null;
      let ticks = 0;

      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (timerId !== null) clearInterval(timerId);
          ticks = 0;
          timerId = setInterval(() => {
            ticks++;
            self.postMessage({ type: 'tick', ticks });
          }, 1000);
        } else if (e.data === 'stop') {
          if (timerId !== null) clearInterval(timerId);
          timerId = null;
        }
      };
    `;

    try {
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      this.worker.onmessage = (e) => {
        if (e.data && e.data.type === 'tick') {
          this.elapsedSeconds = e.data.ticks;
          this.tickCallbacks.forEach((cb) => cb(this.elapsedSeconds));
        }
      };
    } catch (err) {
      console.warn('Worker creation failed, falling back to interval', err);
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.elapsedSeconds = 0;
    if (this.worker) {
      this.worker.postMessage('start');
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.worker) {
      this.worker.postMessage('stop');
    }
  }

  public onTick(cb: (elapsed: number) => void) {
    this.tickCallbacks.add(cb);
    return () => this.tickCallbacks.delete(cb);
  }

  public getElapsed() {
    return this.elapsedSeconds;
  }
}

export const workerTimer = new WorkerTimerService();
