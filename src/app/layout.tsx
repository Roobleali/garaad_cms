"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdminRoute } from "./components/AdminRoute";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Don't wrap the login page with AdminRoute
  const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {isLoginPage ? children : <AdminRoute>{children}</AdminRoute>}
      </body>
    </html>
  );
}
