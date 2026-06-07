import { Product, Customer, SalesData } from "@/types";

export const initialProducts: Product[] = [
    {
        id: "1",
        name: "Aashirvaad Atta (5kg)",
        quantity: 45,
        costPrice: 210,
        sellingPrice: 245,
        expiryDate: "2024-06-15",
        category: "Staples"
    },
    {
        id: "2",
        name: "Tata Salt (1kg)",
        quantity: 8, // Low stock
        costPrice: 18,
        sellingPrice: 25,
        expiryDate: "2025-01-20",
        category: "Spices"
    },
    {
        id: "3",
        name: "Amul Butter (500g)",
        quantity: 12,
        costPrice: 240,
        sellingPrice: 275,
        expiryDate: "2023-12-25", // Expiring soon (assuming current date is roughly late 2023/early 2024 for demo context, or I'll set it relative to "now")
        category: "Dairy"
    },
    {
        id: "4",
        name: "Maggi Noodles (Pack of 4)",
        quantity: 150,
        costPrice: 45,
        sellingPrice: 55,
        expiryDate: "2024-08-10",
        category: "Snacks"
    },
    {
        id: "5",
        name: "Fortune Oil (1L)",
        quantity: 5, // Low stock
        costPrice: 130,
        sellingPrice: 165,
        expiryDate: "2024-11-05",
        category: "Staples"
    },
    {
        id: "6",
        name: "Good Day Biscuits",
        quantity: 60,
        costPrice: 25,
        sellingPrice: 35,
        expiryDate: "2024-05-20",
        category: "Snacks"
    },
    {
        id: "7",
        name: "Dettol Soap",
        quantity: 25,
        costPrice: 30,
        sellingPrice: 45,
        expiryDate: "2025-03-15",
        category: "Personal Care"
    },
    {
        id: "8",
        name: "Red Label Tea (500g)",
        quantity: 15,
        costPrice: 200,
        sellingPrice: 240,
        expiryDate: "2024-09-10",
        category: "Beverages"
    }
];

// Helper to set dates relative to now for "Expiring Soon" demo
const today = new Date();
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
initialProducts[2].expiryDate = nextWeek.toISOString().split('T')[0]; // Make Amul Butter expiring soon

export const initialCustomers: Customer[] = [
    {
        id: "c1",
        name: "Rahul Sharma",
        phone: "9876543210",
        balance: 5000,
        creditScore: 45, // Low
        debtStartDate: "2023-11-01",
        lastPaymentDate: "2023-10-15",
        history: []
    },
    {
        id: "c2",
        name: "Priya Singh",
        phone: "9123456780",
        balance: 1200,
        creditScore: 85, // Good
        debtStartDate: "2023-12-01",
        lastPaymentDate: "2023-12-10",
        history: []
    },
    {
        id: "c3",
        name: "Amit Patel",
        phone: "9988776655",
        balance: 0,
        creditScore: 95, // Excellent
        history: []
    }
];

export const initialSales: SalesData[] = [
    { id: "s1", date: "Mon", sales: 4000, profit: 800 },
    { id: "s2", date: "Tue", sales: 3000, profit: 600 },
    { id: "s3", date: "Wed", sales: 5000, profit: 1200 },
    { id: "s4", date: "Thu", sales: 2000, profit: 300 },
    { id: "s5", date: "Fri", sales: 6000, profit: 1500 },
    { id: "s6", date: "Sat", sales: 8000, profit: 2000 },
    { id: "s7", date: "Sun", sales: 7000, profit: 1600 },
];
