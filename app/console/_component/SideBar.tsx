// components/admin/AdminSidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import {
  LayoutGrid,
  ShoppingBag,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { auth } from "@/lib/firebase.config";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Products", href: "/console/product", icon: ShoppingBag },
  { label: "Customers", href: "/console/customers", icon: Users },
  { label: "Order", href: "/console/order", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Sign out failed:", err);
      toast.error("Couldn't sign out. Please try again.");
    }
  };

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <ul className="flex flex-col gap-1">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-white text-[#1A1A1A] font-semibold shadow-sm"
                  : "text-[#5C5648] hover:bg-white/50"
              }`}
            >
              <Icon size={17} strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="tracking-wide">{label.toUpperCase()}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3.5 bg-[#EDE6D8] border-b border-[#DCD2BC] sticky top-0 z-40">
        <Image src={'/logo.png'} alt="logo" width={100} height={80} className="md:w-24 md:h-24 w-16 h-16" onClick={()=> router.push('/')}/>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-[#1A1A1A]"
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
      </div>

      {/* Mobile drawer + backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[80vw] min-h-screen bg-[#EDE6D8] border-r border-[#DCD2BC] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-6 pb-6">
              <Image src={'/logo.png'} alt="logo" width={100} height={80} className="md:w-24 md:h-24 w-16 h-16" onClick={()=> router.push('/')}/>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="p-1 text-[#5C5648]"
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </div>

            <nav className="flex-1 px-3">
              <NavList onNavigate={() => setMobileOpen(false)} />
            </nav>

            <div className="px-3 pb-6">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#5C5648] hover:bg-white/50 transition-colors"
              >
                <LogOut size={17} strokeWidth={1.75} />
                <span className="tracking-wide">SIGN OUT</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 min-h-screen bg-[#EDE6D8] border-r border-[#DCD2BC] flex-col">
        {/* Brand */}
        <div className="px-6 pt-7 pb-6">
          <Image src={'/logo.png'} alt="logo" width={100} height={80} className="md:w-24 md:h-24 w-16 h-16" onClick={()=> router.push('/')}/>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3">
          <NavList />
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-6">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#5C5648] hover:bg-white/50 transition-colors"
          >
            <LogOut size={17} strokeWidth={1.75} />
            <span className="tracking-wide">SIGN OUT</span>
          </button>
        </div>
      </aside>
    </>
  );
}