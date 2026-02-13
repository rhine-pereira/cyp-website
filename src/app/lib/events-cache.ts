/**
 * Server-side in-memory cache for events data.
 */

import { ServerCache } from './server-cache';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const eventsListCache = new ServerCache<any[]>(CACHE_TTL);

const LIST_KEY = '__events_all__';

export function getEventsList(): any[] | null {
    return eventsListCache.get(LIST_KEY);
}

export function setEventsList(data: any[]): void {
    eventsListCache.set(LIST_KEY, data);
}

/** Invalidate events cache (after create/update/delete). */
export function invalidateEvents(): void {
    eventsListCache.clear();
}
