"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { collection, deleteDoc, doc, getDocs, query, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import type { Product } from "@/app/types/product";
import AuthGuard from "@/app/components/Auth/AuthGuard";

export default function ManageFundraiserPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const col = collection(db, "fundraiser_items");
      const q = query(col);
      const snap = await getDocs(q);
      const list: Product[] = snap.docs.map((d) => ({ ...(d.data() as any), id: d.id }))
        .sort((a, b) => String(a.title ?? '').localeCompare(String(b.title ?? '')));
      setItems(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeCount = useMemo(() => items.filter(i => i.active !== false && i.inStock).length, [items]);

  const toggleActive = async (p: Product) => {
    await updateDoc(doc(db, "fundraiser_items", p.id), { active: !(p.active !== false) });
    await load();
  };

  const toggleStock = async (p: Product) => {
    await updateDoc(doc(db, "fundraiser_items", p.id), { inStock: !p.inStock });
    await load();
  };

  const remove = async (p: Product) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    await deleteDoc(doc(db, "fundraiser_items", p.id));
    await load();
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#1C1917]">
        <div className="max-w-5xl mx-auto p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#FAFAFA]">Manage Fundraiser Listings</h1>
            <Link href="/admin/fundraiser" className="text-[#FB923C] hover:underline">Add New</Link>
          </div>

          <div className="text-sm text-[#FAFAFA]/70">Active listings: {activeCount}</div>

          {loading ? (
            <div className="text-[#FAFAFA]/50">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-[#FAFAFA]/50">No items available.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((p) => (
                <div key={p.id} className="border border-[#FB923C]/30 rounded-lg p-3 bg-[#1C1917]">
                  <div className="aspect-square w-full bg-white/5 overflow-hidden rounded-md">
                    <img src={p.images?.[0]} alt={p.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-2 font-semibold text-[#FAFAFA]">{p.title}</div>
                  <div className="text-sm text-[#FAFAFA]/70 line-clamp-2">{p.description}</div>
                  <div className="mt-1 text-[#FB923C] font-medium">₹{p.price}{p.compareAtPrice ? ` (was ₹${p.compareAtPrice})` : ""}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(p)} className="border-[#FB923C]/30 text-[#FAFAFA] hover:bg-[#FB923C]/10">
                      {(p.active !== false) ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleStock(p)} className="border-[#FB923C]/30 text-[#FAFAFA] hover:bg-[#FB923C]/10">
                      {p.inStock ? "Mark Out of Stock" : "Mark In Stock"}
                    </Button>
                    <Link href={`/admin/fundraiser/manage/${p.id}`}>
                      <Button size="sm" variant="outline" className="border-[#FB923C]/30 text-[#FAFAFA] hover:bg-[#FB923C]/10">Edit</Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => remove(p)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
