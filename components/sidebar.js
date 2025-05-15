"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FileText, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useMobile } from "@/hooks/use-mobile";

const baseMenuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Transaksi", href: "/dashboard/transactions", icon: FileText },
];

export default function Sidebar({ className, sidebarOpen, onClose = () => { }, ...props }) {
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState(baseMenuItems);
  const isMobileDevice = useMobile();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if ((role === "1" || role === 1) && !menuItems.some((item) => item.href === "/dashboard/users")) {
      setMenuItems([
        ...baseMenuItems,
        { title: "Manajemen User", href: "/dashboard/users", icon: Users },
        { title: "Buat Form Baru", href: "/dashboard/form-builder", icon: PlusCircle },
      ]);
    }
  }, []);

  if (isMobileDevice) {
    // Hanya render saat terbuka
    if (!sidebarOpen) return null;

    return (
      <div
        className={cn(
          "fixed top-0 left-0 w-full h-screen bg-white z-50 p-0 overflow-y-auto",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h1 className="text-lg font-bold">Menu</h1>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close sidebar"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <nav className="grid items-start px-4 py-2 text-sm font-medium">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={onClose} // ✅ Tutup saat klik menu
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <div
      className={cn("fixed left-0 w-64 h-screen bg-white border-r overflow-y-auto p-4", className)}
      {...props}
    >
      <nav className="grid items-start px-2 text-sm font-medium">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
              pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
