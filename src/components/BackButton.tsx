import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export const BackButton = () => {
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-6 right-6 z-[60] animate-in fade-in slide-in-from-right-4 duration-500">
            <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(-1)}
                className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-md border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 shadow-2xl group"
            >
                <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </Button>
        </div>
    );
};
