"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/app/components/ui/button";
import type { Product } from "@/app/types/product";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import Link from "next/link";
import AuthGuard from "@/app/components/Auth/AuthGuard";

function uuid() {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) return (crypto as any).randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function AdminFundraiserAddPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([""]);
  const [price, setPrice] = useState<string>("");
  const [compareAtPrice, setCompareAtPrice] = useState<string>("");
  const [inStock, setInStock] = useState(true);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

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

  const handleFileUpload = async (i: number, file: File) => {
    try {
      setUploadingIdx(i);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("uploadType", "image");
      fd.append("isAdminUpload", "true");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data?.success && data?.url) {
        setImages((prev) => prev.map((u, idx) => (idx === i ? data.url as string : u)));
        setMessage("Image uploaded");
      } else {
        setMessage("Upload failed");
      }
    } catch {
      setMessage("Upload failed");
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleMultipleFileUpload = async (i: number, files: FileList) => {
    const fileArr = Array.from(files);
    if (fileArr.length === 0) return;
    // Upload sequentially to keep order predictable
    for (let idx = 0; idx < fileArr.length; idx++) {
      const f = fileArr[idx];
      try {
        setUploadingIdx(i);
        const fd = new FormData();
        fd.append("file", f);
        fd.append("uploadType", "image");
        fd.append("isAdminUpload", "true");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data?.success && data?.url) {
          setImages((prev) => {
            const next = [...prev];
            if (idx === 0) {
              next[i] = data.url as string;
            } else {
              next.push(data.url as string);
            }
            return next;
          });
          setMessage("Image uploaded");
        } else {
          setMessage("Upload failed");
        }
      } catch {
        setMessage("Upload failed");
      } finally {
        setUploadingIdx(null);
      }
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      setMessage("");
      await addDoc(collection(db, "fundraiser_items"), {
        title: title.trim(),
        description: description.trim(),
        images: images.map((u) => u.trim()).filter(Boolean),
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
        inStock,
        active,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setDescription("");
      setImages([""]);
      setPrice("");
      setCompareAtPrice("");
      setInStock(true);
      setActive(true);
      setMessage("Saved successfully");
    } catch (e) {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fundraiser Admin</h1>
        <Link href="/admin/fundraiser/manage" className="text-sky-700 hover:underline">Manage Listings</Link>
      </div>

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
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:text-gray-900 hover:file:bg-slate-200"
                    onChange={(e) => {
                      const fl = e.target.files;
                      if (fl && fl.length > 0) {
                        handleMultipleFileUpload(i, fl);
                      }
                    }}
                  />
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
          <Button className="w-full" disabled={!canSave || saving} onClick={save}>{saving ? "Saving..." : "Save Item"}</Button>
          {message && <div className="text-sm text-gray-700">{message}</div>}
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
    </div>
    </AuthGuard>
  );
}
