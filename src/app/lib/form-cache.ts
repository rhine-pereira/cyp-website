/**
 * Server-side in-memory cache for form data.
 *
 * Thin convenience layer on top of the generic ServerCache.
 */

import { ServerCache } from './server-cache';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const formCache = new ServerCache<Record<string, unknown>>(CACHE_TTL);
const listCache = new ServerCache<Record<string, unknown>[]>(CACHE_TTL);

const LIST_KEY = '__all__';

// ── Individual form ────────────────────────────────────────────────

export function getForm(formId: string): Record<string, unknown> | null {
    return formCache.get(formId);
}

export function setForm(formId: string, data: Record<string, unknown>): void {
    formCache.set(formId, data);
}

// ── Forms listing ──────────────────────────────────────────────────

export function getFormsList(): Record<string, unknown>[] | null {
    return listCache.get(LIST_KEY);
}

export function setFormsList(data: Record<string, unknown>[]): void {
    listCache.set(LIST_KEY, data);
}

// ── Invalidation ───────────────────────────────────────────────────

/** Invalidate a specific form and the listing cache. */
export function invalidateForm(formId: string): void {
    formCache.invalidate(formId);
    listCache.clear();
}

/** Invalidate everything (e.g. after a delete or bulk operation). */
export function invalidateAll(): void {
    formCache.clear();
    listCache.clear();
}
