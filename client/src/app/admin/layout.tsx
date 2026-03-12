"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("rems_token");
      const storedUser = localStorage.getItem("rems_user");
      if (!token || !storedUser) {
        router.push("/login");
        return;
      }
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
