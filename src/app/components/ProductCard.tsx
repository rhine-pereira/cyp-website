"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Product } from "../types/product";
import { Button } from "./ui/button";
import { useRef } from "react";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const [idx, setIdx] = useState(0);
  const images = product.images && product.images.length > 0 ? product.images : ["/christmasfellowship.jpeg"];
  const [added, setAdded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((v) => (v + 1) % images.length);
    }, 2500);
    return () => clearInterval(t);
  }, [images.length]);

  const priceSection = useMemo(() => {
    const hasCompare = product.compareAtPrice && product.compareAtPrice > product.price;
    return (
      <div className="mt-1 flex items-baseline gap-1.5">
        {hasCompare ? (
          <>
            <span className="text-slate-400 line-through text-xs">₹{product.compareAtPrice}</span>
            <span className="text-base font-semibold text-sky-700">₹{product.price}</span>
          </>
        ) : (
          <span className="text-base font-semibold text-sky-700">₹{product.price}</span>
        )}
      </div>
    );
  }, [product.compareAtPrice, product.price]);

  const flyToCart = () => {
    const source = imgRef.current;
    const target = document.getElementById("cart-cta");
    if (!source || !target) return;
    const s = source.getBoundingClientRect();
    const t = target.getBoundingClientRect();
    const clone = source.cloneNode(true) as HTMLImageElement;
    clone.style.position = "fixed";
    clone.style.left = `${s.left}px`;
    clone.style.top = `${s.top}px`;
    clone.style.width = `${s.width}px`;
    clone.style.height = `${s.height}px`;
    clone.style.borderRadius = "12px";
    clone.style.boxShadow = "0 10px 20px rgba(0,0,0,0.15)";
    clone.style.zIndex = "9999";
    clone.style.transition = "transform 1.1s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.1s ease";
    document.body.appendChild(clone);
    const dx = t.left + t.width / 2 - (s.left + s.width / 2);
    const dy = t.top + t.height / 2 - (s.top + s.height / 2);
    requestAnimationFrame(() => {
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.15)`;
      clone.style.opacity = "0.2";
    });
    setTimeout(() => {
      clone.remove();
    }, 1150);
  };

  return (
    <div className="relative border rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition">
      <div className="aspect-square w-full bg-slate-50 overflow-hidden">
        <img ref={imgRef} src={images[idx]} alt={product.title} className="h-full w-full object-cover" />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-slate-900 line-clamp-1 text-sm">{product.title}</h3>
        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{product.description}</p>
        {priceSection}
        <Button
          className={`mt-2 w-full ${added ? "bg-green-600 hover:bg-green-700" : ""}`}
          size="sm"
          disabled={!product.inStock}
          onClick={() => {
            window.dispatchEvent(new CustomEvent("add-to-cart", { detail: product }));
            flyToCart();
            setAdded(true);
            const t = setTimeout(() => setAdded(false), 1400);
            return () => clearTimeout(t);
          }}
        >
          {product.inStock ? (added ? "Added" : "Add to Cart") : "Out of Stock"}
        </Button>
      </div>
      <div
        className={`pointer-events-none absolute top-2 right-2 rounded-full bg-green-600 text-white text-xs px-2 py-1 shadow-md transition-all duration-300 ${added ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
      >
        Added
      </div>
    </div>
  );
}
