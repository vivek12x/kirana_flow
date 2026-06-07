import { UploadZone } from "@/components/billing/UploadZone"; // Import the new component
import { CartSummary } from "@/components/billing/CartSummary";

export default function BillingPage() {
    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
            {/* Left Side: Input (Now Upload Zone) */}
            <div className="w-full lg:w-[60%] flex flex-col h-full">
                <h1 className="text-2xl font-bold mb-4">Digitize Invoice</h1>
                <div className="flex-1">
                    <UploadZone />
                </div>
            </div>

            {/* Right Side: Output (Cart Summary) */}
            <div className="w-full lg:w-[40%] h-full">
                <CartSummary />
            </div>
        </div>
    );
}