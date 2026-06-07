"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

interface VoiceRequest {
    id: string;
    worker_email: string;
    message_text: string;
    status: string;
    created_at: string;
}

export default function RequestsPage() {
    const [requests, setRequests] = useState<VoiceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();
    const isOwner = user?.role === 'owner';

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const stored = localStorage.getItem('kirana_requests');
            const data = stored ? JSON.parse(stored) : [];
            setRequests(data);
        } catch (e) {
            console.error("Failed to fetch requests", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            const stored = localStorage.getItem('kirana_requests');
            const data: VoiceRequest[] = stored ? JSON.parse(stored) : [];
            const updated = data.map(req => req.id === id ? { ...req, status } : req);
            localStorage.setItem('kirana_requests', JSON.stringify(updated));
            fetchRequests();
        } catch (e) {
            console.error("Failed to update status", e);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading requests...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Worker Requests</h1>
                <p className="text-muted-foreground">Voice notes and stock requests from your store workers.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests.map(req => (
                    <Card key={req.id} className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base">{req.worker_email}</CardTitle>
                                <Badge variant={req.status === 'pending' ? 'warning' : req.status === 'approved' ? 'success' : 'secondary'}>
                                    {req.status}
                                </Badge>
                            </div>
                            <CardDescription className="text-xs">
                                {new Date(req.created_at).toLocaleString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm border p-3 rounded-md bg-muted/30">
                                {req.message_text}
                            </p>
                            {isOwner && req.status === 'pending' && (
                                <div className="flex gap-2">
                                    <Button size="sm" className="w-full" onClick={() => updateStatus(req.id, 'approved')}>
                                        Mark Done
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-full" onClick={() => updateStatus(req.id, 'rejected')}>
                                        Dismiss
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
                
                {requests.length === 0 && (
                    <div className="col-span-full p-8 text-center border rounded-lg bg-muted/10 text-muted-foreground">
                        No requests found.
                    </div>
                )}
            </div>
        </div>
    );
}
