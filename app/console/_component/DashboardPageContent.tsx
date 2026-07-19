// components/admin/DashboardPageContent.tsx
"use client";

import {
  ShoppingBag,
  ClipboardCheck,
  Users,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const STATS = [
  {
    label: "Total Orders",
    value: "72",
    change: "+6.8%",
    trend: "up" as const,
    icon: ShoppingBag,
  },
  {
    label: "Total Products",
    value: "130",
    change: "+2.5%",
    trend: "down" as const,
    icon: ClipboardCheck,
  },
  {
    label: "Total Customers",
    value: "559",
    change: "+5.3%",
    trend: "up" as const,
    icon: Users,
  },
];


type OrderStatus = "in-progress" | "delivered" | "cancelled";

const RECENT_ORDERS: {
  id: string;
  customer: string;
  date: string;
  status: OrderStatus;
  products: number;
  amount: number;
}[] = [
  { id: "#RT58G9", customer: "Carla Reed", date: "02.06.2025", status: "in-progress", products: 2, amount: 640 },
  { id: "#RT57J8", customer: "Flora Myers", date: "02.06.2025", status: "delivered", products: 4, amount: 1200 },
  { id: "#RT57K2", customer: "Liam Chen", date: "01.06.2025", status: "delivered", products: 6, amount: 1800 },
  { id: "#RT57B4", customer: "Sophia Patel", date: "01.06.2025", status: "cancelled", products: 3, amount: 900 },
];

const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = {
    "in-progress": {
      label: "In Progress",
      icon: Clock,
      classes: "bg-gray-100 text-gray-700",
    },
    delivered: {
      label: "Delivered",
      icon: CheckCircle2,
      classes: "bg-emerald-50 text-emerald-600",
    },
    cancelled: {
      label: "Cancelled",
      icon: XCircle,
      classes: "bg-red-50 text-red-500",
    },
  }[status];

  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.classes}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

export default function DashboardPageContent() {
  return (
    <div className="flex-1 w-full min-w-0 h-full pt-6 sm:pt-8 lg:pt-10">
      {/* Stat cards */}
      <div className="px-4 sm:px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {STATS.map(({ label, value, change, trend, icon: Icon }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >
            <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-gray-500">
              {label.toUpperCase()}
              <Icon size={16} className="text-gray-400" />
            </div>
            <p className="font-serif text-3xl text-gray-900 mt-3">{value}</p>
            <p
              className={`flex items-center gap-1 text-xs font-medium mt-2 ${
                trend === "up" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {trend === "up" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {change} from last month
            </p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="px-4 sm:px-6 lg:px-10 pt-6 pb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <h2 className="font-serif text-xl sm:text-2xl text-gray-900 mb-5">Recent Orders</h2>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[1fr_1.4fr_1.2fr_1.2fr_1fr_1fr] px-2 py-2 text-xs font-semibold tracking-wide text-gray-500 border-b border-gray-100">
                <span>ID CODE</span>
                <span>CUSTOMER</span>
                <span>ORDER DATE</span>
                <span>STATUS</span>
                <span>PRODUCTS</span>
                <span className="text-right">AMOUNT</span>
              </div>

              {RECENT_ORDERS.map((order) => (
                <div
                  key={order.id}
                  className="grid grid-cols-[1fr_1.4fr_1.2fr_1.2fr_1fr_1fr] items-center px-2 py-4 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-sm text-gray-600 font-mono">{order.id}</span>
                  <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                  <span className="text-sm text-gray-500">{order.date}</span>
                  <span>
                    <StatusBadge status={order.status} />
                  </span>
                  <span className="text-sm text-gray-700">{order.products}</span>
                  <span className="text-sm font-semibold text-gray-900 text-right">
                    {formatUsd(order.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}