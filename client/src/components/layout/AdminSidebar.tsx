"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/components/providers/ToastProvider";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Calendar,
  TrendingUp,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  BarChart3,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "My Properties", icon: Building2 },
  { href: "/admin/properties/create", label: "Add Property", icon: PlusCircle },
  { href: "/admin/bookings", label: "Booking Management", icon: Calendar },
  { href: "/admin/analytics", label: "Revenue Analytics", icon: TrendingUp },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const { addToast } = useToast();
  
  const { data: notifications } = useNotifications();
  const [prevNotifIds, setPrevNotifIds] = useState<string[]>([]);

  useEffect(() => {
    if (notifications) {
      if (prevNotifIds.length > 0) {
        const newNotifs = notifications.filter((n: any) => !n.isRead && !prevNotifIds.includes(n.id));
        if (newNotifs.length > 0) {
          addToast(`You have ${newNotifs.length} new notification(s)`, "info");
        }
      }
      setPrevNotifIds(notifications.map((n: any) => n.id));
    }
  }, [notifications]);

  const unreadCount = notifications?.filter((n: any) => !n.isRead).length || 0;

  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") {
      localStorage.removeItem("spm_token");
      localStorage.removeItem("spm_user");
    }
    router.push("/");
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm mb-1 overflow-hidden">
          {user?.profile?.avatarUrl ? (
            <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            user?.profile?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'
          )}
        </div>
        <p className="text-sm text-gray-300 truncate">
          {user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}` : user?.email}
        </p>
        <span className="text-xs text-gray-500">Administrator</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {href === "/admin/notifications" && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
              {active && href !== "/admin/notifications" && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
