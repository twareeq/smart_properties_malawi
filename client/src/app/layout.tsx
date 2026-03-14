import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ReactQueryClientProvider } from "@/components/providers/ReactQueryProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthHydrator } from "@/components/providers/AuthHydrator";
import { SessionTimeoutProvider } from "@/components/providers/SessionTimeoutProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Properties Malawi - Find Your Perfect Property",
  description: "Find, reserve, and manage properties easily in Malawi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryClientProvider>
          <ToastProvider>
            <AuthHydrator />
            <SessionTimeoutProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 mt-[64px]">{children}</main>
                <Footer />
              </div>
            </SessionTimeoutProvider>
          </ToastProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
