"use client";

import { useInventoryStore } from "@/store/inventoryStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import { useEffect } from "react";

export function RestockRecommendation() {
    const { products, fetchProducts } = useInventoryStore();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const lowStockItems = products.filter(p => p.quantity < 10);
    const recommendationList = [...lowStockItems];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Recommended Restock</CardTitle>
                <CardDescription>
                    Items running low that need replenishment.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recommendationList.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Inventory levels are healthy.</p>
                    ) : (
                        recommendationList.map(item => (
                            <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">Current Stock: <span className="text-destructive font-bold">{item.quantity}</span></div>
                                </div>
                                <Button size="sm" variant="outline" className="h-8">
                                    <Truck className="mr-2 h-3 w-3" /> Order
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

