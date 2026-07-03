"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  AuthError,
} from "firebase/auth";
import { auth } from "@/lib/firebase.config";
import { toast } from "sonner";

const friendlyError = (code: string): string => {
  const map: Record<string, string> = {
    "auth/invalid-credential":      "Incorrect email or password.",
    "auth/user-not-found":          "No account found with this email.",
    "auth/wrong-password":          "Incorrect password. Please try again.",
    "auth/invalid-email":           "Please enter a valid email address.",
    "auth/user-disabled":           "This account has been disabled.",
    "auth/too-many-requests":       "Too many attempts. Please try again later.",
    "auth/network-request-failed":  "Network error. Check your connection.",
    "auth/popup-closed-by-user":    "Google sign-in was cancelled.",
    "auth/cancelled-popup-request": "Only one sign-in popup at a time.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
};

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error,        setError]        = useState("");

  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        await setPersistence(
        auth,
        rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
        await signInWithEmailAndPassword(auth, form.email, form.password);
        toast.success("Welcome back! Redirecting…");
        router.push("/");
    } catch (err) {
        const message = friendlyError((err as AuthError).code ?? "");
        setError(message);
        toast.error(message);
    } finally {
        setLoading(false);
    }
    };

    const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);

    try {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        const firstName = result.user.displayName?.split(" ")[0] || "there";
        toast.success(`Welcome back, ${firstName}! 👋`);
        router.push("/");
    } catch (err) {
        const message = friendlyError((err as AuthError).code ?? "");
        setError(message);
        toast.error(message);
    } finally {
        setGoogleLoading(false);
    }
    };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 md:px-20 py-12 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-sm flex items-center justify-center bg-[#C9A96E]"  >
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
              <rect x="2" y="2" width="7" height="7" rx="1" />
              <rect x="11" y="2" width="7" height="7" rx="1" />
              <rect x="2" y="11" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-wide">KgLuxe</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Login to your account</h1>
        <p className="text-sm text-gray-500 mb-8">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#C9A96E] font-medium hover:text-[#A07840] transition-colors">
            Create Account
          </Link>
        </p>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Enter email"
              className="w-full px-4 py-2.5 border border-[#E8D9BE] rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 pr-11 border border-[#E8D9BE] rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C9A96E] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#C9A96E] accent-[#C9A96E]"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-[#C9A96E] hover:text-[#A07840] font-medium transition-colors">
              Forgot Password?
            </Link>
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
            {loading ? "Logging in…" : "Login"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Or login with</span>
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
        </form>
      </div>

      {/* Right — Brand panel */}
      <div
        className="hidden lg:flex w-1/2 relative items-end justify-start p-12 bg-[#C9A96E]"
      >
        <div className="absolute inset-0 opacity-20"
          
        />
        <div className="absolute inset-0 opacity-30"
          
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <svg viewBox="0 0 20 20" className="w-6 h-6 fill-white">
                <rect x="2" y="2" width="7" height="7" rx="1" />
                <rect x="11" y="2" width="7" height="7" rx="1" />
                <rect x="2" y="11" width="7" height="7" rx="1" />
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
    </div>
  );
}