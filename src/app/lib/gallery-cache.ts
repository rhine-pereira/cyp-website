/**
 * Server-side in-memory cache for gallery data.
 *
 * The gallery GET route scans S3 and merges metadata on every request.
 * This cache avoids redundant S3 scans for subsequent requests within the TTL.
 */

import { ServerCache } from './server-cache';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache keyed by the full query string (category + limit + cursor)
const galleryCache = new ServerCache<{ items: any[]; nextCursor?: string }>(CACHE_TTL);

export function getGalleryResult(cacheKey: string): { items: any[]; nextCursor?: string } | null {
    return galleryCache.get(cacheKey);
}

export function setGalleryResult(cacheKey: string, data: { items: any[]; nextCursor?: string }): void {
    galleryCache.set(cacheKey, data);
}

/** Invalidate all gallery cache entries (after upload/delete). */
export function invalidateGallery(): void {
    galleryCache.clear();
}
