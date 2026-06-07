import { create } from 'zustand';
import { initialCustomers } from '@/lib/mockData';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  credit_score: number;
  creditScore?: number; // supporting camelCase just in case
  debtStartDate?: string; // Optional: ISO string date
  lastPaymentDate?: string;
  history?: any[];
}

interface CustomerState {
  customers: Customer[];
  fetchCustomers: () => Promise<void>;
  addCustomer: (name: string, phone: string, balance: number, debtStartDate?: string) => Promise<void>;
  deductBalance: (name: string, amount: number) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
}

const getStoredCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('kirana_customers');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored customers', e);
    }
  }
  const mapped = initialCustomers.map(c => ({
    ...c,
    credit_score: c.creditScore ?? 100
  }));
  localStorage.setItem('kirana_customers', JSON.stringify(mapped));
  return mapped;
};

const saveCustomers = (customers: Customer[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kirana_customers', JSON.stringify(customers));
  }
};

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: typeof window !== 'undefined' ? getStoredCustomers() : [],

  fetchCustomers: async () => {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const customers = await res.json();
        set({ customers });
      }
    } catch (e) {
      console.error('Failed to fetch customers from API', e);
    }
  },

  addCustomer: async (name, phone, balance, debtStartDate) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, balance, debtStartDate })
      });
      if (res.ok) {
        const newCustomer = await res.json();
        set((state) => ({ customers: [...state.customers, newCustomer] }));
      } else {
        console.error('Failed to add customer to DB');
      }
    } catch (e) {
      console.error('Failed to add customer', e);
    }
  },

  deductBalance: async (name, amount) => {
    try {
      const res = await fetch('/api/customers/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, amount })
      });
      if (res.ok) {
        const updatedCustomer = await res.json();
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === updatedCustomer.id ? updatedCustomer : c
          )
        }));
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to process deduction. Check if customer exists.");
      }
    } catch (e) {
      console.error('Failed to deduct customer balance', e);
    }
  },

  updateCustomer: async (id, updates) => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedCustomer = await res.json();
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? updatedCustomer : c
          )
        }));
      } else {
        console.error('Failed to update customer in DB');
      }
    } catch (e) {
      console.error('Failed to update customer', e);
    }
  },
}));
