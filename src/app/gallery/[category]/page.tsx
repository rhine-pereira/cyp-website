import React from 'react';
import type { GalleryItem } from '@/app/types/gallery';
import CategoryGalleryClient from '@/app/gallery/[category]/CategoryGalleryClient';

type Props = {
  params: Promise<{ category: string }>;
};

async function getCategoryData(category: string) {
  // For server-side rendering, we need to handle the API call differently
  // In production, we can't use localhost, so we'll use relative URLs or skip SSR data fetching
  const isServer = typeof window === 'undefined';
  
  if (!isServer) {
    // Client-side should never reach here since this is a server component
    return { items: [], nextCursor: undefined, categoryLabel: category };
  }

  // On the server, we can either:
  // 1. Import and call the API logic directly
  // 2. Return empty initial data and let client fetch
  // For now, return empty and let client component handle it
  return { items: [], nextCursor: undefined, categoryLabel: category };
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const { categoryLabel } = await getCategoryData(decodedCategory);
  
  return {
    title: `${categoryLabel} - Gallery | Christian Youth in Power`,
    description: `Browse photos and videos from ${categoryLabel}`,
    openGraph: {
      title: `${categoryLabel} - Gallery`,
      description: `Browse photos and videos from ${categoryLabel}`,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const { items, nextCursor, categoryLabel } = await getCategoryData(decodedCategory);

  return (
    <CategoryGalleryClient 
      category={decodedCategory}
      categoryLabel={categoryLabel}
      initialItems={items}
      initialCursor={nextCursor}
    />
  );
}
