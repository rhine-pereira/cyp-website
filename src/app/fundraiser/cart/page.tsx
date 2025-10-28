"use client";

import React from "react";
import { useCart } from "../../providers/CartProvider";
import { Button } from "../../components/ui/button";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQty, removeFromCart, subtotal, clearCart } = useCart();
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-gray-600">Your cart is empty.</div>
      ) : (
        <div className="space-y-4">
          {items.map(({ product, qty }) => (
            <div key={product.id} className="flex gap-3 border rounded-md p-3">
              <img src={product.images[0]} alt={product.title} className="h-20 w-20 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{product.title}</div>
                <div className="text-sm text-gray-600 line-clamp-2">{product.description}</div>
                <div className="mt-1 text-sky-700">₹{product.price}</div>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Decrease quantity"
                    onClick={() => updateQty(product.id, Math.max(1, qty - 1))}
                  >
                    −
                  </Button>
                  <span className="inline-flex items-center justify-center min-w-8 px-2 h-8 border rounded-md text-gray-900 bg-white">
                    {qty}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Increase quantity"
                    onClick={() => updateQty(product.id, qty + 1)}
                  >
                    +
                  </Button>
                  <Button variant="outline" onClick={() => removeFromCart(product.id)}>Remove</Button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-lg font-semibold text-gray-900">Subtotal: ₹{subtotal.toFixed(2)}</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearCart}>Clear</Button>
              <Button>Checkout</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
