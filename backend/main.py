from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import json
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai
from supabase import create_client, Client

# Load environment variables
load_dotenv()

app = FastAPI(title="Kirana Store Backend", version="1.0.0")

# Enable CORS for frontend compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Initialization
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("⚠️ Supabase credentials not found in env! Database calls will fail.")
    supabase = None
else:
    supabase: Client = create_client(supabase_url, supabase_key)

# Gemini Initialization
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
    print("🚀 Gemini AI Configured successfully.")
else:
    print("⚠️ GEMINI_API_KEY not found in environment. AI endpoints will run in offline/fallback mode.")

# --- Models ---
class CustomerCreate(BaseModel):
    name: str
    phone: str
    balance: float
    debtStartDate: Optional[str] = None

class DeductRequest(BaseModel):
    name: str
    amount: float

class ProductCreate(BaseModel):
    name: str
    quantity: int
    costPrice: Optional[float] = None
    cost_price: Optional[float] = None
    sellingPrice: Optional[float] = None
    selling_price: Optional[float] = None
    expiryDate: Optional[str] = None
    expiry_date: Optional[str] = None
    category: Optional[str] = None

class CreditScoreRequest(BaseModel):
    balance: float
    debtStartDate: Optional[str] = None
    lastPaymentDate: Optional[str] = None

class VoiceCommandRequest(BaseModel):
    text: str

# --- Helpers ---
def format_customer(c: dict) -> dict:
    """Helper to return both snake_case and camelCase keys for customer store compatibility."""
    if not c:
        return {}
    return {
        **c,
        "creditScore": c.get("credit_score"),
        "debtStartDate": c.get("debt_start_date"),
        "lastPaymentDate": c.get("last_payment_date")
    }

def format_product(p: dict) -> dict:
    """Helper to return both snake_case and camelCase keys for product store compatibility."""
    if not p:
        return {}
    return {
        **p,
        "costPrice": p.get("cost_price"),
        "sellingPrice": p.get("selling_price"),
        "expiryDate": p.get("expiry_date")
    }

def check_supabase():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase connection is not initialized. Check your env variables.")

# --- Endpoints ---

# --- Customer Endpoints ---
@app.get("/api/customers")
def get_customers():
    check_supabase()
    try:
        response = supabase.table("customers").select("*").order("name").execute()
        return [format_customer(c) for c in (response.data or [])]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/customers")
