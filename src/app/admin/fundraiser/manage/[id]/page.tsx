"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import AuthGuard from "@/app/components/Auth/AuthGuard";

export default function EditFundraiserItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id ?? "");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState<string>("");
  const [compareAtPrice, setCompareAtPrice] = useState<string>("");
  const [inStock, setInStock] = useState(true);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, "fundraiser_items", id));
        if (!snap.exists()) {
          setMsg("Item not found");
          return;
        }
        const d = snap.data() as any;
        setTitle(String(d.title ?? ""));
        setDescription(String(d.description ?? ""));
        setImages(Array.isArray(d.images) ? d.images as string[] : []);
        setPrice(String(d.price ?? ""));
        setCompareAtPrice(d.compareAtPrice != null ? String(d.compareAtPrice) : "");
        setInStock(d.inStock !== false);
        setActive(d.active !== false);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const canSave = useMemo(() => {
    const p = Number(price);
    const cp = compareAtPrice ? Number(compareAtPrice) : undefined;
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      images.filter((u) => u.trim().length > 0).length > 0 &&
      !Number.isNaN(p) && p > 0 &&
      (cp === undefined || (!Number.isNaN(cp) && (cp as number) > p))
    );
  }, [title, description, images, price, compareAtPrice]);

  const addImageField = () => setImages((prev) => [...prev, ""]);
  const changeImage = (i: number, v: string) => setImages((prev) => prev.map((u, idx) => (idx === i ? v : u)));
  const removeImageField = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    try {
      setSaving(true);
      setMsg("");
      await updateDoc(doc(db, "fundraiser_items", id), {
        title: title.trim(),
        description: description.trim(),
        images: images.map((u) => u.trim()).filter(Boolean),
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        inStock,
        active,
      });
      setMsg("Saved");
      router.back();
    } catch (e) {
      setMsg("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Fundraiser Item</h1>
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm text-gray-700">Title</span>
                <input className="mt-1 w-full border rounded-md px-3 h-10 text-gray-900" value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-700">Description</span>
                <textarea className="mt-1 w-full border rounded-md px-3 py-2 text-gray-900" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Images (URLs)</span>
                  <Button size="sm" variant="outline" onClick={addImageField}>Add Image</Button>
                </div>
                <div className="mt-2 space-y-2">
                  {images.map((u, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input className="flex-1 border rounded-md px-3 h-10 text-gray-900" value={u} onChange={(e) => changeImage(i, e.target.value)} placeholder="https://..." />
                      {images.length > 1 && (
                        <Button variant="ghost" onClick={() => removeImageField(i)}>Remove</Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm text-gray-700">Price (₹)</span>
                  <input type="number" min="1" className="mt-1 w-full border rounded-md px-3 h-10 text-gray-900" value={price} onChange={(e) => setPrice(e.target.value)} />
                </label>
                <label className="block">
                  <span className="text-sm text-gray-700">Compare-at (₹)</span>
                  <input type="number" min="1" className="mt-1 w-full border rounded-md px-3 h-10 text-gray-900" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} />
                </label>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
                  <span className="text-gray-900">In Stock</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                  <span className="text-gray-900">Active</span>
                </label>
              </div>
              <Button className="w-full" disabled={!canSave || saving} onClick={save}>{saving ? "Saving..." : "Save Changes"}</Button>
              {msg && <div className="text-sm text-gray-700">{msg}</div>}
            </div>
            <div className="rounded-lg border p-3 bg-white">
              <div className="text-sm text-gray-700">Preview</div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {images.filter(Boolean).slice(0, 2).map((u, i) => (
                  <img key={i} src={u} alt="preview" className="aspect-square object-cover rounded-md border" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
