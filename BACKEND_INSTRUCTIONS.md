# Kirana Store Backend Instructions

This guide provides steps to set up and run the Python FastAPI backend connected to Supabase and Gemini AI.

---

## 1. Supabase Database Schema Setup

Before running the backend, you must create the necessary tables in your Supabase project.

1. Go to your [Supabase Dashboard](https://supabase.com/).
2. Select your project.
3. Click on the **SQL Editor** in the left sidebar.
4. Click **New query** and paste the following SQL commands:

```sql
-- Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    credit_score INTEGER DEFAULT 100,
    debt_start_date TEXT,
    last_payment_date TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable row-level security (RLS) or add policies if needed. For development, you can disable RLS or allow all roles.
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read and write access" ON public.customers 
    FOR ALL USING (true) WITH CHECK (true);

-- Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    cost_price NUMERIC,
    selling_price NUMERIC,
    expiry_date TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read and write access" ON public.products 
    FOR ALL USING (true) WITH CHECK (true);
```

5. Click **Run** to execute the script and create the tables.

---

## 2. Python Backend Setup

Follow these commands to install dependencies and run the server.

### Prerequisites
- Python 3.9+ must be installed on your system.

### Installation Steps (Run in powershell/terminal from project root):

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a Python Virtual Environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the Virtual Environment**:
   - **On Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **On Windows (CMD)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - **On macOS/Linux**:
     ```bash
     source venv/bin/activate
     ```

4. **Install Python Packages**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure Environment Variables**:
   - Copy `.env.example` to `.env`:
     - **Windows (PowerShell)**: `Copy-Item .env.example .env`
     - **macOS/Linux/Git Bash**: `cp .env.example .env`
   - Open `backend/.env` and insert your credentials:
     - `SUPABASE_URL`: From Supabase Project Settings -> API.
     - `SUPABASE_KEY`: From Supabase Project Settings -> API -> `anon` public key (or `service_role` secret key for backend access).
     - `GEMINI_API_KEY`: Your Google Gemini API Key.

---

## 3. Running the Backend

Ensure your virtual environment is active, then run:

```bash
uvicorn main:app --reload --port 8000
```

The backend API docs will be available at `http://127.0.0.1:8000/docs`.

---

## 4. Running the Frontend

The frontend Next.js development server is configured to proxy all `/api/*` requests to the Python backend running on port 8000. 

Run this in the `Frontend` folder:
```bash
npm run dev
```
Now, whenever the frontend fetches `/api/customers`, nextjs proxies it to the FastAPI backend!
