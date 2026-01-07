"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "../types/product";
import ProductCard from "../components/ProductCard";
import { useCart } from "../providers/CartProvider";
import { Button } from "../components/ui/button";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../lib/firebase";

const theme = {
  background: '#1C1917',
  surface: '#1C1917',
  primary: '#FB923C',
  text: '#FAFAFA',
  border: '#FB923C30',
};

export default function FundraiserPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { count, subtotal } = useCart();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const col = collection(db, "fundraiser_items");
        const qy = query(col);
        const snap = await getDocs(qy);
        const list: Product[] = snap.docs
          .map((d) => ({ ...(d.data() as any), id: d.id }))
          .sort((a, b) => String(a.title ?? '').localeCompare(String(b.title ?? '')));
        setItems(list);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const inStockItems = useMemo(() => items.filter((p) => (p.inStock !== false) && (p.active !== false)), [items]);

  return (
    <div className="p-4 pb-24 min-h-screen" style={{ backgroundColor: theme.background }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Fundraiser Store</h1>
      </div>
      
      <div className="mb-4 p-4 rounded-lg border" style={{ backgroundColor: 'rgba(251, 146, 60, 0.05)', borderColor: theme.border }}>
        <h2 className="text-base font-bold mb-2" style={{ color: theme.primary }}>🎯 Supporting Our Mission</h2>
        <p className="text-sm" style={{ color: theme.text, opacity: 0.8 }}>
          Funds raised support CYP Works of Mercy & Charity, Evangelizing youth, and Conducting retreats & youth camps.
        </p>
      </div>

      <Link href="/lottery" className="block mb-6">
        <div className="relative overflow-hidden rounded-xl border-2 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer" style={{ backgroundColor: 'rgba(251, 146, 60, 0.08)', borderColor: theme.border }}>
          <div className="text-center relative z-10">
            <div className="text-4xl mb-2">🎟️</div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: theme.primary }}>
              Lottery Has Ended
            </h3>
            <p className="text-lg font-semibold mb-3" style={{ color: theme.text }}>
              Thank you for your amazing support!
            </p>
            <p className="text-sm" style={{ color: theme.text, opacity: 0.7 }}>
              The draw was held on 29th December 2025 at Jeevan Darshan Kendra, Giriz
            </p>
            <div className="inline-block px-6 py-2 rounded-full font-bold text-sm mt-3" style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)', color: theme.text }}>
              Click to see details
            </div>
          </div>
        </div>
      </Link>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="rounded-xl border-2 p-8 text-center" style={{ backgroundColor: 'rgba(251, 146, 60, 0.08)', borderColor: theme.border }}>
        <div className="text-6xl mb-4">🎄</div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: theme.primary }}>Store Closed for the Season</h2>
        <p className="text-lg mb-2" style={{ color: theme.text, opacity: 0.9 }}>
          Thank you for your amazing support this year!
        </p>
        <p className="text-base" style={{ color: theme.text, opacity: 0.7 }}>
          Our fundraiser store will reopen next season. Stay tuned for updates!
        </p>
        <div className="mt-6 text-sm" style={{ color: theme.text, opacity: 0.6 }}>
          ✨ Your contributions help us continue our mission of mercy, charity, and evangelization ✨
        </div>
      </div>

      <div className="fixed bottom-4 left-0 right-0">
        <div className="px-4">
          <div className="rounded-full shadow-lg border p-2 flex items-center justify-between" style={{ backgroundColor: theme.surface, borderColor: theme.primary }}>
            <div className="px-3 text-sm" style={{ color: theme.text }}>
              <span className="font-semibold">Cart:</span> {count} item{count !== 1 ? "s" : ""} • ₹{subtotal.toFixed(2)}
            </div>
            <Button asChild className="rounded-full px-6" style={{ backgroundColor: theme.primary, color: theme.background, border: 'none' }}>
              <Link id="cart-cta" href="/fundraiser/cart" className="hover:opacity-90">View Cart & Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
