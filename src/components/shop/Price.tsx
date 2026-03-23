"use client";

import { useSettingsStore } from "@/lib/useSettingsStore";
import { useEffect, useState } from "react";

interface PriceProps {
  amount: number;
  className?: string;
}

export function Price({ amount, className = "" }: PriceProps) {
  const { currency } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <span className={className}>EGP {amount.toLocaleString()}</span>;
  }

  // Mock rates (Base is EGP)
  const rates: Record<string, number> = {
    EGP: 1,
    USD: 0.02,
    EUR: 0.018,
  };

  const symbols: Record<string, string> = {
    EGP: "EGP",
    USD: "$",
    EUR: "€",
  };

  const convertedAmount = amount * (rates[currency] || 1);
  const symbol = symbols[currency] || "EGP";

  return (
    <span className={className}>
      {currency === "EGP" ? `${symbol} ` : symbol}
      {convertedAmount.toLocaleString(undefined, {
        minimumFractionDigits: currency === "EGP" ? 0 : 2,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}
