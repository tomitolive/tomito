import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export const BackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = () => {
        if (location.key !== "default") {
            navigate(-1);
        } else {
            navigate("/");
        }
    };

   
};
