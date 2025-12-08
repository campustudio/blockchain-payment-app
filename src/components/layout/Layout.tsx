/**
 * Main layout component with navigation
 */

import { Outlet, Link, useLocation } from "react-router-dom";
import { WalletButton } from "@/components/wallet/WalletButton";
import { cn } from "@/lib/utils/cn";
import { LayoutDashboard, CreditCard, BarChart3, Brain } from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/payment", label: "Payment", icon: CreditCard },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/ml-system", label: "ML System", icon: Brain },
];

export const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PayGuard</h1>
              <p className="text-xs text-gray-500">
                Blockchain Payment Platform
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Button */}
          <WalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              © 2024 PayGuard. Blockchain Payment Platform with AI-Powered Risk
              Analytics.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                System Online
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
