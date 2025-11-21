"use client";

import { useEffect, useState } from "react";
import type { EventItem } from "@/app/types/event";
import Link from "next/link";
import Spinner from "@/app/components/Spinner";

export default function EventsPage() {
	const [events, setEvents] = useState<EventItem[]>([]);
	const [randomThumbs, setRandomThumbs] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | undefined>();

	// Warm Espresso Theme Colors
	const theme = {
		background: '#1C1917',
		surface: '#1C1917',
		primary: '#FB923C',
		text: '#FAFAFA',
		border: '#FB923C30',
	};

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const res = await fetch("/api/events", { cache: "no-store" });
				const data = await res.json();
				if (!res.ok) throw new Error(data?.error || "Failed to load events");
				setEvents((data.items as EventItem[]) || []);
			} catch (e: any) {
				setError(e?.message || "Failed to load events");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// Fetch a random gallery image for each event lacking a headerImageUrl
	useEffect(() => {
		if (events.length === 0) return;
		const neededCategories = new Set<string>();
		for (const ev of events) {
			if (!ev.headerImageUrl && ev.galleryCategory && !randomThumbs[ev.galleryCategory]) {
				neededCategories.add(ev.galleryCategory);
			}
		}
		if (neededCategories.size === 0) return;
		(async () => {
			const updates: Record<string, string> = {};
			await Promise.all(Array.from(neededCategories).map(async (cat) => {
				try {
					// Fetch up to 50 items to get variety; then pick one randomly
					const params = new URLSearchParams();
					params.set('category', cat);
					params.set('limit', '50');
					const res = await fetch(`/api/gallery?${params.toString()}`, { cache: 'no-store' });
					if (!res.ok) return;
					const data = await res.json();
					const items = (data.items as any[]) || [];
					if (items.length === 0) return;
					// Prefer true images; if none, only use videos that have a thumbnailUrl
					const imageItems = items.filter((it) => it?.type === 'image' && (it.thumbnailUrl || it.url));
					const videoThumbs = items.filter((it) => it?.type === 'video' && it.thumbnailUrl);
					const pool = imageItems.length > 0 ? imageItems : videoThumbs;
					if (pool.length === 0) return; // nothing we can safely show as an <img>
					const pick = pool[Math.floor(Math.random() * pool.length)];
					updates[cat] = pick.thumbnailUrl || pick.url;
				} catch {
					// ignore per-category errors
				}
			}));
			if (Object.keys(updates).length > 0) {
				setRandomThumbs(prev => ({ ...prev, ...updates }));
			}
		})();
	}, [events, randomThumbs]);

	if (loading) return (
		<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
			<Spinner
				label="Loading events…"
				trackClassName="border-white/20"
				ringClassName="border-t-[#FB923C]"
				labelClassName="text-[#FAFAFA]"
			/>
		</div>
	);
	if (error) return (
		<div className="min-h-screen flex items-center justify-center p-6 text-red-500" style={{ backgroundColor: theme.background }}>
			{error}
		</div>
	);

	return (
		<div className="min-h-screen p-6" style={{ backgroundColor: theme.background, color: theme.text }}>
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8" style={{ color: theme.text }}>Events</h1>
				{events.length === 0 ? (
					<div className="text-lg opacity-70">No events yet.</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{events.map((ev) => (
							<Link
								key={ev.id}
								href={`/events/${encodeURIComponent(ev.slug)}`}
								className="group rounded-xl border overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
								style={{
									backgroundColor: theme.surface,
									borderColor: theme.border
								}}
							>
								<div className="aspect-[4/3] w-full bg-gray-900 overflow-hidden relative">
									{(() => {
										const imgSrc = ev.headerImageUrl || (ev.galleryCategory ? randomThumbs[ev.galleryCategory] : undefined);
										if (!imgSrc) {
											return <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">No image</div>;
										}
										return (
											<>
												{/* eslint-disable-next-line @next/next/no-img-element */}
												<img
													src={imgSrc}
													alt={ev.title}
													className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
													onError={(e) => { const img = e.currentTarget as HTMLImageElement; img.onerror = null; img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="%23262626"/></svg>'; }}
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
											</>
										);
									})()}
								</div>
								<div className="p-5">
									<div className="font-bold text-xl truncate mb-2" style={{ color: theme.text }}>{ev.title}</div>
									<div className="text-sm font-medium mb-1 opacity-80" style={{ color: theme.primary }}>
										{ev.location || "Location TBA"}
									</div>
									<div className="text-xs font-bold uppercase tracking-wider mb-3 opacity-60">
										{ev.date ? new Date(ev.date).toDateString() : ''}
									</div>
									<p className="text-sm line-clamp-3 opacity-70 leading-relaxed">{ev.shortDescription || ''}</p>

									<div className="mt-4 flex items-center text-sm font-semibold" style={{ color: theme.primary }}>
										View Details <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

