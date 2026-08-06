"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { sendPasswordResetEmail, AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase.config";
import { toast } from "sonner";

const friendlyError = (code: string): string => {
  const map: Record<string, string> = {
    "auth/user-not-found":         "No account found with this email.",
    "auth/invalid-email":          "Please enter a valid email address.",
    "auth/too-many-requests":      "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
};

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      toast.success("Reset link sent — check your inbox.");
    } catch (err) {
      const message = friendlyError((err as AuthError).code ?? "");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 md:px-20 py-12 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-sm flex items-center justify-center bg-[#C9A96E]">
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-white">
              <rect x="2" y="2" width="7" height="7" rx="1" />
              <rect x="11" y="2" width="7" height="7" rx="1" />
              <rect x="2" y="11" width="7" height="7" rx="1" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-wide">KgLuxee</span>
        </div>

        {!sent ? (
          <>
            {/* Back link */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#C9A96E] transition-colors mb-8 w-fit"
            >
              <ArrowLeft size={14} />
              Back to login
            </Link>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h1>
            <p className="text-sm text-gray-500 mb-8">
              Enter your account email and we'll send you a link to reset your password.
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
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your account email"
                    className="w-full px-4 py-2.5 pl-10 border border-[#E8D9BE] rounded-lg text-sm text-gray-800 placeholder-gray-400 bg-white focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
                    required
                  />
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
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
                {loading ? "Sending link…" : "Send reset link"}
              </button>

              <p className="text-center text-sm text-gray-400">
                Remembered it?{" "}
                <Link href="/login" className="text-[#C9A96E] font-medium hover:text-[#A07840] transition-colors">
                  Log in
                </Link>
              </p>
            </form>
          </>
        ) : (
          /* Success state */
          <div className="flex flex-col items-start">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#C9A96E] transition-colors mb-8 w-fit"
            >
              <ArrowLeft size={14} />
              Back to login
            </Link>

            <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mb-6">
              <CheckCircle2 size={24} className="text-[#C9A96E]" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
            <p className="text-sm text-gray-500 mb-1">
              We sent a password reset link to
            </p>
            <p className="text-sm font-semibold text-gray-800 mb-6">{email}</p>

            <p className="text-sm text-gray-400 mb-8">
              Didn't receive it? Check your spam folder, or{" "}
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-[#C9A96E] font-medium hover:text-[#A07840] transition-colors"
              >
                try another email
              </button>
              .
            </p>

            <Link
              href="/login"
              className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-[#C9A96E] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center"
            >
              Back to login
            </Link>
          </div>
        )}
      </div>

      {/* Right — Brand panel */}
      <div className="hidden lg:flex w-1/2 relative items-end justify-start p-12 bg-[#C9A96E]">
        <div className="absolute inset-0 opacity-20" />
        <div className="absolute inset-0 opacity-30" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <svg viewBox="0 0 20 20" className="w-6 h-6 fill-white">
                <rect x="2" y="2" width="7" height="7" rx="1" />
                <rect x="11" y="2" width="7" height="7" rx="1" />
                <rect x="2" y="11" width="7" height="7" rx="1" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-wider">KgLuxee</span>
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