"use client";
import { useCurrentUser } from "@/hook/useCurrentUser";


export default function ProfileHeader() {
  const {user, loading } = useCurrentUser()
  return (
    <div className="relative w-full overflow-hidden bg-gray-300">

      <div className="relative z-10 flex flex-col items-center justify-center py-8 sm:py-10 px-4">
        {/* Avatar */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-300/40 border-2 border-white/30 flex items-center justify-center overflow-hidden mb-3 sm:mb-4">
          {user?.photoURL ? (
            <img src={user?.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
              <circle cx="40" cy="30" r="14" fill="rgba(255,255,255,0.5)" />
              <ellipse cx="40" cy="70" rx="24" ry="18" fill="rgba(255,255,255,0.5)" />
            </svg>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide text-center">
          Hi {user?.firstName} {user?.lastName}!
        </h1>
        <p className="text-[11px] sm:text-xs text-white/60 uppercase tracking-[0.18em] mt-1 font-medium text-center">
          Welcome to your account
        </p>
      </div>
    </div>
  );
}
