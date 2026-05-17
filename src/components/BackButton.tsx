"use client";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export const BackButton = () => {
    const router = useRouter();
    const location = { pathname: usePathname(), search: useSearchParams().toString() };

    const handleBack = () => {
        if (location.key !== "default") {
            router.push(-1);
        } else {
            router.push("/");
        }
    };

    return null;
};
