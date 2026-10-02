export class LoadingService {
  constructor() {
    this.pending = 0;
    this.listeners = new Set();
  }
  get active() { return this.pending > 0; }
  subscribe(cb) { this.listeners.add(cb); return () => this.listeners.delete(cb); }
  emit() { this.listeners.forEach((cb) => cb(this.active)); }
  start() { this.pending += 1; this.emit(); }
  stop() { this.pending = Math.max(0, this.pending - 1); this.emit(); }
}
