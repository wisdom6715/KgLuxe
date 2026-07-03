"use client";

import { useCallback, useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
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

export interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock?: number; // optional until it's added to every product doc
}

export interface WishlistInput {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export function useWishlist() {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const wishRef = collection(db, "users", user.uid, "wishlist");
    const unsub = onSnapshot(
      wishRef,
      (snap) => {
        const rows: WishlistItem[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            product_id: data.product_id,
            name: data.name,
            price: data.price,
            imageUrl: data.imageUrl,
          };
        });
        setItems(rows);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load wishlist:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const getWishlistDocId = useCallback(
    (productId: string) => items.find((i) => i.product_id === productId)?.id ?? null,
    [items]
  );

  const isWishlisted = useCallback(
    (productId: string) => getWishlistDocId(productId) !== null,
    [getWishlistDocId]
  );

  const toggleWishlist = useCallback(
    async (product: WishlistInput) => {
      if (!user) {
        toast.error("Please log in to add items to your cart.");
        return;
      }

      setMutatingId(product.id);
      try {
        const wishRef = collection(db, "users", user.uid, "wishlist");
        const existingId = getWishlistDocId(product.id);

        if (existingId) {
          await deleteDoc(doc(wishRef, existingId));
          toast.success("Removed from wishlist");
        } else {
          const dupQuery = query(wishRef, where("product_id", "==", product.id));
          const dupSnap = await getDocs(dupQuery);
          if (!dupSnap.empty) {
            await deleteDoc(doc(wishRef, dupSnap.docs[0].id));
            toast.success("Removed from wishlist");
          } else {
            await addDoc(wishRef, {
              product_id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              createdAt: serverTimestamp(),
            });
            toast.success("Added to wishlist");
          }
        }
      } catch (err) {
        console.error("Failed to update wishlist:", err);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setMutatingId(null);
      }
    },
    [user, getWishlistDocId]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (!user) {
        toast.error("Please wait a moment and try again.");
        return;
      }

      setMutatingId(productId);
      try {
        const wishRef = collection(db, "users", user.uid, "wishlist");
        const existingId = getWishlistDocId(productId);

        if (existingId) {
          await deleteDoc(doc(wishRef, existingId));
          toast.success("Removed from wishlist");
          return;
        }

        // Fallback in case local state hasn't caught up with Firestore yet
        const dupQuery = query(wishRef, where("product_id", "==", productId));
        const dupSnap = await getDocs(dupQuery);
        if (!dupSnap.empty) {
          await deleteDoc(doc(wishRef, dupSnap.docs[0].id));
          toast.success("Removed from wishlist");
        }
      } catch (err) {
        console.error("Failed to remove wishlist item:", err);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setMutatingId(null);
      }
    },
    [user, getWishlistDocId]
  );

  const isMutating = useCallback((productId: string) => mutatingId === productId, [mutatingId]);

  return { items, loading, isWishlisted, toggleWishlist, removeItem, isMutating };
}