import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { useCurrentUser } from "./useCurrentUser";
import { db } from "@/lib/firebase.config";

// ... (keep the existing WishlistItem and WishlistInput interfaces)
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


const WISHLIST_STORAGE_KEY = "kg_luxee_wishlist";

export function useWishlist() {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
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
    } else {
      const storedItems = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    }
  }, [user, items]);

  const isWishlisted = (productId: string) => items.some((i) => i.product_id === productId);

  const toggleWishlist = async (product: WishlistInput) => {
    setMutatingId(product.id);
    try {
      if (user) {
        const wishRef = collection(db, "users", user.uid, "wishlist");
        const existingId = items.find((i) => i.product_id === product.id)?.id;

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
      } else {
        const existingItem = items.find((i) => i.product_id === product.id);

        if (existingItem) {
          setItems((prev) => prev.filter((i) => i.product_id !== product.id));
          toast.success("Removed from wishlist");
        } else {
          setItems((prev) => [
            ...prev,
            {
              id: product.id,
              product_id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
            },
          ]);
          toast.success("Added to wishlist");
        }
      }
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setMutatingId(null);
    }
  };

  const removeItem = async (productId: string) => {
    setMutatingId(productId);
    try {
      if (user) {
        const wishRef = collection(db, "users", user.uid, "wishlist");
        const existingId = items.find((i) => i.product_id === productId)?.id;

        if (existingId) {
          await deleteDoc(doc(wishRef, existingId));
          toast.success("Removed from wishlist");
          return;
        }

        const dupQuery = query(wishRef, where("product_id", "==", productId));
        const dupSnap = await getDocs(dupQuery);
        if (!dupSnap.empty) {
          await deleteDoc(doc(wishRef, dupSnap.docs[0].id));
          toast.success("Removed from wishlist");
        }
      } else {
        setItems((prev) => prev.filter((i) => i.product_id !== productId));
        toast.success("Removed from wishlist");
      }
    } catch (err) {
      console.error("Failed to remove wishlist item:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setMutatingId(null);
    }
  };

  const isMutating = (productId: string) => mutatingId === productId;

  return { items, loading, isWishlisted, toggleWishlist, removeItem, isMutating };
}