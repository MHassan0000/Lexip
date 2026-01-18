import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-darker flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8">
                    <FileQuestion className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <h2 className="text-2xl font-bold text-white mb-4">
                    Page Not Found
                </h2>
                <p className="text-text-secondary mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/">
                        <Button className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                            <Home className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                    <Button
                        variant="secondary"
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
