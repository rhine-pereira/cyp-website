export interface EventItem {
  id: string;
  title: string;
  slug: string;
  date?: string; // ISO string
  location?: string;
  shortDescription?: string;
  longDescription?: string;
  // Header image can be a direct URL or an S3 key (if stored in our bucket)
  headerImageUrl?: string;
  headerImageKey?: string;
  // Link to an existing gallery category/slug to show photos for this event
  galleryCategory?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type EventsResponse = {
  items: EventItem[];
};
