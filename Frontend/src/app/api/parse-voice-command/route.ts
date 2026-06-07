import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const responseSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        action: {
            type: SchemaType.STRING,
            description: "The action to perform. One of: 'update_stock', 'add_product', 'update_price', 'deduct_balance'",
        },
        product_name: {
            type: SchemaType.STRING,
            description: "Name of the product (if applicable)",
            nullable: true,
        },
        quantity: {
            type: SchemaType.NUMBER,
            description: "Quantity to add or set (if applicable)",
            nullable: true,
        },
        price: {
            type: SchemaType.NUMBER,
            description: "Price to set (if applicable)",
            nullable: true,
        },
        customer_name: {
            type: SchemaType.STRING,
            description: "Name of the customer (if applicable for deduction)",
            nullable: true,
        },
        amount: {
            type: SchemaType.NUMBER,
            description: "Amount to deduct (if applicable)",
            nullable: true,
        }
    },
    required: ["action"],
};

export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const prompt = `You are an AI assistant for a Kirana (grocery) store owner. 
Parse the following voice command transcribed to text and determine the intent.
Voice Command: "${text}"`;

        console.log("🚀 Sending voice command to Gemini...");
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        console.log("✅ Gemini replied:", responseText);
        const data = JSON.parse(responseText);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("❌ Real Error:", error);
        return NextResponse.json({
            error: error.message || "Failed to process voice command"
        }, { status: 500 });
    }
}
