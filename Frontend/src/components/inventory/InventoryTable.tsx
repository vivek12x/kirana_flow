"use client";

import { useInventoryStore } from "@/store/inventoryStore";
import { useAuthStore } from "@/store/authStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AddProductDialog } from "./AddProductDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export function InventoryTable() {
    const { products, updateProduct, fetchProducts } = useInventoryStore();
    const { user } = useAuthStore();
    const isOwner = user?.role === 'owner';

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const getStatus = (product: any) => {
        const today = new Date();
        const expiryDate = new Date(product.expiry_date || product.expiryDate);
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) {
            return <Badge variant="destructive">Expiring Soon ({diffDays} days)</Badge>;
        }
        if (product.quantity < 10) {
            return <Badge variant="warning">Low Stock</Badge>;
        }
        return <Badge variant="success">In Stock</Badge>;
    };

    return (
        <Card className="shadow-md border-muted/40">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>Manage your stock levels and prices.</CardDescription>
                </div>
                {isOwner && <AddProductDialog />}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30%]">Product Name</TableHead>
                            <TableHead className="w-[15%]">Quantity</TableHead>
                            <TableHead>Cost Price</TableHead>
                            <TableHead>Selling Price</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>
                                    {isOwner ? (
                                        <Input
                                            type="number"
                                            value={product.quantity}
                                            onChange={(e) => updateProduct(product.id, { quantity: parseInt(e.target.value) || 0 })}
                                            className={cn(
                                                "w-20 h-8",
                                                product.quantity < 10 ? "border-yellow-500 text-yellow-600 font-medium" : ""
                                            )}
                                        />
                                    ) : (
                                        <span className={cn(product.quantity < 10 ? "text-yellow-600 font-medium" : "")}>
                                            {product.quantity}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>₹{product.cost_price || product.costPrice}</TableCell>
                                <TableCell>₹{product.selling_price || product.sellingPrice}</TableCell>
                                <TableCell>{product.expiry_date || product.expiryDate}</TableCell>
                                <TableCell>{getStatus(product)}</TableCell>
                            </TableRow>
                        ))}
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No products in inventory.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
