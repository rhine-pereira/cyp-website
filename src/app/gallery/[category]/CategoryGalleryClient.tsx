'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { GalleryItem } from '@/app/types/gallery';

function Hero({ categoryLabel }: { categoryLabel: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="absolute inset-0 opacity-30 blur-3xl bg-[radial-gradient(circle_at_20%_20%,#fde68a,transparent_40%),radial-gradient(circle_at_80%_30%,#fca5a5,transparent_40%),radial-gradient(circle_at_50%_80%,#a7f3d0,transparent_40%)]" />
      <div className="container mx-auto px-4 py-20 relative">
        <Link href="/gallery" className="text-sm text-gray-600 hover:text-gray-900 underline mb-4 inline-block">
          ← Back to all categories
        </Link>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">{categoryLabel}</h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-700">Browse photos and videos from this event</p>
      </div>
    </section>
  );
}

function PhotoGrid({ items, onOpen }: { items: GalleryItem[]; onOpen: (i: number) => void }) {
  return (
    <div id="gallery" className="container mx-auto px-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((it, idx) => (
          <div key={it.id} className="cursor-pointer group" onClick={() => onOpen(idx)}>
            {it.type === 'image' ? (
              <img src={it.thumbnailUrl || it.url} alt={it.caption || it.title || 'image'} className="w-full h-full rounded-xl object-cover transition-transform group-hover:scale-[1.02]" loading="lazy" />
            ) : (
              <div className="relative w-full overflow-hidden rounded-xl bg-black/80 aspect-[4/3]">
                {it.thumbnailUrl ? (
                  <img src={it.thumbnailUrl} alt={it.caption || it.title || 'video'} className="w-full h-full object-cover opacity-90" loading="lazy" />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow">
                    <div className="ml-1 w-0 h-0 border-t-8 border-b-8 border-l-0 border-r-0 border-transparent" style={{ borderLeft: '14px solid black' }} />
                  </div>
                </div>
              </div>
            )}
            {it.caption ? <div className="mt-2 text-sm text-gray-600">{it.caption}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Lightbox({ open, items, index, onClose, onPrev, onNext }: { open: boolean; items: GalleryItem[]; index: number; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  const item = items[index];
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [swipeStart, setSwipeStart] = useState({ x: 0, y: 0, time: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [open, index]);

  useEffect(() => {
    if (!open) return;
    const handleWheel = (e: WheelEvent) => {
      if (item?.type !== 'image') return;
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((s) => Math.max(1, Math.min(5, s * delta)));
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKey);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [open, item, onClose, onPrev, onNext]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1 || item?.type !== 'image') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      containerRef.current?.setAttribute('data-pinch-start', dist.toString());
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setSwipeStart({ x: touch.clientX, y: touch.clientY, time: Date.now() });
      if (scale > 1 && item?.type === 'image') {
        setIsDragging(true);
        setDragStart({ x: touch.clientX - translate.x, y: touch.clientY - translate.y });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const start = parseFloat(containerRef.current?.getAttribute('data-pinch-start') || '0');
      if (start > 0) {
        const newScale = scale * (dist / start);
        setScale(Math.max(1, Math.min(5, newScale)));
        containerRef.current?.setAttribute('data-pinch-start', dist.toString());
      }
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (isDragging && scale > 1 && item?.type === 'image') {
        setTranslate({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1 && !isDragging && scale <= 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeStart.x;
      const deltaY = touch.clientY - swipeStart.y;
      const deltaTime = Date.now() - swipeStart.time;
      const velocity = Math.abs(deltaX) / deltaTime;

      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 2 && velocity > 0.3) {
        if (deltaX > 0) {
          onPrev();
        } else {
          onNext();
        }
      }
    }
    setIsDragging(false);
    containerRef.current?.removeAttribute('data-pinch-start');
  };

  if (!open || !item) return null;

  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center touch-none" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white text-2xl" aria-label="Close">
        ×
      </button>

      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 md:left-4 md:top-1/2 bottom-auto md:bottom-auto z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white text-3xl max-md:bottom-20 max-md:left-[calc(50%-80px)] max-md:top-auto max-md:translate-y-0"
          aria-label="Previous"
        >
          ‹
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 md:right-4 md:top-1/2 bottom-auto md:bottom-auto z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center text-white text-3xl max-md:bottom-20 max-md:right-[calc(50%-80px)] max-md:top-auto max-md:translate-y-0"
          aria-label="Next"
        >
          ›
        </button>
      )}

      <div
        ref={containerRef}
        className="max-w-5xl w-full h-full flex items-center justify-center overflow-hidden touch-pan-x touch-pan-y"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: scale > 1 ? 'move' : 'default' }}
      >
        {item.type === 'image' ? (
          <img
            src={item.url}
            alt={item.caption || item.title || ''}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            draggable={false}
          />
        ) : (
          item.url.includes('youtube.com') || item.url.includes('youtu.be') || item.url.includes('vimeo.com') ? (
            <div className="aspect-video w-full max-w-4xl">
              <iframe className="w-full h-full rounded-lg" src={item.url.replace('watch?v=', 'embed/')} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          ) : (
            <video controls className="max-w-full max-h-full rounded-lg" src={item.url} />
          )
        )}
      </div>

      {item.caption && (
        <div className="absolute bottom-4 left-4 right-4 text-center text-white/90 text-sm md:text-base bg-black/40 rounded-lg px-4 py-2">
          {item.caption}
        </div>
      )}

      {scale > 1 && item.type === 'image' && (
        <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
}

function useGalleryPagination(category: string, initialItems: GalleryItem[], initialCursor?: string) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [cursor, setCursor] = useState<string | undefined>(initialCursor);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set('category', category);
    params.set('limit', '12');
    params.set('cursor', cursor);
    const res = await fetch(`/api/gallery?${params.toString()}`, { cache: 'no-store' });
    const data = await res.json();
    setItems((prev) => [...prev, ...data.items]);
    setCursor(data.nextCursor);
    setLoading(false);
  };

  return { items, cursor, loading, load };
}

export default function CategoryGalleryClient({
  category,
  categoryLabel,
  initialItems,
  initialCursor,
}: {
  category: string;
  categoryLabel: string;
  initialItems: GalleryItem[];
  initialCursor?: string;
}) {
  const { items, cursor, loading, load } = useGalleryPagination(category, initialItems, initialCursor);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = (i: number) => { setIndex(i); setOpen(true); };
  const handlePrev = () => {
    setIndex((i) => {
      const newIndex = Math.max(0, i - 1);
      return newIndex;
    });
  };
  const handleNext = () => {
    setIndex((i) => {
      const newIndex = Math.min(items.length - 1, i + 1);
      if (newIndex >= items.length - 3 && cursor && !loading) {
        void load();
      }
      return newIndex;
    });
  };

  return (
    <div>
      <Hero categoryLabel={categoryLabel} />
      <div className="py-8">
        <PhotoGrid items={items} onOpen={openAt} />
      </div>
      <div className="container mx-auto px-4 py-8 flex justify-center">
        {cursor ? (
          <button onClick={() => load()} className="px-5 py-3 rounded-xl bg-gray-900 text-white disabled:opacity-50" disabled={loading}>
            {loading ? 'Loading...' : 'Load more'}
          </button>
        ) : (
          <div className="text-gray-500">{loading ? 'Loading...' : items.length === 0 ? 'No items found' : 'No more items'}</div>
        )}
      </div>
      <Lightbox open={open} items={items} index={index} onClose={() => setOpen(false)} onPrev={handlePrev} onNext={handleNext} />
    </div>
  );
}
