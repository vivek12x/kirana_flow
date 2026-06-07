"use client";

import { useStore } from "@/store/useStore";
import { useInventoryStore } from "@/store/inventoryStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";

export function CartSummary() {
    const { cart, updateCartQuantity, removeFromCart, checkout } = useStore();
    const { products, updateProduct, fetchProducts } = useInventoryStore();

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (confirm(`Confirm checkout for ₹${total}?`)) {

            // 1. Refresh inventory to get latest stock
            await fetchProducts();

            // 2. Deduct stock for each item in cart
            for (const item of cart) {
                const product = products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
                if (product) {
                    const newQuantity = Math.max(0, (product.quantity || 0) - item.quantity);
                    await updateProduct(product.id, { quantity: newQuantity });
                }
            }

            // 3. Clear Cart (Client side)
            checkout();

            // 4. Refresh inventory to show updates
            await fetchProducts();

            alert("Bill processed successfully & Inventory updated!");
        }
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-muted/20">
            <CardHeader className="bg-white border-b sticky top-0 md:rounded-t-lg">
                <CardTitle className="flex justify-between items-center text-xl">
                    <span>Current Bill</span>
                    <span className="text-sm font-normal text-muted-foreground">Order #1024</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0 bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="w-16">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="w-8"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cart.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {item.name}
                                    <div className="text-xs text-muted-foreground">₹{item.price}/unit</div>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value) || 1)}
                                        className="h-8 w-16 px-1 text-center"
                                    />
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    ₹{item.price * item.quantity}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {cart.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                    Cart is empty
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex-col gap-4 border-t bg-white p-6 md:rounded-b-lg sticky bottom-0">
                <div className="flex w-full justify-between items-center">
                    <span className="text-muted-foreground">Items: {totalItems}</span>
                    <div className="text-2xl font-bold">Total: ₹{total}</div>
                </div>
                <Button
                    className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700"
                    disabled={cart.length === 0}
                    onClick={handleCheckout}
                >
                    <Printer className="mr-2 h-5 w-5" /> Checkout & Print
                </Button>
            </CardFooter>
        </Card>
    );
}
