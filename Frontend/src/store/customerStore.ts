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
    const customers = getStoredCustomers();
    set({ customers });
  },

  addCustomer: async (name, phone, balance, debtStartDate) => {
    const customers = getStoredCustomers();
    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      phone,
      balance,
      credit_score: 100,
      debtStartDate,
      history: []
    };
    const updated = [...customers, newCustomer];
    saveCustomers(updated);
    set({ customers: updated });
  },

  deductBalance: async (name, amount) => {
    const customers = getStoredCustomers();
    let found = false;
    const updated = customers.map((customer) => {
      if (customer.name.toLowerCase() === name.toLowerCase()) {
        found = true;
        const newBalance = Math.max(0, customer.balance - amount);
        return {
          ...customer,
          balance: newBalance,
          lastPaymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return customer;
    });

    if (!found) {
      alert("Failed to process deduction. Check if customer exists.");
      return;
    }

    saveCustomers(updated);
    set({ customers: updated });
  },

  updateCustomer: async (id, updates) => {
    const customers = getStoredCustomers();
    const updated = customers.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          credit_score: updates.credit_score !== undefined ? updates.credit_score : (updates.creditScore !== undefined ? updates.creditScore : c.credit_score)
        };
      }
      return c;
    });
    saveCustomers(updated);
    set({ customers: updated });
  },
}));
