"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            // Allow access to login and verify pages without being authenticated
            if (!user && pathname !== "/login" && pathname !== "/verify") {
                router.push("/login");
            }
            // Optional: redirect logged-in users away from login
            if (user && (pathname === "/login" || pathname === "/verify" || pathname === "/")) {
                router.push("/inventory");
            }
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Hide children while unauthenticated (unless on public routes)
    if (!user && pathname !== "/login" && pathname !== "/verify") {
        return null;
    }

    return <>{children}</>;
}
