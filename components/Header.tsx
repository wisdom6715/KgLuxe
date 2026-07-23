"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase.config";
import { subNavItems } from "@/data";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const goTo = (href: string) => {
    setMenuOpen(false);
    router.push(href);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-3 sm:px-6 md:px-10 lg:px-20 xl:px-40 ">
      {/* Top nav */}
      <div className="h-14 md:h-20 flex items-center justify-between gap-2 md:gap-4">
        {/* Logo */}
        <Image src={'/logo.png'} alt="logo" width={100} height={80} className="md:w-24 md:h-24 w-16 h-16 cursor-pointer " onClick={()=> router.push('/')}/>

        {/* Sub nav — desktop/tablet only */}
        <div className="hidden md:flex h-full border-gray-100 justify-center items-center flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center gap-1 whitespace-nowrap">
            {subNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 md:px-5 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 cursor-pointer ${
                    isActive
                      ? " text-black border border-[#747878]"
                      : "text-gray-600 hover:text-dark-brown border border-transparent hover:border-gray-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Actions — desktop/tablet only */}
        <div className="hidden md:flex items-center gap-3 md:gap-4 flex-shrink-0">
          {!authLoading && (
            user ? (
              <>
                <button
                  className="text-gray-600 hover:text-dark-brown transition-colors"
                  aria-label="Account"
                  onClick={() => router.push("/profile/account")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </button>
                <button
                  className="text-gray-600 hover:text-dark-brown transition-colors relative"
                  aria-label="Cart"
                  onClick={() => router.push("/cart")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/login")}
                  className="text-xs font-medium cursor-pointer text-gray-600 hover:text-dark-brown transition-colors whitespace-nowrap"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/signup")}
                  className="px-4 py-1.5 rounded-full cursor-pointer text-xs font-medium bg-dark-brown text-white hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Get started
                </button>
              </div>
            )
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          className="md:hidden text-gray-600 cursor-pointer hover:text-dark-brown transition-colors p-1.5 -m-1.5"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="px-1 py-4 flex flex-col gap-1">
            {subNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "text-black border border-[#747878]"
                      : "text-gray-600 hover:text-dark-brown border border-transparent hover:border-gray-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-100 px-1 py-4">
            {!authLoading &&
              (user ? (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => goTo("/profile/account")}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:text-dark-brown hover:border-gray-200 border border-transparent transition-all text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                    Account
                  </button>
                  <button
                    onClick={() => goTo("/cart")}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:text-dark-brown hover:border-gray-200 border border-transparent transition-all text-left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                    </svg>
                    Cart
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-1">
                  <button
                    onClick={() => goTo("/login")}
                    className="w-full px-4 py-2.5 rounded-full text-sm font-medium text-gray-600 hover:text-dark-brown border border-gray-200 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => goTo("/signup")}
                    className="w-full px-4 py-2.5 rounded-full text-sm font-medium bg-dark-brown text-white hover:opacity-90 transition-opacity"
                  >
                    Get started
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}