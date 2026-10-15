/**
 * Screen WakeLock Service
 * Prevents mobile display from sleeping and CPU from deep throttling
 */

class WakeLockService {
  private wakeLockSentinel: WakeLockSentinel | null = null;
  private isRequested = false;
  private listeners: Set<(active: boolean) => void> = new Set();

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (this.isRequested && document.visibilityState === 'visible') {
          this.acquire();
        }
      });
    }
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  public subscribe(callback: (active: boolean) => void) {
    this.listeners.add(callback);
    callback(this.isActive());
    return () => this.listeners.delete(callback);
  }

  private notify() {
    const active = this.isActive();
    this.listeners.forEach((cb) => cb(active));
  }

  public isActive(): boolean {
    return this.wakeLockSentinel !== null && !this.wakeLockSentinel.released;
  }

  public async acquire(): Promise<boolean> {
    if (!this.isSupported()) return false;
    this.isRequested = true;

    try {
      this.wakeLockSentinel = await navigator.wakeLock.request('screen');
      this.wakeLockSentinel.addEventListener('release', () => {
        this.notify();
      });
      this.notify();
      return true;
    } catch (err) {
      console.warn('Wake Lock request error:', err);
      this.notify();
      return false;
    }
  }

  public async release(): Promise<void> {
    this.isRequested = false;
    if (this.wakeLockSentinel) {
      await this.wakeLockSentinel.release();
      this.wakeLockSentinel = null;
    }
    this.notify();
  }
}

export const wakeLockService = new WakeLockService();
