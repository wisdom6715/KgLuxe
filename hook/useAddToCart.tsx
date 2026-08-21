"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useCurrentUser } from "./useCurrentUser";
import { db } from "@/lib/firebase.config";

export interface CartMeasurement {
  type: string;
  value: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  size: string | null;
  color: string | null;
  sizeMeasurements?: CartMeasurement[] | null;
  quantity: number;
}

export interface AddToCartInput {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock?: number;
  size?: string;
  color?: string;
  sizeMeasurements?: CartMeasurement[] | null;
  quantity?: number;
}

export interface CartSyncResult {
  synced: boolean;
  itemCount: number;
}

const CART_STORAGE_KEY = "kg_luxee_cart";

// Prevent two components (for example the login page and this hook) from
// merging the same guest cart concurrently in the same browser tab.
const syncInFlight = new Map<string, Promise<CartSyncResult>>();

const asPositiveInteger = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : fallback;
};

const quantityForStock = (quantity: number, stock: number) => {
  const safeQuantity = Math.max(1, Math.floor(quantity || 1));
  return stock > 0 ? Math.min(safeQuantity, stock) : safeQuantity;
};

const normalizeMeasurements = (
  measurements: unknown,
): CartMeasurement[] | null => {
  if (!Array.isArray(measurements) || measurements.length === 0) return null;

  return measurements
    .filter(
      (measurement): measurement is { type?: unknown; value?: unknown } => {
        return Boolean(measurement && typeof measurement === "object");
      },
    )
    .map((measurement) => ({
      type: String(measurement.type ?? ""),
      value: String(measurement.value ?? ""),
    }));
};

const measurementsKey = (measurements: CartMeasurement[] | null | undefined) =>
  JSON.stringify(normalizeMeasurements(measurements) ?? []);

const sameCartVariant = (a: CartItem, b: CartItem) =>
  a.product_id === b.product_id &&
  a.size === b.size &&
  a.color === b.color &&
  measurementsKey(a.sizeMeasurements) === measurementsKey(b.sizeMeasurements);

const makeGuestItemId = (
  item: Pick<CartItem, "product_id" | "size" | "color" | "sizeMeasurements">,
) =>
  [
    item.product_id,
    item.size ?? "",
    item.color ?? "",
    measurementsKey(item.sizeMeasurements),
  ]
    .map((part) => encodeURIComponent(part))
    .join("__");

const fromFirestore = (
  id: string,
  data: Record<string, unknown>,
): CartItem => ({
  id,
  product_id: String(data.product_id ?? ""),
  name: String(data.name ?? ""),
  price: Number(data.price ?? 0),
  imageUrl: String(data.imageUrl ?? ""),
  stock: asPositiveInteger(data.stock, 1),
  size: data.size == null ? null : String(data.size),
  color: data.color == null ? null : String(data.color),
  sizeMeasurements: normalizeMeasurements(data.sizeMeasurements),
  quantity: Math.max(1, asPositiveInteger(data.quantity, 1)),
});

const readGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Guest cart is not an array");

    return parsed
      .filter((item): item is Record<string, unknown> => {
        return Boolean(item && typeof item === "object");
      })
      .map((item) => {
        const normalized: CartItem = {
          id: String(item.id ?? ""),
          product_id: String(item.product_id ?? ""),
          name: String(item.name ?? ""),
          price: Number(item.price ?? 0),
          imageUrl: String(item.imageUrl ?? ""),
          stock: asPositiveInteger(item.stock, 1),
          size: item.size == null ? null : String(item.size),
          color: item.color == null ? null : String(item.color),
          sizeMeasurements: normalizeMeasurements(item.sizeMeasurements),
          quantity: Math.max(1, asPositiveInteger(item.quantity, 1)),
        };

        return {
          ...normalized,
          id: normalized.id || makeGuestItemId(normalized),
        };
      })
      .filter((item) => item.product_id.length > 0);
  } catch (error) {
    console.error("Failed to read the guest cart from localStorage:", error);
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
};

const writeGuestCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;

  try {
    if (items.length === 0) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  } catch (error) {
    console.error("Failed to save the guest cart to localStorage:", error);
    toast.error("Your cart could not be saved on this device.");
  }
};

