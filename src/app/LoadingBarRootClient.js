"use client";
import { useEffect } from "react";
import { LoadingBarProvider, useLoadingBar } from "@/app/shared/contexts/LoadingBarContext";
import LoadingBar from "react-top-loading-bar";
import ClientLoadingBarEvents from "./client-loading-bar";
import { setLoadingBarInstance } from "../utils/loadingBarEvents";
import { AuthProvider } from '@/app/shared/contexts/authContext';
import { ActivitiesProvider } from '@/app/shared/contexts/ActivitiesContext';
import { Toaster } from "sonner";

function LoadingBarConsumerWrapper({ children }) {
  const { loadingBarRef } = useLoadingBar() || {};

  useEffect(() => {
    if (loadingBarRef?.current) {
      setLoadingBarInstance(loadingBarRef.current);
    }
  }, [loadingBarRef]);

  return (
    <>
      <LoadingBar color="rgba(251, 255, 0, 1)" ref={loadingBarRef} height={3} shadow={true} />
      {children}
    </>
  );
}

export default function LoadingBarRootClient({ children }) {
  return (
    <LoadingBarProvider>
      <LoadingBarConsumerWrapper>
        <ClientLoadingBarEvents />
        <AuthProvider>
          <ActivitiesProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </ActivitiesProvider>
        </AuthProvider>
      </LoadingBarConsumerWrapper>
    </LoadingBarProvider>
  );
}
