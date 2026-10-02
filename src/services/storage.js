export class StorageService {
  constructor(prefix = "app") { this.prefix = prefix; }
  key(name) { return `${this.prefix}:${name}`; }
  get(name, fallback = null) {
    try { return JSON.parse(localStorage.getItem(this.key(name))) ?? fallback; }
    catch { return fallback; }
  }
  set(name, value) {
    try { localStorage.setItem(this.key(name), JSON.stringify(value)); return true; }
    catch { return false; }
  }
  remove(name) {
    try { localStorage.removeItem(this.key(name)); return true; }
    catch { return false; }
  }
}
