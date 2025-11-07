"use client";

import React from 'react';
import Link from 'next/link';
import GallerySection from '@/app/components/Gallery/GallerySection';
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
  return (
    <div>
      <Hero categoryLabel={categoryLabel} />
      <div className="py-8 container mx-auto px-4">
        <GallerySection category={category} initialItems={initialItems} initialCursor={initialCursor} heading="Photos & Videos" />
      </div>
    </div>
  );
}
