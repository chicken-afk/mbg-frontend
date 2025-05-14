"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, FileText, Settings, PlusCircle, BarChart } from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transaksi",
    href: "/dashboard/transactions",
    icon: FileText,
  },
  // {
  //   title: "Laporan",
  //   href: "/dashboard/reports",
  //   icon: BarChart,
  // },
  // {
  //   title: "Buat Form Baru",
  //   href: "/dashboard/form-builder",
  //   icon: PlusCircle,
  // },
  {
    title: "Manajemen User",
    href: "/dashboard/users",
    icon: Users,
  },
  // {
  //   title: "Pengaturan",
  //   href: "/dashboard/settings",
  //   icon: Settings,
  // },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 w-64 h-screen bg-white border-r overflow-y-auto p-4">
      <div className="flex flex-col h-full">
        <nav className="grid items-start px-2 text-sm font-medium">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

