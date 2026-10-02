export class NotificationService {
  constructor() {
    this.items = [];
    this.listeners = new Set();
    this.nextId = 1;
  }
  subscribe(cb) { this.listeners.add(cb); cb(this.items); return () => this.listeners.delete(cb); }
  emit() { this.listeners.forEach((cb) => cb([...this.items])); }
  add(message, { type = "info", title = "", timeout = 3500 } = {}) {
    const item = { id: this.nextId++, message, type, title };
    this.items.push(item);
    this.emit();
    if (timeout) window.setTimeout(() => this.remove(item.id), timeout);
    return item.id;
  }
  remove(id) { this.items = this.items.filter((item) => item.id !== id); this.emit(); }
}
