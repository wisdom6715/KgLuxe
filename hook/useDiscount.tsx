// hooks/useDiscount.ts
"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase.config";
import { type Discount, DISCOUNT_DOC_ID } from "@/lib/discount";

export function useDiscount() {
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "discounts", DISCOUNT_DOC_ID),
      (snap) => {
        if (snap.exists()) {
          setDiscount({ id: snap.id, ...snap.data() } as Discount);
        } else {
          setDiscount(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load discount:", err);
        setDiscount(null);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  return { discount, loading };
}