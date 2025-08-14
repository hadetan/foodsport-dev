"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLoadingBar } from "@/app/shared/contexts/LoadingBarContext";

export default function ClientLoadingBarEvents() {
  const pathname = usePathname();
  const loadingBar = useLoadingBar();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (!loadingBar) return;
    if (prevPath.current !== pathname) {
      loadingBar.start();
      // Simulate route load complete after a short delay
      setTimeout(() => loadingBar.complete(), 500);
      prevPath.current = pathname;
    }
  }, [pathname, loadingBar]);

  return null;
}
