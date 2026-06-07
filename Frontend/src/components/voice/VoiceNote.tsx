"use client";

import { useState, useEffect } from "react";
import { Mic, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";

export function VoiceNote() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isSending, setIsSending] = useState(false);
    const { user } = useAuthStore();
    
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

    const sendRequest = async () => {
        if (!transcript.trim()) return;
        setIsSending(true);
        try {
            const storedRequests = JSON.parse(localStorage.getItem('kirana_requests') || '[]');
            const newRequest = {
                id: Math.random().toString(36).substr(2, 9),
                worker_email: user?.email || 'worker@store.com',
                message_text: transcript,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            storedRequests.unshift(newRequest);
            localStorage.setItem('kirana_requests', JSON.stringify(storedRequests));

            setTranscript("");
            setIsListening(false);
            alert("Request sent successfully!");
        } catch (e) {
            console.error(e);
            alert("Error sending request.");
        } finally {
            setIsSending(false);
        }
    };

    if (!recognition) return null; // Browser doesn't support speech recognition

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {transcript && (
                <Card className="w-80 shadow-lg">
                    <CardContent className="p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-muted-foreground">Voice Note</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setTranscript(""); setIsListening(false); recognition?.stop(); }}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm border p-2 rounded-md bg-muted/50 min-h-[60px]">
                            {transcript}
                        </p>
                        <Button 
                            className="w-full mt-2" 
                            size="sm" 
                            onClick={sendRequest} 
                            disabled={isSending || isListening}
                        >
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Send to Owner
                        </Button>
                    </CardContent>
                </Card>
            )}
            <Button
                size="icon"
                className={`h-14 w-14 rounded-full shadow-lg ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-primary/90'}`}
                onClick={toggleListening}
            >
                <Mic className="h-6 w-6 text-white" />
            </Button>
        </div>
    );
}
