'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { GalleryItem } from '@/app/types/gallery';

// Warm Espresso Theme Colors
const theme = {
  background: '#1C1917',
  surface: '#1C1917',
  primary: '#FB923C',
  text: '#FAFAFA',
  border: '#FB923C30',
};

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: theme.background }}>
      <div className="absolute inset-0 opacity-10 blur-3xl bg-[radial-gradient(circle_at_20%_20%,#FB923C,transparent_40%),radial-gradient(circle_at_80%_30%,#FCD34D,transparent_40%),radial-gradient(circle_at_50%_80%,#FB923C,transparent_40%)]" />
      <div className="container mx-auto px-4 py-20 relative">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{ color: theme.text }}>Moments of faith, fellowship, and fun</h1>
        <p className="mt-4 max-w-2xl text-lg opacity-80" style={{ color: theme.text }}>Captured from our retreats, outreaches, and youth gatherings. Bright, warm, and full of joy and unity.</p>
        <div className="mt-6">
          <a href="#gallery" className="inline-flex items-center px-5 py-3 rounded-xl transition font-semibold" style={{ backgroundColor: theme.primary, color: theme.background }}>Explore Gallery</a>
        </div>
      </div>
    </section>
  );
}

type CategoryCard = { slug: string; label: string; thumb?: string };

function CategoryGrid({ cats }: { cats: CategoryCard[] }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="sr-only">Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {cats.map((c) => (
          <Link
            key={c.slug}
            href={`/gallery/${encodeURIComponent(c.slug)}`}
            className="group text-left rounded-xl overflow-hidden border hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-gray-900 relative">
              {c.thumb ? (
                <>
                  <img src={c.thumb} alt={c.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
              )}
            </div>
            <div className="p-4">
              <div className="text-base font-bold truncate" style={{ color: theme.text }}>{c.label}</div>
              <div className="text-xs font-medium mt-1 opacity-70" style={{ color: theme.primary }}>View Collection →</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [cats, setCats] = useState<CategoryCard[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      const res = await fetch('/api/gallery?limit=1000', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const map = new Map<string, { label: string; thumb?: string }>();
      for (const it of ((data.items as GalleryItem[]) || [])) {
        if (!it?.category) continue;
        const slug = it.category;
        const label = it.categoryLabel || it.category;
        if (!map.has(slug)) {
          map.set(slug, { label, thumb: it.thumbnailUrl || it.url });
        }
      }
      setCats(Array.from(map.entries()).map(([slug, v]) => ({ slug, label: v.label, thumb: v.thumb })));
    };
    void fetchCats();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      <Hero />
      <CategoryGrid cats={cats} />
    </div>
  );
}
