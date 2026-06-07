import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    let balance, daysSinceLastPayment, daysDebtOutstanding;

    try {
        const body = await req.json();
        balance = body.balance;
        const { lastPaymentDate, debtStartDate } = body;

        // --- 1. PRE-CALCULATION (Math Logic) ---
        const now = new Date();

        daysSinceLastPayment = -1;
        if (lastPaymentDate) {
            const lastPay = new Date(lastPaymentDate);
            const diffTime = Math.abs(now.getTime() - lastPay.getTime());
            daysSinceLastPayment = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        daysDebtOutstanding = 0;
        if (balance > 0 && debtStartDate) {
            const startDebt = new Date(debtStartDate);
            const diffTime = Math.abs(now.getTime() - startDebt.getTime());
            daysDebtOutstanding = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // --- 2. ATTEMPT AI CALCULATION ---
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const genAI = new GoogleGenerativeAI(apiKey);
                // Try the stable model first
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: { responseMimeType: "application/json" }
                });

                const prompt = `
                    Calculate credit score (0-100) based on:
                    - Balance: ${balance} (Higher balance (> 10000) = Lower Score)
                    - Days Since Payment: ${daysSinceLastPayment} (Recent payment = Higher Score)
                    - Days Debt Held: ${daysDebtOutstanding} (Longer duration (> 30 days) = Lower Score)
                    Return JSON: { "creditScore": number, "reason": "string" }
                    Logic:
                    - Start at 100.
                    - Deduct 1 point for every 1000 in balance.
                    - Deduct 2 points for every day debt is held > 15 days.
                    - Deduct 10 points if no payment in last 30 days.
                `;

                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const data = JSON.parse(text);

                // Success! Return AI result
                return NextResponse.json({
                    creditScore: data.creditScore,
                    reason: data.reason
                });

            } catch (aiError: any) {
                console.warn("⚠️ AI Service Failed. Switching to Offline Mode.", aiError.message);
                // Do NOT return error. Proceed to fallback below.
            }
        } else {
            console.warn("⚠️ No API Key found. Switching to Offline Mode.");
        }

        // --- 3. OFFLINE FALLBACK (Failsafe) ---
        // If AI failed or Key is missing, we calculate locally so the UI works.
        let localScore = 100;
        let localReason = "Excellent standing (Offline Calculation)";

        if (balance <= 0) {
            localScore = 100;
            localReason = "No debt remaining.";
        } else {
            // Updated Logic as per User Request

            // 1. Balance Penalty
            const balancePenalty = Math.floor(balance / 1000); // -1 per 1000
            localScore -= balancePenalty;

            // 2. Duration Penalty
            if (daysDebtOutstanding > 15) {
                const overdueDays = daysDebtOutstanding - 15;
                localScore -= (overdueDays * 2); // -2 per day overdue
            }

            // 3. Payment Activity Penalty
            if (daysSinceLastPayment > 30) localScore -= 15;
            if (daysSinceLastPayment === -1) localScore -= 10; // New debt, no payment yet

            // Cap at 0
            localScore = Math.max(0, localScore);
            localReason = `Offline: Penalized for balance (${balancePenalty} pts) and duration (${daysDebtOutstanding} days).`;
        }

        return NextResponse.json({
            creditScore: localScore,
            reason: localReason + " (Note: AI Service was unavailable)"
        });

    } catch (error: any) {
        console.error("Critical Error:", error);
        return NextResponse.json({ error: "Calculation Failed" }, { status: 500 });
    }
}