import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MorePage() {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">More</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Settings & Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start h-12 text-lg">
                        <Settings className="mr-3 h-5 w-5" /> Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-12 text-lg">
                        <HelpCircle className="mr-3 h-5 w-5" /> Help & Support
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-12 text-lg text-destructive hover:text-destructive hover:bg-destructive/10">
                        <LogOut className="mr-3 h-5 w-5" /> Logout
                    </Button>
                </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground pt-10">
                KiranaFlow v1.0.0 (Hackathon Build)
            </div>
        </div>
    );
}
