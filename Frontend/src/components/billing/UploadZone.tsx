"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UploadZone() {
    const { setCart } = useStore();
    const { addProduct, updateProduct, products, fetchProducts } = useInventoryStore();
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [mode, setMode] = useState<"sale" | "restock">("sale");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = async (file: File) => {
        setIsLoading(true);
        setError(null);
        setSuccessMsg(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/parse-invoice", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to scan");

            if (data.items && data.items.length > 0) {
                if (mode === "sale") {
                    // Refreshed Logic for Sale: Use Inventory Prices
                    await fetchProducts();

                    const validatedItems = data.items.map((item: any) => {
                        const itemName = (item.name || item.item_name || "").trim();
                        if (!itemName) return item;

                        const existingProduct = products.find(p => p.name.toLowerCase() === itemName.toLowerCase());
                        if (existingProduct) {
                            // Override with inventory selling price
                            return {
                                ...item,
                                price: existingProduct.selling_price || existingProduct.sellingPrice || item.price
                            };
                        }
                        return item;
                    });

                    setCart(validatedItems);
                    setSuccessMsg("Items added to Cart (Prices synced from Inventory)!");
                } else {
                    // Refreshed Logic for Restock (Backend Connected)
                    // We need to iterate over items and either update existing or add new
                    await fetchProducts(); // Ensure we have latest stock

                    let addedCount = 0;
                    let updatedCount = 0;

                    for (const item of data.items) {
                        const itemName = (item.name || item.item_name || "").trim();
                        if (!itemName) continue;

                        const existingProduct = products.find(p =>
                            p.name.toLowerCase() === itemName.toLowerCase()
                        );

                        const qty = Number(item.quantity || item.qty || 1);
                        const price = Number(item.price || 0);

                        if (existingProduct) {
                            await updateProduct(existingProduct.id, {
                                quantity: (existingProduct.quantity || 0) + qty
                            });
                            updatedCount++;
                        } else {
                            await addProduct({
                                name: itemName,
                                quantity: qty,
                                cost_price: price * 0.8, // Estimate cost
                                selling_price: price,
                                expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
                            } as any);
                            addedCount++;
                        }
                    }

                    // Refresh again to show updates
                    await fetchProducts();
                    setSuccessMsg(`Restocked: ${addedCount} new, ${updatedCount} updated.`);
                }
            } else {
                setError("No items found in this receipt.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="sale">Sale (Add to Bill)</TabsTrigger>
                    <TabsTrigger value="restock">Restock (Add to Inventory)</TabsTrigger>
                </TabsList>
            </Tabs>

            <Card
                className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed transition-all
                    ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                    ${isLoading ? "opacity-80 pointer-events-none" : ""}
                `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                />

                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in">
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">AI is Reading Receipt...</h3>
                            <p className="text-muted-foreground">Extracting items & prices for {mode === 'restock' ? 'Inventory' : 'Sale'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="p-6 rounded-full bg-primary/10">
                            <UploadCloud className="h-12 w-12 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight">Upload {mode === 'restock' ? 'Supplier Invoice' : 'Customer Bill'}</h3>
                            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                Drag & Drop image here to {mode === 'restock' ? 'restock inventory' : 'create a bill'}.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4"
                        >
                            <FileText className="mr-2 h-4 w-4" /> Select File
                        </Button>

                        {error && (
                            <div className="mt-6 flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-md animate-in slide-in-from-bottom-2">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        {successMsg && (
                            <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md animate-in slide-in-from-bottom-2">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">{successMsg}</span>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}