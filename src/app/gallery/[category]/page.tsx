import React from 'react';
import type { GalleryItem } from '@/app/types/gallery';
import CategoryGalleryClient from '@/app/gallery/[category]/CategoryGalleryClient';

type Props = {
  params: Promise<{ category: string }>;
};

async function getCategoryData(category: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/gallery?category=${encodeURIComponent(category)}&limit=12`, {
      cache: 'no-store',
    });
    if (!res.ok) return { items: [], nextCursor: undefined, categoryLabel: category };
    const data = await res.json();
    const categoryLabel = data.items?.[0]?.categoryLabel || category;
    return { items: data.items || [], nextCursor: data.nextCursor, categoryLabel };
  } catch (error) {
    console.error('Error fetching category data:', error);
    return { items: [], nextCursor: undefined, categoryLabel: category };
  }
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
