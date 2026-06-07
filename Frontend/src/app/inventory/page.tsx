"use client";

import { InventoryTable } from "@/components/inventory/InventoryTable";
import { VoiceNote } from "@/components/voice/VoiceNote";
import { VoiceCommand } from "@/components/voice/VoiceCommand";
import { useAuthStore } from "@/store/authStore";

export default function InventoryPage() {
    const { user } = useAuthStore();
    const isWorker = user?.role === 'worker';
    const isOwner = user?.role === 'owner';

    return (
        <div className="space-y-6 relative">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Smart Stock Manager</h1>
                <p className="text-muted-foreground">Monitor and manage your store inventory efficiently.</p>
            </div>
            <InventoryTable />
            {isWorker && <VoiceNote />}
            {isOwner && <VoiceCommand />}
        </div>
    );
}
