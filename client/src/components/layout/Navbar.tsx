"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/providers/ToastProvider";
import { Home, Menu, X, LogOut, Loader2 } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, logout, user, hasHydrated } = useAuthStore();
  const router = useRouter();
  const { addToast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setSigningOut(true);
    setMobileOpen(false);
    // Small artificial delay so the user sees feedback
    await new Promise((res) => setTimeout(res, 800));
    logout();
    addToast("You have been signed out successfully. See you soon! 👋", "success");
    setSigningOut(false);
    router.push("/login");
  };

  /* ── Shared Sign Out button (wrapped in AlertDialog) ─────── */
  const SignOutButton = ({ fullWidth = false }: { fullWidth?: boolean }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size={fullWidth ? "default" : "sm"}
          disabled={signingOut}
          className={
            fullWidth
              ? "w-full border-red-200 text-red-600 hover:bg-red-50"
              : scrolled
              ? "border-primary/40 text-primary hover:bg-primary/10"
              : "border-white/50 text-white hover:bg-white/20 bg-white/10"
          }
        >
          {signingOut ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing out…
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </>
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-amber-600" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold">
              Sign Out?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pl-[52px] text-gray-600 text-sm leading-relaxed">
            Are you sure you want to sign out,{" "}
            <span className="font-semibold text-gray-800">
              {user?.profile?.firstName || user?.email?.split("@")[0]}
            </span>
            ? You'll need to sign in again to access your dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 mt-2">
          <AlertDialogCancel className="flex-1">Stay Signed In</AlertDialogCancel>
          <AlertDialogAction
            className="flex-1 bg-primary hover:bg-primary/90 text-white"
            onClick={handleLogout}
          >
            Yes, Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-green-100"
          : "bg-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Home className="w-4 h-4 text-white" />
          </div>
          <span className={scrolled ? "text-gray-900" : "text-white drop-shadow"}>
            Smart Properties
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              scrolled ? "text-gray-700" : "text-white/90"
            }`}
          >
            Home
          </Link>
          <Link
            href="/properties"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              scrolled ? "text-gray-700" : "text-white/90"
            }`}
          >
            Property List
          </Link>
          {isAuthenticated && (
            <Link
              href={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                scrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3 min-w-[120px] justify-end">
          {!hasHydrated ? (
            <div className="w-20 h-8 bg-white/10 animate-pulse rounded-md" />
          ) : isAuthenticated ? (
            <>
              <span
                className={`text-sm font-medium ${
                  scrolled ? "text-gray-600" : "text-white/80"
                }`}
              >
                {user?.profile?.firstName || user?.email?.split("@")[0]}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    scrolled ? "text-gray-700" : "text-white hover:bg-white/20"
                  }
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden p-2 rounded-lg ${
            scrolled ? "text-gray-700" : "text-white"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-green-100 px-4 py-4 space-y-3 shadow-lg">
          <Link
            href="/"
            className="block text-gray-700 font-medium py-2"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/properties"
            className="block text-gray-700 font-medium py-2"
            onClick={() => setMobileOpen(false)}
          >
            Property List
          </Link>
          {!hasHydrated ? (
            <div className="pt-2">
              <div className="w-full h-10 bg-gray-100 animate-pulse rounded-md" />
            </div>
          ) : isAuthenticated ? (
            <>
              <Link
                href={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="block text-gray-700 font-medium py-2"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <SignOutButton fullWidth />
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link
                href="/login"
                className="flex-1"
                onClick={() => setMobileOpen(false)}
              >
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link
                href="/register"
                className="flex-1"
                onClick={() => setMobileOpen(false)}
              >
                <Button className="w-full bg-primary text-white">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
