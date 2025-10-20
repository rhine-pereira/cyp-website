'use client'
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

const images = [
  "bangloreputreach.jpeg",
  "beachfellowship.jpeg",
  "borivalioutreach.jpeg",
  "camp2025.jpg",
  "christmasfellowship.jpeg",
  "feb_recollection.jpeg",
  "fellowship.jpeg",
  "k24.jpeg",
  "nvrecollec.jpeg",
  "orpahnagenv.jpeg",
  "soprts.jpeg",
];

const imageInfo = [
  "Bangalore Outreach",
  "Beach Fellowship",
  "Borivali Outreach",
  "Camp 2025",
  "Christmas Fellowship",
  "February Recollection",
  "Fellowship",
  "K24",
  "NV Recollection",
  "Orphanage NV",
  "Sports",
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const total = images.length;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prev = () => {
    setCurrent((current - 1 + total) % total);
  };
  const next = () => {
    setCurrent((current + 1) % total);
  };

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrent((c) => (c + 1) % total);
    }, 7000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, total]);

  return (
    <section className="w-full flex flex-col items-center py-8">
      <div className="bg-[#f5f8fd] rounded-2xl shadow-lg p-8 w-full max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold text-yellow-500 text-center mb-2">Our Events</h2>
        <div className="w-full border-b-2 border-yellow-400 mb-8"></div>
        <div className="relative w-full max-w-xl flex items-center justify-center mb-6 h-64">
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-blue-400 text-white rounded-lg p-4 shadow hover:bg-blue-500 transition z-10"
            aria-label="Previous"
          >
            <span className="text-2xl">&#x2039;</span>
          </button>
          <div className="w-full h-64 flex items-center justify-center overflow-hidden rounded-xl shadow-lg bg-white relative">
            <Image
              src={`/${images[current]}`}
              alt={imageInfo[current]}
              width={400}
              height={256}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-400 text-white rounded-lg p-4 shadow hover:bg-blue-500 transition z-10"
            aria-label="Next"
          >
            <span className="text-2xl">&#x203A;</span>
          </button>
        </div>
        <div className="text-center text-gray-700 text-xl font-medium mb-4">
          {imageInfo[current]}
        </div>
        <div className="flex gap-2 mt-2 justify-center">
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full ${idx === current ? "bg-yellow-500" : "bg-gray-300"}`}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
