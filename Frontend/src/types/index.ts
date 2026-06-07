export interface Product {
    id: string;
    name: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    expiryDate: string; // ISO Date string
    category?: string;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    balance: number; // Positive means they owe money
    creditScore: number; // 0-100
    debtStartDate?: string; // ISO Date when the debt turned positive
    lastPaymentDate?: string; // ISO Date of last payment
    history?: any[];
}

export interface SalesData {
    id: string;
    date: string;
    sales: number;
    profit: number;
}

