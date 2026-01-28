'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import { Play } from 'lucide-react';

interface VideoThumbnailProps {
    src: string;
    alt?: string;
    className?: string;
}

// Global cache stored on window to persist across HMR and re-renders
const getCacheMap = (): Map<string, string> => {
    if (typeof window === 'undefined') return new Map();
    const w = window as any;
    if (!w.__vtCache) w.__vtCache = new Map<string, string>();
    return w.__vtCache;
};

// Track which URLs are currently being processed to avoid duplicate work
const getProcessingSet = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    const w = window as any;
    if (!w.__vtProcessing) w.__vtProcessing = new Set<string>();
    return w.__vtProcessing;
};

/**
 * VideoThumbnail - Memoized component that extracts a video frame.
 * Uses global caching to prevent re-extraction on re-renders.
 */
function VideoThumbnailInner({ src, alt = 'Video thumbnail', className = '' }: VideoThumbnailProps) {
    const cache = getCacheMap();
    const processing = getProcessingSet();

    // Initialize state from cache
    const [thumbnail, setThumbnail] = useState<string | null>(() => cache.get(src) || null);
    const [status, setStatus] = useState<'loading' | 'done' | 'error'>(() =>
        cache.has(src) ? 'done' : 'loading'
    );

    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        // Already have cached thumbnail
        if (cache.has(src)) {
            setThumbnail(cache.get(src) || null);
            setStatus('done');
            return;
        }

        // Already being processed by another instance
        if (processing.has(src)) {
            // Poll for result
            const interval = setInterval(() => {
                if (cache.has(src)) {
                    setThumbnail(cache.get(src) || null);
                    setStatus('done');
                    clearInterval(interval);
                }
            }, 200);
            return () => clearInterval(interval);
        }

        // Mark as processing
        processing.add(src);
        setStatus('loading');

        const video = document.createElement('video');
        videoRef.current = video;
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';

        let completed = false;

        const finish = (dataUrl: string | null) => {
            if (completed) return;
            completed = true;
            processing.delete(src);

            if (dataUrl) {
                cache.set(src, dataUrl);
                setThumbnail(dataUrl);
                setStatus('done');
            } else {
                setStatus('error');
            }

            // Cleanup video
            video.pause();
            video.src = '';
            video.load();
        };

        const captureFrame = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth || 320;
                canvas.height = video.videoHeight || 180;
                const ctx = canvas.getContext('2d');
                if (ctx && canvas.width > 0 && canvas.height > 0) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                    if (dataUrl && dataUrl.length > 500) {
                        finish(dataUrl);
                        return;
                    }
                }
            } catch { }
            finish(null);
        };

        video.onloadeddata = () => {
            video.currentTime = Math.min(0.5, (video.duration || 1) * 0.1);
        };

        video.onseeked = () => {
            setTimeout(captureFrame, 100);
        };

        video.onerror = () => finish(null);

        // Timeout
        const timeout = setTimeout(() => finish(null), 12000);

        video.src = src;

        return () => {
            clearTimeout(timeout);
            if (!completed) {
                completed = true;
                processing.delete(src);
                video.pause();
                video.src = '';
            }
        };
    }, [src]);

    if (status === 'loading') {
        return (
            <div className={`flex items-center justify-center bg-gray-800 ${className}`}>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
        );
    }

    if (status === 'error' || !thumbnail) {
        return (
            <div className={`flex items-center justify-center bg-gray-800 ${className}`}>
                <Play className="w-5 h-5 text-white/50" />
            </div>
        );
    }

    return <img src={thumbnail} alt={alt} className={className} />;
}

// Memoize to prevent unnecessary re-renders
const VideoThumbnail = memo(VideoThumbnailInner, (prev, next) => prev.src === next.src);

export default VideoThumbnail;
