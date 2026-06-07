"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Store, Receipt, BarChart3, BookOpen, MoreHorizontal, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuthStore();

    const navItems = [
        { name: "Inventory", href: "/inventory", icon: Store, roles: ['owner', 'worker'] },
        { name: "Requests", href: "/requests", icon: BookOpen, roles: ['owner', 'worker'] },
        { name: "Billing", href: "/billing", icon: Receipt, roles: ['owner'] },
        { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ['owner'] },
        { name: "Credit Ledger", href: "/ledger", icon: BookOpen, roles: ['owner'] },
        { name: "More", href: "/more", icon: MoreHorizontal, roles: ['owner'] },
    ];

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <nav className="border-b bg-background sticky top-0 z-50">
            <div className="container mx-auto flex h-16 items-center px-4 justify-between">
                <div className="flex items-center">
                    <div className="mr-8 font-bold text-xl tracking-tight text-primary">
                        KiranaFlow
                    </div>
                    <div className="flex space-x-6">
                        {navItems.filter(item => !user || item.roles.includes(user.role || 'owner')).map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                                        isActive
                                            ? "text-primary border-b-2 border-primary pb-[1.3rem] mt-[1.3rem]"
                                            : "text-muted-foreground pb-[1.4rem] mt-[1.4rem] border-transparent border-b-2 hover:border-muted-foreground/20"
                                    )}
                                >
                                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* User info and logout */}
                {user && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{user.email}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    );
}
