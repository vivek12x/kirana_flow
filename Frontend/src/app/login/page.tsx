"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Store, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function LoginPage() {
    const [role, setRole] = useState<"owner" | "worker">("owner");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success(`Logged in successfully as ${role}`);
            router.push("/inventory");
        } catch (error: any) {
            toast.error(error.message || "An error occurred during login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 p-4">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-primary tracking-tight">KiranaFlow</h1>
                <p className="text-muted-foreground mt-2">Smart Retail Management</p>
            </div>

            <Tabs defaultValue="owner" className="w-[400px]" onValueChange={(v) => setRole(v as "owner" | "worker")}>
                <TabsList className="grid w-full grid-cols-2 h-14 mb-4">
                    <TabsTrigger value="owner" className="text-base flex gap-2">
                        <Store className="h-4 w-4" />
                        Owner Portal
                    </TabsTrigger>
                    <TabsTrigger value="worker" className="text-base flex gap-2">
                        <Users className="h-4 w-4" />
                        Worker Portal
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="owner">
                    <Card>
                        <CardHeader>
                            <CardTitle>Owner Login</CardTitle>
                            <CardDescription>Manage inventory, analytics, and worker requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log In"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="worker">
                    <Card>
                        <CardHeader>
                            <CardTitle>Worker Login</CardTitle>
                            <CardDescription>View inventory and send voice requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="worker-email">Email</Label>
                                    <Input
                                        id="worker-email"
                                        type="email"
                                        placeholder="worker@store.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="worker-password">Password</Label>
                                    <Input
                                        id="worker-password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log In"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
