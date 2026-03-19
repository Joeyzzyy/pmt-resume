"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import LoadingSpinner from "./LoadingSpinner";

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean, text?: string) => void;
  loadingText: string;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("加载中...");

  const setLoading = useCallback((loading: boolean, text?: string) => {
    setIsLoading(loading);
    if (text) setLoadingText(text);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingText }}>
      {children}
      {isLoading && <LoadingSpinner fullScreen text={loadingText} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}
