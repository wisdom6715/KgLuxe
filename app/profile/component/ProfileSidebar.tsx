"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Clock,
  MapPin,
  BarChart2,
  Heart,
} from "lucide-react";

const navItems = [
  { label: "Account Information", href: "/profile/account", icon: User },
  { label: "Order History",        href: "/profile/order",  icon: Clock },
  { label: "Addresses",            href: "/profile/addresses", icon: MapPin },
  { label: "Wishlist",             href: "/profile/wishlist",  icon: Heart },
];

export default function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 shrink-0">
      <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-2 md:gap-3 px-3.5 md:px-4 py-2.5 md:py-3 rounded-lg text-sm font-medium transition-all duration-150 flex-shrink-0 whitespace-nowrap
                ${active
                  ? "bg-[#C9A96E] text-white shadow-sm"
                  : "text-gray-600 hover:bg-cream-200 hover:text-gray-800"
                }
              `}
            >
              <Icon size={17} className={active ? "text-white" : "text-gray-400"} strokeWidth={1.7} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
