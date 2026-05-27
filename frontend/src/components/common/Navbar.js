"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  LogOut,
  LayoutDashboard,
  MonitorPlay,
  Shield,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navLinks = [
    { href: "/dashboard", label: "Workspace", icon: LayoutDashboard },
    { href: "/queue", label: "Queue Board", icon: MonitorPlay },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 border-b border-[#3D4532]/10 px-4 sm:px-6 py-3 sm:py-4 shadow-sm backdrop-blur-xl bg-[#FDF8F0]/80"
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {/* Branding */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#3D4532] font-black text-xl sm:text-2xl tracking-tight group"
        >
          <div className="p-1.5 group-hover:rotate-12 transition-transform duration-300 ">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF5E29]" />
          </div>
          <span className="font-serif">HAQMS</span>
        </Link>

        {/* Central Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-white/60 border border-[#3D4532]/10 p-1.5 rounded-full shadow-sm backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-[#3D4532] text-white shadow-md scale-100"
                    : "text-[#3D4532]/60 hover:bg-[#3D4532]/5 hover:text-[#3D4532] scale-95 hover:scale-100"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-[#D3F23A]" : ""}`}
                />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Central Links (Mobile) */}
        <div className="flex md:hidden items-center gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`p-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#3D4532] text-[#D3F23A] shadow-md"
                    : "text-[#3D4532]/60 hover:bg-white hover:shadow-sm"
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-sm font-black text-[#3D4532] tracking-tight">
              {user.name}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase bg-[#D3F23A] text-[#3D4532] shadow-sm">
              <Shield className="h-3 w-3" />
              {user.role}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white border border-[#3D4532]/10 text-[#3D4532] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm group"
          >
            <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Terminate Session</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
