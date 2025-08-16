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
      prevPath.current = pathname;
      const id = setTimeout(() => loadingBar.complete(), 0);
      return () => clearTimeout(id);
    }
  }, [pathname, loadingBar, pathname]);

  return null;
}
