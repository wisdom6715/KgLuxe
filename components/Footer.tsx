"use client";

import { footerColumns } from "@/data";

export default function Footer() {
  // Flattened + mapped social links (icon, label, href)
  const socialLinks = [
    {
      name: "instagram",
      label: "Instagram",
      href: "https://www.instagram.com/p/DCcY9wcPt-jV3OwcGPMXlI1NYiqTjViIW3R0Sk0/?igsh=OTl3bGhpM25kbjgx",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth={1.5} />
          <path strokeWidth={1.5} d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      name: "tiktok",
      label: "TikTok",
      href: "https://www.tiktok.com/@keji_olukoya_adetilewa?_r=1&_t=ZS-988KUhKEWIx",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 4v9.5a3.5 3.5 0 11-3-3.46V4h3zm0 0a4 4 0 004 4"
          />
        </svg>
      ),
    },
    {
      name: "whatsapp",
      label: "WhatsApp",
      href: "https://wa.me/14314588817?text=Hello%2C%20I'm%20interested%20in%20your%20products",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.5 12a8.5 8.5 0 10-15.3 5.1L4 21l3.98-1.16A8.5 8.5 0 0020.5 12z"
          />
          <path
            strokeWidth={1.5}
            strokeLinecap="round"
            d="M9 9.5c0 3.5 3 6.5 6.5 6.5.6 0 1-.5.8-1l-.6-1.4c-.15-.3-.5-.45-.8-.3l-.9.4a5 5 0 01-2.7-2.7l.4-.9c.15-.3 0-.65-.3-.8L10 8.7c-.5-.2-1 .2-1 .8z"
          />
        </svg>
      ),
    },
    {
      name: "pinterest",
      label: "Pinterest",
      href: "https://pin.it/21RiyIVsa",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.5 20l2-8m0 0a3 3 0 103-3.5 3.5 3.5 0 00-3 3.5zm0 0c-.3 1.4-1 2.5-1 4M12 3a9 9 0 100 18 9 9 0 000-18z"
          />
        </svg>
      ),
    },
    {
      name: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/share/19Km7dDSvz/?mibextid=wwXIfr",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 9h2V6h-2a3 3 0 00-3 3v2H9v3h2v6h3v-6h2.2l.8-3H14V9z"
          />
        </svg>
      ),
    },
  ].filter((link) => link.href); // only show links that actually have a URL

  // Contact details (email + phone numbers), mapped the same way as socialLinks
  const contactLinks = [
    {
      name: "email",
      label: "info@kgluxee.com",
      href: "mailto:hello@kgluxee.com",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: "phone-ng",
      label: "+234 805 590 9074",
      href: "tel:+2348055909074",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 5a2 2 0 012-2h2.28a1 1 0 01.97.76l.98 3.92a1 1 0 01-.29 1L7.5 10.13a11 11 0 006.37 6.37l1.45-1.44a1 1 0 011-.29l3.92.98a1 1 0 01.76.97V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z"
          />
        </svg>
      ),
    },
    {
      name: "phone-ca",
      label: "+1 431 458 8817",
      href: "tel:+14314588817",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 5a2 2 0 012-2h2.28a1 1 0 01.97.76l.98 3.92a1 1 0 01-.29 1L7.5 10.13a11 11 0 006.37 6.37l1.45-1.44a1 1 0 011-.29l3.92.98a1 1 0 01.76.97V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z"
          />
        </svg>
      ),
    },
  ].filter((link) => link.href); // only show entries that actually have a value

  return (
    <footer className="bg-white border-t px-4 border-gray-100 mt-8 md:px-16 lg:px-32">
      <div className="py-10 sm:py-12 md:py-14">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 md:gap-10">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <a href="#" className="font-serif text-lg sm:text-xl font-bold text-dark-brown tracking-tight block mb-3 sm:mb-4">
              KgLuxee
            </a>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs sm:max-w-none">
              Luxury in every detail
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

          {/* Social Media column */}
          <div>
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-dark-brown mb-3 sm:mb-4">
              Social Media
            </h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-text-muted hover:text-dark-brown transition-colors"
                  >
                    <span aria-hidden="true">{link.icon}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us column — mapped the same way as socialLinks */}
          <div>
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-dark-brown mb-3 sm:mb-4">
              Contact Us
            </h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {contactLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-text-muted hover:text-dark-brown transition-colors"
                  >
                    <span aria-hidden="true">{link.icon}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-0 sm:h-12 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <p className="text-xs text-text-muted text-center sm:text-left">
            © 2026 KgLuxee Editorial. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-text-muted text-center sm:text-left">Physical address: No 9 George street, Alakuko , Lagos state</p>
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
          </div>
        </div>
      </div>
    </footer>
  );
}