const mergeGuestCart = async (uid: string): Promise<CartSyncResult> => {
  if (typeof window === "undefined") return { synced: false, itemCount: 0 };

  const stored = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) return { synced: false, itemCount: 0 };

  let guestItems: CartItem[];
  try {
    const parsed: unknown = JSON.parse(stored);
    guestItems = Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch (error) {
    console.error("Failed to parse the guest cart before sync:", error);
    return { synced: false, itemCount: 0 };
  }

  if (guestItems.length === 0) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return { synced: false, itemCount: 0 };
  }

  const cartRef = collection(db, "users", uid, "add-to-cart");
  const existingSnapshot = await getDocs(cartRef);
  const existingItems = existingSnapshot.docs.map((snapshot) => ({
    snapshot,
    item: fromFirestore(
      snapshot.id,
      snapshot.data() as Record<string, unknown>,
    ),
  }));

  // Use one batch so the local cart is removed only after every Firestore
  // write has succeeded. This also avoids the query/add/update race in the
  // original implementation.
  const batch = writeBatch(db);
  const matchedIds = new Set<string>();

  for (const guestItem of guestItems) {
    const match = existingItems.find(
      ({ snapshot, item }) =>
        !matchedIds.has(snapshot.id) && sameCartVariant(item, guestItem),
    );

    if (match) {
      matchedIds.add(match.snapshot.id);
      const existingQuantity = Math.max(
        0,
        Number(match.snapshot.data().quantity ?? 0),
      );
      const stock = Number(match.snapshot.data().stock ?? guestItem.stock);
      batch.update(match.snapshot.ref, {
        quantity: quantityForStock(
          existingQuantity + guestItem.quantity,
          stock,
        ),
      });
    } else {
      const newItemRef = doc(cartRef);
      batch.set(newItemRef, {
        product_id: guestItem.product_id,
        name: guestItem.name,
        price: guestItem.price,
        imageUrl: guestItem.imageUrl,
        stock: guestItem.stock,
        size: guestItem.size,
        color: guestItem.color,
        sizeMeasurements: guestItem.sizeMeasurements ?? null,
        quantity: quantityForStock(guestItem.quantity, guestItem.stock),
        createdAt: serverTimestamp(),
      });
    }
  }

  await batch.commit();

  // Do not delete a newer cart written while the sync was in progress.
  if (window.localStorage.getItem(CART_STORAGE_KEY) === stored) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  }

  return { synced: true, itemCount: guestItems.length };
};

/**
 * Call this immediately after sign-in and await it before redirecting to
 * checkout. The auth-transition effect below is retained as a fallback for
 * login flows that do not call this helper directly.
 */
export const syncGuestCartToFirestore = async (
  uid: string,
): Promise<CartSyncResult> => {
  const pending = syncInFlight.get(uid);
  if (pending) return pending;

  const nextSync = mergeGuestCart(uid).finally(() => {
    syncInFlight.delete(uid);
  });

  syncInFlight.set(uid, nextSync);
  return nextSync;
};

