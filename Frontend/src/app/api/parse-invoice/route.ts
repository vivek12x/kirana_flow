import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        // 1. Validation
        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

        // 2. Prepare the Image Part (Just like Python's Part.from_bytes)
        const arrayBuffer = await file.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString("base64");

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: file.type || "image/png"
            }
        };

        // 3. Initialize Client
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            // This enforces strict JSON, making the frontend happy
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = "Extract all items and prices from this receipt. Return a JSON object with an 'items' array. Each item must have 'name', 'quantity' (number), and 'price' (number).";

        // 4. Generate Content (Just like client.models.generate_content)
        console.log("🚀 Sending image to Gemini...");
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log("✅ Gemini replied:", text.substring(0, 50) + "...");

        // 5. Parse
        const data = JSON.parse(text);

        return NextResponse.json({ items: data.items || [] });

    } catch (error: any) {
        console.error("❌ Real Error:", error);

        // If this crashes, you will see the REAL reason in your browser console
        return NextResponse.json({
            error: error.message || "Failed to process image"
        }, { status: 500 });
    }
}