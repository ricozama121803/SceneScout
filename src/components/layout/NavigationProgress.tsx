"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

export function NavigationProgress() {
  const pathname = usePathname();
  const [navigating, setNavigating] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;
      if (href !== pathname) setNavigating(true);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setNavigating(false);
    }
  }, [pathname]);

  if (!navigating) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <Spinner size="lg" />
    </div>
  );
}
