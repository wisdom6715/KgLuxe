"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  AuthError,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase.config";
import { toast } from "sonner";

const friendlyError = (code: string): string => {
  const map: Record<string, string> = {
    "auth/email-already-in-use":    "An account with this email already exists.",
    "auth/invalid-email":           "Please enter a valid email address.",
    "auth/weak-password":           "Password must be at least 6 characters.",
    "auth/network-request-failed":  "Network error. Check your connection.",
    "auth/popup-closed-by-user":    "Google sign-in was cancelled.",
    "auth/cancelled-popup-request": "Only one sign-in popup at a time.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
};

const COUNTRY_CODES = [
  { code: "NG", dial: "234", flag: "🇳🇬" },
  { code: "GH", dial: "233", flag: "🇬🇭" },
  { code: "US", dial: "1",   flag: "🇺🇸" },
  { code: "GB", dial: "44",  flag: "🇬🇧" },
  { code: "ZA", dial: "27",  flag: "🇿🇦" },
  { code: "KE", dial: "254", flag: "🇰🇪" },
];

export default function SignupPage() {
  const router = useRouter();

  const [showPassword,        setShowPassword]        = useState(false);
  const [countryCode,         setCountryCode]         = useState(COUNTRY_CODES[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [loading,             setLoading]             = useState(false);
  const [googleLoading,       setGoogleLoading]       = useState(false);
  const [error,               setError]               = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName:  "",
    email:     "",
    phone:     "",
    password:  "",
  });

  // ── Saves user document to Firestore ──────────────────────────────────────
  const saveUserToFirestore = async (
    uid: string,
    data: {
      firstName:   string;
      lastName:    string;
      email:       string;
      phone:       string;
      dialCode:    string;
      countryCode: string;
      displayName: string;
      photoURL:    string | null;
      provider:    "email" | "google";
    }
  ) => {
    await setDoc(doc(db, "users", uid), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  // ── Email / password signup ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const credential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
        );

        const displayName = `${form.firstName} ${form.lastName}`.trim();
        await updateProfile(credential.user, { displayName });

        // Firestore write in its own try/catch — don't block the user if it fails
        try {
        await saveUserToFirestore(credential.user.uid, {
            firstName:   form.firstName.trim(),
            lastName:    form.lastName.trim(),
            email:       form.email.trim().toLowerCase(),
            phone:       form.phone.trim(),
            dialCode:    countryCode.dial,
            countryCode: countryCode.code,
            displayName,
            photoURL:    credential.user.photoURL,
            provider:    "email",
        });
        } catch (firestoreErr) {
        console.error("Firestore write failed:", firestoreErr);
        // Auth succeeded, so still continue — just log it
        }

        toast.success("Account created successfully! Welcome to KgLuxe 🎉");
        router.push("/");

    } catch (err) {
        // Only Auth errors reach here now
        const message = friendlyError((err as AuthError).code ?? "");
        setError(message);
        toast.error(message);
    } finally {
        setLoading(false);
    }
  };

  // ── Google signup ─────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);

    try {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        const { user } = result;

        const [firstName = "", ...rest] = (user.displayName ?? "").split(" ");
        const lastName = rest.join(" ");

        try {
        await saveUserToFirestore(user.uid, {
            firstName,
            lastName,
            email:       user.email?.toLowerCase() ?? "",
            phone:       user.phoneNumber ?? "",
            dialCode:    "",
            countryCode: "",
            displayName: user.displayName ?? "",
            photoURL:    user.photoURL,
            provider:    "google",
        });
        } catch (firestoreErr) {
        console.error("Firestore write failed:", firestoreErr);
        }

        toast.success(`Welcome, ${firstName || "there"}! Your account is ready 🎉`);
        router.push("/");

    } catch (err) {
        const message = friendlyError((err as AuthError).code ?? "");
        setError(message);
        toast.error(message);
    } finally {
        setGoogleLoading(false);
    }
    };

  // ── UI (unchanged) ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 md:px-20 py-12 bg-white">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-sm flex items-center justify-center bg-[#C9A96E]">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
              <rect x="2"  y="2"  width="7" height="7" rx="1" />
              <rect x="11" y="2"  width="7" height="7" rx="1" />
              <rect x="2"  y="11" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-wide">KgLuxe</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h1>
        <p className="text-sm text-gray-500 mb-8">Welcome! Please enter your details.</p>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder="First Name"
              required
              className="px-4 py-2.5 border border-[#E8D9BE] rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
            />
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder="Last Name"
              required
              className="px-4 py-2.5 border border-[#E8D9BE] rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
            />
          </div>

          {/* Email */}
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="Email Address"
            required
            className="w-full px-4 py-2.5 border border-[#E8D9BE] rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
          />

          {/* Phone + country code */}
          <div className="flex gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryDropdown((v) => !v)}
                className="h-full flex items-center gap-1.5 px-3 border border-[#E8D9BE] rounded-lg text-sm text-gray-700 bg-white hover:border-[#C9A96E] focus:outline-none focus:border-[#C9A96E] transition-all whitespace-nowrap"
              >
                <span>{countryCode.flag}</span>
                <span className="font-medium">{countryCode.code}</span>
                <span className="text-gray-400">{countryCode.dial}</span>
                <ChevronDown size={13} className="text-gray-400" />
              </button>
              {showCountryDropdown && (
                <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-[#E8D9BE] rounded-xl shadow-lg py-1 min-w-[160px]">
                  {COUNTRY_CODES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => { setCountryCode(c); setShowCountryDropdown(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-[#FAF8F3] transition-colors text-left"
                    >
                      <span>{c.flag}</span>
                      <span className="font-medium">{c.code}</span>
                      <span className="text-gray-400">+{c.dial}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Phone Number"
              className="flex-1 px-4 py-2.5 border border-[#E8D9BE] rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Password"
              required
              minLength={6}
              className="w-full px-4 py-2.5 pr-11 border border-[#E8D9BE] rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C9A96E] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#C9A96E]"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? "Creating account…" : "Sign up"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Or Sign up with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full py-2.5 rounded-lg border border-[#E8D9BE] bg-white text-sm font-medium text-gray-700 flex items-center justify-center gap-2.5 hover:border-[#C9A96E] hover:bg-[#FAF8F3] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? "Signing in…" : "Google"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-gray-800 hover:text-[#C9A96E] transition-colors">
              Login
            </Link>
          </p>
        </form>
      </div>

      {/* Right — Brand panel */}
      <div
        className="hidden lg:flex w-1/2 relative items-end justify-start p-12 bg-[#C9A96E]"
      >
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 70% 30%, #C9A96E 0%, transparent 55%)" }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md flex items-center justify-center bg-white/20 backdrop-blur-sm">
            <svg viewBox="0 0 20 20" className="w-6 h-6 fill-white">
              <rect x="2"  y="2"  width="7" height="7" rx="1" />
              <rect x="11" y="2"  width="7" height="7" rx="1" />
              <rect x="2"  y="11" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white tracking-wider">KgLuxe</span>
          <div className="w-px h-8 bg-white/30 mx-1" />
          <span className="text-white/80 text-sm font-light leading-tight">
            Home of premium<br />Designs
          </span>
        </div>
      </div>
    </div>
  );
}