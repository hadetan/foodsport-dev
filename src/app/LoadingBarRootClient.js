"use client";
import { LoadingBarProvider, useLoadingBar } from "@/app/shared/contexts/LoadingBarContext";
import LoadingBar from "react-top-loading-bar";
import ClientLoadingBarEvents from "./client-loading-bar";
import { setLoadingBarInstance } from "../utils/loadingBarEvents";
import { AuthProvider } from '@/app/shared/contexts/authContext';
import { ActivitiesProvider } from '@/app/shared/contexts/ActivitiesContext';

function LoadingBarConsumerWrapper({ children }) {
  const { loadingBarRef } = useLoadingBar() || {};
  // Set the loading bar instance for global axios usage
  if (loadingBarRef && loadingBarRef.current) {
    setLoadingBarInstance(loadingBarRef.current);
  }

  // Temporary test button for manual loading bar trigger
  const handleStart = () => loadingBarRef?.current?.continuousStart();
  const handleComplete = () => loadingBarRef?.current?.complete();

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
          </ActivitiesProvider>
        </AuthProvider>
      </LoadingBarConsumerWrapper>
    </LoadingBarProvider>
  );
}
