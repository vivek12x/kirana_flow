import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "KiranaFlow - Retail Management Dashboard",
  description: "A comprehensive SaaS dashboard for Kirana stores.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen bg-muted/10`}>
        <AuthGuard>
          <Navbar />
          <main className="container mx-auto py-6 px-4">
            {children}
          </main>
        </AuthGuard>
        <Toaster />
      </body>
    </html>
  );
}
