"use client";

import React from 'react';
import Link from 'next/link';
import GallerySection from '@/app/components/Gallery/GallerySection';
import type { GalleryItem } from '@/app/types/gallery';
import { ArrowLeft } from 'lucide-react';

// Warm Espresso Theme Colors
const theme = {
  background: '#1C1917',
  surface: '#1C1917',
  primary: '#FB923C',
  text: '#FAFAFA',
  border: '#FB923C30',
};

function Hero({ categoryLabel }: { categoryLabel: string }) {
  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: theme.background }}>
      <div className="absolute inset-0 opacity-10 blur-3xl bg-[radial-gradient(circle_at_20%_20%,#FB923C,transparent_40%),radial-gradient(circle_at_80%_30%,#FCD34D,transparent_40%),radial-gradient(circle_at_50%_80%,#FB923C,transparent_40%)]" />
      <div className="container mx-auto px-4 py-20 relative">
        <Link
          href="/gallery"
          className="inline-flex items-center text-sm font-medium hover:opacity-80 transition-opacity mb-6"
          style={{ color: theme.primary }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all categories
        </Link>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight" style={{ color: theme.text }}>{categoryLabel}</h1>
        <p className="mt-4 max-w-2xl text-lg opacity-80" style={{ color: theme.text }}>Browse photos and videos from this event</p>
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
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      <Hero categoryLabel={categoryLabel} />
      <div className="py-8 container mx-auto px-4">
        <GallerySection
          category={category}
          initialItems={initialItems}
          initialCursor={initialCursor}
          heading="Photos & Videos"
          theme="dark"
        />
      </div>
    </div>
  );
}
