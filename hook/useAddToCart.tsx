"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase.config";
import { useCurrentUser } from "./useCurrentUser";

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  size: string | null;
  color: string | null;
  quantity: number;
}

export interface AddToCartInput {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock?: number; // defaults to 1 (available) if the product doc has no stock field yet
  size?: string;
  color?: string;
  quantity?: number;
}

export function useCart() {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const cartRef = collection(db, "users", user.uid, "add-to-cart");
    const unsub = onSnapshot(
      cartRef,
      (snap) => {
        const rows: CartItem[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            product_id: data.product_id,
            name: data.name,
            price: data.price,
            imageUrl: data.imageUrl,
            stock: data.stock ?? 1,
            size: data.size ?? null,
            color: data.color ?? null,
            quantity: data.quantity ?? 1,
          };
        });
        setItems(rows);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load cart:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const addToCart = useCallback(
    async (product: AddToCartInput) => {
      if (!user) {
        toast.error("Please wait a moment and try again.");
        return;
      }

      const stock = product.stock ?? 1;
      if (stock === 0) {
        toast.error("This item is sold out.");
        return;
      }

      const size = product.size || null;
      const color = product.color || null;
      const qty = product.quantity ?? 1;

      setAddingId(product.id);
      try {
        const cartRef = collection(db, "users", user.uid, "add-to-cart");

        const dupQuery = query(
          cartRef,
          where("product_id", "==", product.id),
          where("size", "==", size),
          where("color", "==", color)
        );
        const dupSnap = await getDocs(dupQuery);

        if (!dupSnap.empty) {
          const existing = dupSnap.docs[0];
          const newQty = existing.data().quantity + qty;
          await updateDoc(doc(cartRef, existing.id), {
            quantity: Math.min(newQty, stock),
          });
        } else {
          await addDoc(cartRef, {
            product_id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stock,
            size,
            color,
            quantity: Math.min(qty, stock),
            createdAt: serverTimestamp(),
          });
        }

        toast.success("Added to cart");
      } catch (err) {
        console.error("Failed to add to cart:", err);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setAddingId(null);
      }
    },
    [user]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number, stock?: number) => {
      if (!user) return;
      try {
        if (quantity <= 0) {
          await deleteDoc(doc(db, "users", user.uid, "add-to-cart", itemId));
        } else {
          await updateDoc(doc(db, "users", user.uid, "add-to-cart", itemId), {
            quantity: stock ? Math.min(quantity, stock) : quantity,
          });
        }
      } catch (err) {
        console.error("Failed to update quantity:", err);
        toast.error("Couldn't update quantity.");
      }
    },
    [user]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      if (!user) return;
      try {
        await deleteDoc(doc(db, "users", user.uid, "add-to-cart", itemId));
      } catch (err) {
        console.error("Failed to remove item:", err);
        toast.error("Couldn't remove item.");
      }
    },
    [user]
  );

  const isAdding = useCallback((productId: string) => addingId === productId, [addingId]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, loading, addToCart, updateQuantity, removeFromCart, isAdding, totalItems, totalPrice };
}