def create_customer(cust: CustomerCreate):
    check_supabase()
    try:
        payload = {
            "name": cust.name,
            "phone": cust.phone,
            "balance": cust.balance,
            "credit_score": 100,
            "debt_start_date": cust.debtStartDate or (datetime.now().strftime("%Y-%m-%d") if cust.balance > 0 else None),
            "history": []
        }
        response = supabase.table("customers").insert(payload).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to insert customer")
        return format_customer(response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/api/customers/{id}")
def update_customer(id: str, updates: dict):
    check_supabase()
    try:
        db_updates = {}
        for k, v in updates.items():
            if k in ["creditScore", "credit_score"]:
                db_updates["credit_score"] = v
            elif k in ["debtStartDate", "debt_start_date"]:
                db_updates["debt_start_date"] = v
            elif k in ["lastPaymentDate", "last_payment_date"]:
                db_updates["last_payment_date"] = v
            elif k in ["name", "phone", "balance", "history"]:
                db_updates[k] = v
                
        response = supabase.table("customers").update(db_updates).eq("id", id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Customer not found")
        return format_customer(response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/customers/deduct")
def deduct_customer_balance(req: DeductRequest):
    check_supabase()
    try:
        response = supabase.table("customers").select("*").ilike("name", req.name).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail=f"Customer with name '{req.name}' not found")
        
        customer = response.data[0]
        current_balance = float(customer.get("balance") or 0.0)
        new_balance = max(0.0, current_balance - req.amount)
        
        update_resp = supabase.table("customers").update({
            "balance": new_balance,
            "last_payment_date": datetime.now().strftime("%Y-%m-%d")
        }).eq("id", customer["id"]).execute()
        
        if not update_resp.data:
            raise HTTPException(status_code=500, detail="Failed to deduct balance")
        return format_customer(update_resp.data[0])
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# --- Product Endpoints ---
@app.get("/api/products")
def get_products():
    check_supabase()
    try:
        response = supabase.table("products").select("*").order("name").execute()
        return [format_product(p) for p in (response.data or [])]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/products")
def create_product(prod: ProductCreate):
    check_supabase()
    try:
        cost = prod.costPrice if prod.costPrice is not None else prod.cost_price
        selling = prod.sellingPrice if prod.sellingPrice is not None else prod.selling_price
        expiry = prod.expiryDate if prod.expiryDate is not None else prod.expiry_date

        payload = {
            "name": prod.name,
            "quantity": prod.quantity,
            "cost_price": cost,
            "selling_price": selling,
            "expiry_date": expiry,
            "category": prod.category
        }
        response = supabase.table("products").insert(payload).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create product")
        return format_product(response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put("/api/products/{id}")
def update_product(id: str, updates: dict):
    check_supabase()
    try:
        db_updates = {}
        for k, v in updates.items():
            if k in ["costPrice", "cost_price"]:
                db_updates["cost_price"] = v
            elif k in ["sellingPrice", "selling_price"]:
                db_updates["selling_price"] = v
            elif k in ["expiryDate", "expiry_date"]:
                db_updates["expiry_date"] = v
            elif k in ["name", "quantity", "category"]:
                db_updates[k] = v
                
        response = supabase.table("products").update(db_updates).eq("id", id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Product not found")
        return format_product(response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# --- AI Billing & Receipt Parsing Endpoints ---
@app.post("/api/parse-invoice")
async def parse_invoice(file: UploadFile = File(...)):
    if not gemini_api_key:
        raise HTTPException(
            status_code=400, 
            detail="Gemini API Key is missing. Please set GEMINI_API_KEY in the backend .env file."
        )
    
    try:
        contents = await file.read()
        image_part = {
            "mime_type": file.content_type or "image/png",
            "data": contents
        }
        
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            "Extract all items and prices from this receipt. Return a JSON object with an 'items' array. "
            "Each item must have 'name', 'quantity' (number), and 'price' (number). Output strict JSON only."
        )
        
        response = model.generate_content(
            [prompt, image_part],
            generation_config={"response_mime_type": "application/json"}
        )
        data = json.loads(response.text.strip())
        return {"items": data.get("items", [])}
    except Exception as e:
        print(f"Gemini API Invoice Parse Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Invoice processing failed: {str(e)}")

@app.post("/api/parse-bill")
async def parse_bill(file: UploadFile = File(...)):
    if not gemini_api_key:
        raise HTTPException(
            status_code=400, 
            detail="Gemini API Key is missing. Please set GEMINI_API_KEY in the backend .env file."
        )
    
    try:
        contents = await file.read()
        image_part = {
            "mime_type": file.content_type or "image/png",
            "data": contents
        }
        
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            "Analyze this image of a bill/receipt. "
            "Extract the \"name\" of the person associated with the bill and the total \"amount\". "
            "Return ONLY a JSON object with keys \"name\" (string) and \"amount\" (number). "
            "Example: { \"name\": \"John Doe\", \"amount\": 150.50 } "
            "If you cannot find a name or amount, return null. Output strict JSON only."
        )
        
        response = model.generate_content(
            [prompt, image_part],
            generation_config={"response_mime_type": "application/json"}
        )
        data = json.loads(response.text.strip())
        return data
    except Exception as e:
        print(f"Gemini API Bill Parse Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Bill processing failed: {str(e)}")

# --- AI Credit Ledger (Credit Score) Recalculator ---
@app.post("/api/credit-score")
def calculate_credit_score(req: CreditScoreRequest):
    # Calculate intervals
    now = datetime.now()
    
    days_since_last_payment = -1
    if req.lastPaymentDate:
        try:
            last_pay = datetime.strptime(req.lastPaymentDate, "%Y-%m-%d")
            days_since_last_payment = abs((now - last_pay).days)
        except Exception:
            days_since_last_payment = -1
            
    days_debt_outstanding = 0
    if req.balance > 0 and req.debtStartDate:
        try:
            start_debt = datetime.strptime(req.debtStartDate, "%Y-%m-%d")
            days_debt_outstanding = abs((now - start_debt).days)
        except Exception:
            days_debt_outstanding = 0

    # 1. Try Gemini calculation if API key is configured
    if gemini_api_key:
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            prompt = f"""
            Calculate credit score (0-100) based on:
            - Balance: {req.balance} (Higher balance (> 10000) = Lower Score)
            - Days Since Payment: {days_since_last_payment} (Recent payment = Higher Score)
            - Days Debt Held: {days_debt_outstanding} (Longer duration (> 30 days) = Lower Score)
            Return JSON: {{ "creditScore": number, "reason": "string" }}
            Logic:
            - Start at 100.
            - Deduct 1 point for every 1000 in balance.
            - Deduct 2 points for every day debt is held > 15 days.
            - Deduct 10 points if no payment in last 30 days.
            """
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text.strip())
            return {
                "creditScore": data.get("creditScore", 100),
                "reason": data.get("reason", "Recalculated by AI")
            }
        except Exception as e:
            print(f"⚠️ Gemini Credit Score calculation failed, falling back to local: {e}")

    # 2. Failsafe Offline Calculation
    local_score = 100
    local_reason = "Excellent standing (Offline Calculation)"

    if req.balance <= 0:
        local_score = 100
        local_reason = "No debt remaining."
    else:
        # Balance penalty: -1 per 1000
        balance_penalty = int(req.balance // 1000)
        local_score -= balance_penalty

        # Duration penalty: -2 per day overdue (>15 days)
        if days_debt_outstanding > 15:
            overdue_days = days_debt_outstanding - 15
            local_score -= (overdue_days * 2)

        # Payment activity penalty
        if days_since_last_payment > 30:
            local_score -= 15
        elif days_since_last_payment == -1:
            local_score -= 10

        local_score = max(0, local_score)
        local_reason = f"Offline: Penalized for balance (-{balance_penalty} pts) and duration ({days_debt_outstanding} days)."

    return {
        "creditScore": local_score,
        "reason": local_reason + " (Note: AI Service fallback used)"
    }

# --- AI Voice Command Parsing ---
@app.post("/api/parse-voice-command")
def parse_voice_command(req: VoiceCommandRequest):
    if not gemini_api_key:
        raise HTTPException(
            status_code=400, 
            detail="Gemini API Key is missing. Please set GEMINI_API_KEY in the backend .env file."
        )
        
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = f"""
        You are an AI assistant for a Kirana (grocery) store owner. 
        Parse the following voice command transcribed to text and determine the intent.
        Voice Command: "{req.text}"
        
        Return a JSON object with:
        - "action": string (one of: 'update_stock', 'add_product', 'update_price', 'deduct_balance')
        - "product_name": string or null (name of product)
        - "quantity": number or null (quantity to add or set)
        - "price": number or null (price to set)
        - "customer_name": string or null (name of customer for deduction)
        - "amount": number or null (amount to deduct)
        
        Output strict JSON only.
        """
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        data = json.loads(response.text.strip())
        return data
    except Exception as e:
        print(f"Gemini voice parser error: {e}")
        raise HTTPException(status_code=500, detail=f"Voice parsing failed: {str(e)}")
