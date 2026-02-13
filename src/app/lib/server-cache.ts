/**
 * Generic server-side in-memory cache.
 *
 * Usage:
 *   const cache = new ServerCache<MyType>(5 * 60 * 1000); // 5-min TTL
 *   cache.get('key')       → MyType | null
 *   cache.set('key', data) → void
 *   cache.invalidate('key')→ void
 *   cache.clear()          → void
 */

interface Entry<T> {
    data: T;
    ts: number;
}

export class ServerCache<T = unknown> {
    private store = new Map<string, Entry<T>>();
    private ttl: number;

    constructor(ttlMs: number) {
        this.ttl = ttlMs;
    }

    get(key: string): T | null {
        const e = this.store.get(key);
        if (!e || Date.now() - e.ts > this.ttl) return null;
        return e.data;
    }

    set(key: string, data: T): void {
        this.store.set(key, { data, ts: Date.now() });
    }

    invalidate(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }
}
