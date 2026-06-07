"use client";

import { useState, useEffect } from "react";
import { Mic, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useInventoryStore } from "@/store/inventoryStore";
import { useCustomerStore } from "@/store/customerStore";

export function VoiceCommand() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const { products, fetchProducts, addProduct, updateProduct } = useInventoryStore();
    const { deductBalance } = useCustomerStore();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const rec = new SpeechRecognition();
                rec.continuous = true;
                rec.interimResults = true;
                rec.lang = 'en-IN'; // or any local language

                rec.onresult = (event: any) => {
                    let currentTranscript = "";
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript;
                    }
                    setTranscript(currentTranscript);
                };

                rec.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };

                setRecognition(rec);
            }
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognition?.stop();
            setIsListening(false);
        } else {
            setTranscript("");
            recognition?.start();
            setIsListening(true);
        }
    };

    const processCommand = async () => {
        if (!transcript.trim()) return;
        setIsProcessing(true);
        try {
            // 1. Get intent from Gemini
            const res = await fetch(`/api/parse-voice-command`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: transcript }),
            });
            
            if (!res.ok) throw new Error("Failed to parse command");
            const data = await res.json();
            
            // 2. Execute action based on Gemini's parsed data
            if (data.action === 'update_stock' || data.action === 'update_price') {
                if (!data.product_name) throw new Error("Product name missing from command");
                
                // Find product by name (case-insensitive)
                const product = products.find(p => p.name.toLowerCase().includes(data.product_name.toLowerCase()));
                
                if (!product) {
                    alert(`Product "${data.product_name}" not found.`);
                    setIsProcessing(false);
                    return;
                }
                
                const updatePayload: any = {};
                if (data.quantity !== null && data.quantity !== undefined) updatePayload.quantity = data.quantity;
                if (data.price !== null && data.price !== undefined) updatePayload.selling_price = data.price;
                
                await updateProduct(product.id, updatePayload);
                alert(`Successfully updated ${product.name}!`);
                fetchProducts();
            } else if (data.action === 'add_product') {
                 if (!data.product_name) throw new Error("Product name missing from command");
                 const newProduct = {
                     name: data.product_name,
                     quantity: data.quantity || 0,
                     cost_price: data.price ? data.price * 0.8 : 0, // Mock cost price
                     selling_price: data.price || 0,
                 };
                 
                 await addProduct(newProduct);
                 alert(`Successfully added ${newProduct.name}!`);
                 fetchProducts();
            } else if (data.action === 'deduct_balance') {
                 if (!data.customer_name) throw new Error("Customer name missing from command");
                 if (data.amount === null || data.amount === undefined) throw new Error("Deduction amount missing from command");
                 
                 await deductBalance(data.customer_name, data.amount);
                 alert(`Successfully processed deduction of ₹${data.amount} for ${data.customer_name}!`);
            } else {
                alert(`Action "${data.action}" not fully supported yet.`);
            }

            setTranscript("");
            setIsListening(false);
            recognition?.stop();
        } catch (e: any) {
            console.error(e);
            alert("Error processing command: " + e.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!recognition) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {transcript && (
                <Card className="w-80 shadow-lg border-primary/20">
                    <CardContent className="p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-primary flex items-center gap-1">
                                <Sparkles className="h-4 w-4" /> AI Command
                            </span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setTranscript(""); setIsListening(false); recognition?.stop(); }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm border p-2 rounded-md bg-primary/5 min-h-[60px]">
                            "{transcript}"
                        </p>
                        <Button 
                            className="w-full mt-2" 
                            size="sm" 
                            onClick={processCommand} 
                            disabled={isProcessing || isListening}
                        >
                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            Execute Command
                        </Button>
                    </CardContent>
                </Card>
            )}
            <Button
                size="icon"
                className={`h-14 w-14 rounded-full shadow-lg ${isListening ? 'bg-primary hover:bg-primary/90 animate-pulse' : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:text-slate-900'}`}
                onClick={toggleListening}
            >
                <Mic className="h-6 w-6 text-white" />
            </Button>
        </div>
    );
}
