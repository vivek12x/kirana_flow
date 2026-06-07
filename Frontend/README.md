# KiranaFlow - Retail Management Dashboard

A comprehensive Retail Management Dashboard (SaaS) for "Kirana" (Grocery) stores.

## Features

- **Inventory Management**: Smart stock tracking with low stock and expiry alerts.
- **Billing (POS)**: Fast billing interface with product search and cart management.
- **Analytics**: Visual insights into sales and profit.
- **Credit Ledger (Khata)**: Track customer credits and scores.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Manual implementation)
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `src/components`: UI components and feature-specific blocks (Inventory, Billing, etc).
- `src/store`: Zustand store logic (`useStore.ts`).
- `src/lib`: Utilities and `mockData.ts`.
- `src/types`: TypeScript definitions.
- `src/app`: App Router pages.
