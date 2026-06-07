import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useCustomerStore } from '../store/customerStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Note: In a real app, this should be an env var. 
// Assuming user might provide it or it's set in environment.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
console.log('API Key from ENV is set:', !!API_KEY);
export function BillingDropZone() {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const deductBalance = useCustomerStore((state) => state.deductBalance);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFile = useCallback(async (file: File) => {
        if (!API_KEY) {
            setMessage({ type: 'error', text: 'Gemini API Key is missing. Please set GEMINI_API_KEY.' });
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onloadend = async () => {
                const base64Data = (reader.result as string).split(',')[1];

                const prompt = `
          Analyze this image of a bill/receipt. 
          Extract the "name" of the person associated with the bill and the total "amount".
          Return ONLY a JSON object with keys "name" (string) and "amount" (number).
          Example: { "name": "John Doe", "amount": 150.50 }
          If you cannot find a name or amount, return null.
        `;

                const imagePart = {
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type,
                    },
                };

                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();

                try {
                    // Clean up code blocks if present
                    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
                    const data = JSON.parse(cleanText);

                    if (data && data.name && data.amount) {
                        await deductBalance(data.name, data.amount);
                        setMessage({
                            type: 'success',
                            text: `Processed bill for ${data.name}. Deducted ₹${data.amount}.`
                        });
                    } else {
                        setMessage({ type: 'error', text: 'Could not extract valid name and amount from the image.' });
                    }
                } catch (e) {
                    console.error("Parsing error", e);
                    setMessage({ type: 'error', text: 'Failed to parse AI response.' });
                }
                setIsProcessing(false);
            };

        } catch (error) {
            console.error("AI Error", error);
            setMessage({ type: 'error', text: 'Error processing image with AI.' });
            setIsProcessing(false);
        }
    }, [deductBalance]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                processFile(file);
            } else {
                setMessage({ type: 'error', text: 'Please drop an image file.' });
            }
        }
    }, [processFile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <Card className="border-2 border-dashed border-gray-300 overflow-hidden">
            <CardHeader className="bg-muted/10">
                <CardTitle className="text-lg">Bill Processor</CardTitle>
                <CardDescription>Drop a bill image to auto-deduct balance.</CardDescription>
            </CardHeader>
            <CardContent
                className={`
            p-8 flex flex-col items-center justify-center transition-colors min-h-[200px]
            ${isDragging ? 'bg-primary/10 border-primary' : 'hover:bg-muted/20'}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isProcessing ? (
                    <div className="flex flex-col items-center gap-2 text-primary">
                        <Loader2 className="h-10 w-10 animate-spin" />
                        <p>Analyzing bill with AI...</p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground text-center mb-2">
                            Drag and drop a bill image here, or
                        </p>
                        <label htmlFor="file-upload">
                            <Button variant="secondary" size="sm" className="cursor-pointer" asChild>
                                <span>Browse Files</span>
                            </Button>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                        </label>
                    </>
                )}

                {message && (
                    <div className={`mt-4 flex items-center gap-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'
                        }`}>
                        {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {message.text}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
