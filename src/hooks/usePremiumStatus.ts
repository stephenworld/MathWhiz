"use client";
import { useState, useEffect, useCallback } from "react";

const PREMIUM_KEY = "mathWhizKidsPremium";

export const usePremiumStatus = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Access localStorage only on the client
    try {
      const premiumStatus = localStorage.getItem(PREMIUM_KEY);
      setIsPremium(premiumStatus === "true");
    } catch (error) {
      console.error("Could not access localStorage", error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setPremium = useCallback((status: boolean) => {
    try {
      localStorage.setItem(PREMIUM_KEY, String(status));
      setIsPremium(status);
    } catch (error) {
      console.error("Could not set premium status in localStorage", error);
    }
  }, []);

  return { isPremium, setPremium, isLoading };
};