export function useCart() {
  const { user } = useCurrentUser();
  const uid = user?.uid ?? null;
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const lastUidRef = useRef<string | null>(null);
  const guestCartDirtyRef = useRef(false);

  // The guest cart is hydrated whenever the auth owner changes. Guest cart
  // writes are driven only by guest mutations, never by the initial state.
  useEffect(() => {
    setLoading(true);

    if (uid) {
      const cartRef = collection(db, "users", uid, "add-to-cart");
      const unsubscribe = onSnapshot(
        cartRef,
        (snapshot) => {
          setItems(
            snapshot.docs.map((itemSnapshot) =>
              fromFirestore(
                itemSnapshot.id,
                itemSnapshot.data() as Record<string, unknown>,
              ),
            ),
          );
          setLoading(false);
        },
        (error) => {
          console.error("Failed to load the account cart:", error);
          setLoading(false);
          toast.error("Could not load your saved cart.");
        },
      );

      return unsubscribe;
    }

    guestCartDirtyRef.current = false;
    setItems(readGuestCart());
    setLoading(false);
  }, [uid]);

  // Persist only carts changed while the user is a guest. This avoids the
  // initial [] state and logout transitions overwriting saved guest data.
  useEffect(() => {
    if (!uid && guestCartDirtyRef.current) {
      writeGuestCart(items);
      guestCartDirtyRef.current = false;
    }
  }, [uid, items]);

  // Sync on every real guest -> authenticated transition, including a page
  // reload where the user is already authenticated when the hook mounts.
  useEffect(() => {
    if (!uid) {
      lastUidRef.current = null;
      return;
    }

    if (lastUidRef.current === uid) return;
    lastUidRef.current = uid;

    let cancelled = false;
    setSyncing(true);

    syncGuestCartToFirestore(uid)
      .then(({ synced }) => {
        if (!cancelled && synced) {
          toast.success("Your guest cart has been saved to your account.");
        }
      })
      .catch((error) => {
        console.error("Failed to sync guest cart to Firestore:", error);
        if (!cancelled) toast.error("We could not sync your guest cart.");
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const updateGuestItems = useCallback(
    (updater: (current: CartItem[]) => CartItem[]) => {
      guestCartDirtyRef.current = true;
      setItems(updater);
    },
    [],
  );

  const addToCart = async (product: AddToCartInput) => {
    const stock = asPositiveInteger(product.stock, 1);
    if (stock === 0) {
      toast.error("This item is sold out.");
      return;
    }

    const size = product.size || null;
    const color = product.color || null;
    const sizeMeasurements = normalizeMeasurements(product.sizeMeasurements);
    const quantity = Math.max(1, Number(product.quantity ?? 1));

    setAddingId(product.id);
    try {
      if (uid) {
        const cartRef = collection(db, "users", uid, "add-to-cart");
        const candidates = await getDocs(
          query(
            cartRef,
            where("product_id", "==", product.id),
            where("size", "==", size),
            where("color", "==", color),
          ),
        );
        const candidate = candidates.docs
          .map((snapshot) => ({
            snapshot,
            item: fromFirestore(
              snapshot.id,
              snapshot.data() as Record<string, unknown>,
            ),
          }))
          .find(
            ({ item }) =>
              measurementsKey(item.sizeMeasurements) ===
              measurementsKey(sizeMeasurements),
          );

        if (candidate) {
          const currentQuantity = Number(
            candidate.snapshot.data().quantity ?? 0,
          );
          await updateDoc(candidate.snapshot.ref, {
            quantity: quantityForStock(currentQuantity + quantity, stock),
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
            sizeMeasurements,
            quantity: quantityForStock(quantity, stock),
            createdAt: serverTimestamp(),
          });
        }
      } else {
        updateGuestItems((current) => {
          const draft: CartItem = {
            id: "",
            product_id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stock,
            size,
            color,
            sizeMeasurements,
            quantity: quantityForStock(quantity, stock),
          };
          const existing = current.find((item) => sameCartVariant(item, draft));

          if (existing) {
            return current.map((item) =>
              item.id === existing.id
                ? {
                    ...item,
                    quantity: quantityForStock(item.quantity + quantity, stock),
                    stock,
                  }
                : item,
            );
          }

          return [...current, { ...draft, id: makeGuestItemId(draft) }];
        });
      }

      toast.success("Added to cart");
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setAddingId(null);
    }
  };

  const updateQuantity = async (
    itemId: string,
    quantity: number,
    stock?: number,
  ) => {
    if (uid) {
      try {
        if (quantity <= 0) {
          await deleteDoc(doc(db, "users", uid, "add-to-cart", itemId));
        } else {
          await updateDoc(doc(db, "users", uid, "add-to-cart", itemId), {
            quantity: quantityForStock(quantity, stock ?? 0),
          });
        }
      } catch (error) {
        console.error("Failed to update quantity:", error);
        toast.error("Could not update quantity.");
      }
      return;
    }

    updateGuestItems((current) => {
      if (quantity <= 0) return current.filter((item) => item.id !== itemId);
      return current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: quantityForStock(quantity, stock ?? item.stock),
            }
          : item,
      );
    });
  };

  const updateItem = async (
    itemId: string,
    updates: Partial<Omit<CartItem, "id" | "product_id">>,
  ) => {
    if (uid) {
      try {
        await updateDoc(doc(db, "users", uid, "add-to-cart", itemId), updates);
      } catch (error) {
        console.error("Failed to update item:", error);
        toast.error("Could not update item.");
        throw error;
      }
      return;
    }

    updateGuestItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item,
      ),
    );
  };

  const removeFromCart = async (itemId: string) => {
    if (uid) {
      try {
        await deleteDoc(doc(db, "users", uid, "add-to-cart", itemId));
      } catch (error) {
        console.error("Failed to remove item:", error);
        toast.error("Could not remove item.");
      }
      return;
    }

    updateGuestItems((current) => current.filter((item) => item.id !== itemId));
  };

  const isAdding = (productId: string) => addingId === productId;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return {
    items,
    loading,
    syncing,
    isGuest: !uid,
    user,
    addToCart,
    updateQuantity,
    updateItem,
    removeFromCart,
    isAdding,
    totalItems,
    totalPrice,
    syncGuestCartToFirestore,
  };
}

export { CART_STORAGE_KEY };
