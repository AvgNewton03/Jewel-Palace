"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isSubdomainVerified, setIsSubdomainVerified] = useState<boolean | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // 1. Apex Domain Lockdown: Block apex domain from ever mounting Admin
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname.toLowerCase();
      const isAdminSubdomain =
        hostname === "admin.jewelpalacemumbai.com" ||
        hostname === "admin.localhost" ||
        hostname === "admin.127.0.0.1" ||
        (hostname.startsWith("admin.") && !hostname.includes("pages.dev"));

      if (!isAdminSubdomain) {
        // Immediately redirect apex domain visitors away to homepage
        router.replace("/");
        setIsSubdomainVerified(false);
        return;
      }

      setIsSubdomainVerified(true);
    }
  }, [router]);

  // 2. RBAC & Session Verification for Admin Subdomain
  useEffect(() => {
    if (isSubdomainVerified !== true || isLoading) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const isUserAdmin = user?.role === "admin" || user?.email === "deepamsipani3@gmail.com";
    const isLoginPage = pathname === "/admin" || pathname === "/";

    // Standalone login screen on admin subdomain
    if (isLoginPage) {
      if (token || isUserAdmin) {
        router.replace(pathname === "/" ? "/dashboard" : "/admin/dashboard");
      } else {
        setIsAuthorized(true);
      }
      return;
    }

    // Protected dashboard or sub-routes
    if (token || isUserAdmin) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      // Redirect unauthorized users to main site
      if (typeof window !== "undefined") {
        window.location.href = "https://jewelpalacemumbai.com/?error=access_denied";
      }
    }
  }, [pathname, router, user, isLoading, isSubdomainVerified]);

  // If on apex domain, return null immediately so Admin Login never renders
  if (isSubdomainVerified === false) {
    return null;
  }

  // Loading state while verifying subdomain and security privileges
  if (isSubdomainVerified === null || isLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0f0a08] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#6b1414] dark:text-amber-400" />
        <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
          Verifying security privileges...
        </p>
      </div>
    );
  }

  // Access denied state before external redirect completes
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0f0a08] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 mb-2">
          Access Denied
        </h2>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-sm mb-6">
          You do not have administrator privileges to access this area. Redirecting to home...
        </p>
      </div>
    );
  }

  // Render existing admin pages untouched
  return <>{children}</>;
}
