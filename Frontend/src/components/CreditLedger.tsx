"use client"
import { useState } from 'react';
import { CustomerList } from './CustomerList';
import { useCustomerStore } from '../store/customerStore';
import { AddCustomerDialog } from './AddCustomerDialog';
import { BillingDropZone } from './BillingDropZone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MinusCircle } from 'lucide-react';

export function CreditLedger() {
    const { customers } = useCustomerStore();
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || null;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Credit Ledger</h1>
                <AddCustomerDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Customer List */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customers</CardTitle>
                            <CardDescription>Select a customer to view details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CustomerList
                                onSelectCustomer={(c) => setSelectedCustomerId(c.id)}
                                selectedCustomerId={selectedCustomer?.id}
                            />
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column: details and Billing */}
                <div className="space-y-6">
                    {selectedCustomer ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>{selectedCustomer.name}</CardTitle>
                                <CardDescription>{selectedCustomer.phone}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-muted-foreground">Current Balance</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        ₹{selectedCustomer.balance.toFixed(2)}
                                    </span>
                                </div>
                                {selectedCustomer.balance > 0 && selectedCustomer.debtStartDate && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Borrowing Since</span>
                                        <span className="text-orange-600 font-medium">
                                            {new Date(selectedCustomer.debtStartDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Credit Score</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xl font-bold ${(selectedCustomer.credit_score || 0) > 75 ? 'text-green-600' :
                                            (selectedCustomer.credit_score || 0) < 50 ? 'text-red-500' : 'text-yellow-500'
                                            }`}>
                                            {selectedCustomer.credit_score || 0}
                                        </span>
                                        <button
                                            onClick={async () => {
                                                if (!selectedCustomer) return;
                                                try {
                                                    // Request new score
                                                    const res = await fetch('/api/credit-score', {
                                                        method: 'POST',
                                                        body: JSON.stringify({
                                                            balance: selectedCustomer.balance,
                                                            debtStartDate: selectedCustomer.debtStartDate,
                                                            lastPaymentDate: selectedCustomer.lastPaymentDate
                                                        })
                                                    });
                                                    const data = await res.json();
                                                    if (data.creditScore !== undefined) {
                                                        // Update backend via store
                                                        // We use 'credit_score' snake_case because that's what we defined in updates logic
                                                        useCustomerStore.getState().updateCustomer(selectedCustomer.id, {
                                                            credit_score: data.creditScore
                                                        });
                                                        alert(`Score Updated: ${data.creditScore}\n${data.reason}`);
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                    alert("Failed to update score");
                                                }
                                            }}
                                            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90 transition-colors"
                                        >
                                            Recalculate
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => {
                                            const amount = prompt("Enter debt amount to add (₹):");
                                            if (amount && !isNaN(Number(amount))) {
                                                const val = Number(amount);
                                                const updates: any = { balance: selectedCustomer.balance + val };
                                                // If starting new debt, set start date
                                                if (selectedCustomer.balance <= 0) {
                                                    updates.debtStartDate = new Date().toISOString().split('T')[0];
                                                }
                                                useCustomerStore.getState().updateCustomer(selectedCustomer.id, updates);
                                            }
                                        }}
                                        className="flex items-center justify-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 py-2 rounded-md font-medium transition-colors"
                                    >
                                        <PlusCircle className="h-4 w-4" /> Add Debt
                                    </button>
                                    <button
                                        onClick={() => {
                                            const amount = prompt("Enter payment amount (₹):");
                                            if (amount && !isNaN(Number(amount))) {
                                                const val = Number(amount);
                                                useCustomerStore.getState().updateCustomer(selectedCustomer.id, {
                                                    balance: Math.max(0, selectedCustomer.balance - val),
                                                    lastPaymentDate: new Date().toISOString().split('T')[0]
                                                });
                                            }
                                        }}
                                        className="flex items-center justify-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 py-2 rounded-md font-medium transition-colors"
                                    >
                                        <MinusCircle className="h-4 w-4" /> Record Payment
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-muted/30 border-dashed">
                            <CardContent className="flex items-center justify-center p-12 text-muted-foreground">
                                Select a customer to view details
                            </CardContent>
                        </Card>
                    )}

                    <BillingDropZone />
                </div>
            </div>
        </div >
    );
}
