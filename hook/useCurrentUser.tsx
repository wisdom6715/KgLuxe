// hooks/useCurrentUser.ts
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase.config";

type UserProfile = {
  uid:         string;
  firstName:   string;
  lastName:    string;
  email:       string;
  phone:       string;
  dialCode:    string;
  countryCode: string;
  displayName: string;
  photoURL:    string | null;
  provider:    string;
  createdAt:   any;
};

export function useCurrentUser() {
  const [user,    setUser]    = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Step 1 — watch auth state
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Step 2 — watch their Firestore doc in real-time
      const userRef = doc(db, "users", firebaseUser.uid);
      const unsubDoc = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          setUser({ uid: firebaseUser.uid, ...snap.data() } as UserProfile);
        } else {
          // Fallback to auth data if Firestore doc doesn't exist yet
          setUser({
            uid:         firebaseUser.uid,
            firstName:   firebaseUser.displayName?.split(" ")[0] ?? "",
            lastName:    firebaseUser.displayName?.split(" ").slice(1).join(" ") ?? "",
            email:       firebaseUser.email ?? "",
            phone:       firebaseUser.phoneNumber ?? "",
            dialCode:    "",
            countryCode: "",
            displayName: firebaseUser.displayName ?? "",
            photoURL:    firebaseUser.photoURL,
            provider:    "",
            createdAt:   null,
          });
        }
        setLoading(false);
      });

      return () => unsubDoc();
    });

    return () => unsubAuth();
  }, []);

  return { user, loading };
}