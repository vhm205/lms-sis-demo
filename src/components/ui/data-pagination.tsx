"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export function DataPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = "",
  itemLabel = "bản ghi",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safePage]);

  if (totalItems <= 0) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3.5 px-3 py-3.5 bg-card/60 rounded-2xl border-2 border-border/70 text-xs font-semibold text-muted-foreground ${className}`}
    >
      {/* Left: Summary and Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Hiển thị <strong className="text-foreground font-mono font-bold">{startItem}</strong> -{" "}
          <strong className="text-foreground font-mono font-bold">{endItem}</strong> trong tổng số{" "}
          <strong className="text-primary font-mono font-bold">{totalItems}</strong> {itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-[11px] text-muted-foreground">Số dòng:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                onPageSizeChange(Number(val));
                onPageChange(1);
              }}
            >
              <SelectTrigger className="h-8 w-20 text-[11px] font-bold rounded-xl border-border/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}/trang
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right: Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={safePage <= 1}
          onClick={() => onPageChange(1)}
          className="h-8 w-8 rounded-xl border-border/80 text-foreground disabled:opacity-40 cursor-pointer"
          title="Trang đầu"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Page */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="h-8 w-8 rounded-xl border-border/80 text-foreground disabled:opacity-40 cursor-pointer"
          title="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1 mx-0.5">
          {pageNumbers.map((num, idx) => {
            if (num === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1.5 text-muted-foreground select-none font-bold"
                >
                  …
                </span>
              );
            }

            const isCurrent = num === safePage;
            return (
              <Button
                key={`page-${num}`}
                type="button"
                variant={isCurrent ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(num as number)}
                className={`h-8 w-8 text-xs font-mono font-bold rounded-xl cursor-pointer transition-all ${
                  isCurrent
                    ? "bg-gradient-to-r from-[#F2994A] to-[#E08E58] text-white shadow-sm border-transparent"
                    : "border-border/80 text-foreground hover:bg-muted/70"
                }`}
              >
                {num}
              </Button>
            );
          })}
        </div>

        {/* Next Page */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="h-8 w-8 rounded-xl border-border/80 text-foreground disabled:opacity-40 cursor-pointer"
          title="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 rounded-xl border-border/80 text-foreground disabled:opacity-40 cursor-pointer"
          title="Trang cuối"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
