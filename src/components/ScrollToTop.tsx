"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const ScrollToTop = () => {
  const { pathname } = { pathname: usePathname(), search: useSearchParams().toString() };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // حيدها إلا ما بغيتش animation
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
