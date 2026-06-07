import { useState, useEffect } from 'react';
import { useCustomerStore, Customer } from '../store/customerStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CustomerListProps {
    onSelectCustomer: (customer: Customer) => void;
    selectedCustomerId?: string;
}

export function CustomerList({ onSelectCustomer, selectedCustomerId }: CustomerListProps) {
    const customers = useCustomerStore((state) => state.customers);
    const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const filteredCustomers = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search customers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {customers.length === 0 ? (
                <div className="text-center text-gray-500 py-4">Loading customers...</div>
            ) : filteredCustomers.length === 0 ? (
                <div className="text-center text-gray-500 py-4">No results found.</div>
            ) : (
                <div className="grid gap-4">
                    {filteredCustomers.map((customer) => (
                        <Card
                            key={customer.id}
                            className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedCustomerId === customer.id ? 'border-primary' : ''
                                }`}
                            onClick={() => onSelectCustomer(customer)}
                        >
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                                    {customer.name ? (
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`}
                                            alt={customer.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-medium">{customer.name.slice(0, 2).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="grid gap-1">
                                    <h3 className="font-semibold leading-none">{customer.name}</h3>
                                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                                </div>
                                <div className="ml-auto font-medium">
                                    ₹{customer.balance.toFixed(2)}
                                </div>
                                {customer.credit_score > 0 && (
                                    <div className="ml-4 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        CS: {customer.credit_score}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
