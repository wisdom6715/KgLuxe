"use client";

import { useState } from "react";
import { footerColumns } from "@/data";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-white border-t px-4 border-gray-100 mt-8">
      <div className="py-10 sm:py-12 md:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <a href="#" className="font-serif text-lg sm:text-xl font-bold text-dark-brown tracking-tight block mb-3 sm:mb-4">
              KgLuxee
            </a>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs sm:max-w-none">
              Elevating your everyday essentials through editorial minimalism and superior craftsmanship.
            </p>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-[11px] font-bold tracking-widest uppercase text-dark-brown mb-3 sm:mb-4">
                {col.heading}
              </h3>
              <ul className="space-y-2.5 sm:space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-muted hover:text-dark-brown transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-dark-brown mb-3 sm:mb-4">
              Stay Updated
            </h3>
            {subscribed ? (
              <p className="text-sm text-green-700 font-medium">
                You&apos;re subscribed. Thank you!
              </p>
            ) : (
              <div className="space-y-2 max-w-sm sm:max-w-none">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  placeholder="Your email address"
                  className="w-full border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-dark-brown transition-colors placeholder-gray-400"
                />
                <button
                  onClick={handleSubscribe}
                  className="w-full bg-dark-brown text-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-mid-brown transition-colors"
                >
                  Subscribe
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-0 sm:h-12 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <p className="text-xs text-text-muted text-center sm:text-left">
            © 2024 KgLuxee Editorial. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Globe */}
            <button className="text-text-muted hover:text-dark-brown transition-colors" aria-label="Language">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3a15.4 15.4 0 014 9 15.4 15.4 0 01-4 9 15.4 15.4 0 01-4-9 15.4 15.4 0 014-9z" />
              </svg>
            </button>
            {/* User */}
            <button className="text-text-muted hover:text-dark-brown transition-colors" aria-label="Account">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </button>
            {/* Instagram */}
            <button className="text-text-muted hover:text-dark-brown transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={1.5} />
                <path strokeWidth={1.5} d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}