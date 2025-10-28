"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "../types/product";
import ProductCard from "../components/ProductCard";
import { useCart } from "../providers/CartProvider";
import { Button } from "../components/ui/button";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function FundraiserPage() {
  const [items, setItems] = useState<Product[]>([]);
  const { count, subtotal } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const col = collection(db, "fundraiser_items");
        const qy = query(col);
        const snap = await getDocs(qy);
        const list: Product[] = snap.docs
          .map((d) => ({ ...(d.data() as any), id: d.id }))
          .sort((a, b) => String(a.title ?? '').localeCompare(String(b.title ?? '')));
        setItems(list);
      } catch {
        setItems([]);
      }
    }
    load();
  }, []);

  const inStockItems = useMemo(() => items.filter((p) => (p.inStock !== false) && (p.active !== false)), [items]);

  return (
    <div className="max-w-6xl mx-auto p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Fundraiser Store</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {inStockItems.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {inStockItems.length === 0 && (
          <div className="text-gray-600">No active listings at the moment.</div>
        )}
      </div>

      <div className="fixed bottom-4 left-0 right-0">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-full shadow-lg border bg-white p-2 flex items-center justify-between">
            <div className="px-3 text-sm text-gray-900">
              <span className="font-semibold">Cart:</span> {count} item{count !== 1 ? "s" : ""} • ₹{subtotal.toFixed(2)}
            </div>
            <Button asChild className="rounded-full px-6">
              <Link id="cart-cta" href="/fundraiser/cart">View Cart & Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
