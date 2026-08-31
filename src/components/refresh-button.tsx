"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

interface RefreshButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
  label?: string;
  className?: string;
  onRefresh?: () => Promise<void> | void;
}

export function RefreshButton({
  variant = "outline",
  size = "icon",
  showLabel = false,
  label = "Làm mới",
  className = "",
  onRefresh,
}: RefreshButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRefresh = async () => {
    setIsAnimating(true);
    if (onRefresh) {
      try {
        await onRefresh();
      } catch (err) {
        console.error("Refresh callback error:", err);
      }
    }
    startTransition(() => {
      router.refresh();
    });

    // Ensure icon spin animation is noticeable for smooth UX
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  const isSpinning = isPending || isAnimating;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={isSpinning}
      title="Làm mới dữ liệu từ máy chủ (Refresh Data)"
      className={`rounded-2xl border-2 transition-all active:scale-95 cursor-pointer ${className}`}
    >
      <RotateCw
        className={`h-4 w-4 shrink-0 transition-transform ${
          isSpinning ? "animate-spin text-primary" : "text-muted-foreground group-hover:text-foreground"
        }`}
      />
      {showLabel && (
        <span className="text-xs font-bold font-heading">
          {isSpinning ? "Đang tải..." : label}
        </span>
      )}
    </Button>
  );
}
