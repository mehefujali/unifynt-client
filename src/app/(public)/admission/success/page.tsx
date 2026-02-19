import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function AdmissionSuccessPage() {
    return (
        <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Received!</h1>
                <p className="text-gray-500 mb-8">
                    Thank you for applying. Your application has been submitted successfully. We will review it and contact you shortly.
                </p>
                <Link href="/">
                    <Button className="w-full">Return to Home</Button>
                </Link>
            </div>
        </div>
    );
}