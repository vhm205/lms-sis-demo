"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export interface UseTableHighlightOptions<T> {
  items: T[];
  filteredItems: T[];
  getId: (item: T) => string;
  getSecondaryId?: (item: T) => string | undefined;
  getFacilityId?: (item: T) => string | undefined;
  getStatus?: (item: T) => string | undefined;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  selectedFacilityId?: string;
  setSelectedFacilityId?: (facilityId: string) => void;
  selectedStatus?: string;
  setSelectedStatus?: (status: string) => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
}

export function useTableHighlight<T>({
  items,
  filteredItems,
  getId,
  getSecondaryId,
  getFacilityId,
  getStatus,
  pageSize,
  setCurrentPage,
  selectedFacilityId,
  setSelectedFacilityId,
  selectedStatus,
  setSelectedStatus,
  searchTerm,
  setSearchTerm,
}: UseTableHighlightOptions<T>) {
  const searchParams = useSearchParams();
  const highlightParam = searchParams.get("highlight");
  const qParam = searchParams.get("q") || searchParams.get("search");

  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [highlightedItem, setHighlightedItem] = useState<T | null>(null);

  // 1. Pre-fill search input if 'q' or 'search' parameter is provided (e.g. from "xem tất cả →")
  useEffect(() => {
    if (qParam && setSearchTerm && searchTerm !== qParam) {
      setSearchTerm(qParam);
    }
  }, [qParam, setSearchTerm, searchTerm]);

  // 2. Detect highlight parameter and ensure matching filters are aligned
  useEffect(() => {
    if (!highlightParam) {
      if (highlightedId) {
        setHighlightedId(null);
        setHighlightedItem(null);
      }
      return;
    }

    const foundItem = items.find(
      (item) =>
        getId(item) === highlightParam ||
        (getSecondaryId && getSecondaryId(item) === highlightParam)
    );

    if (!foundItem) return;

    setHighlightedId(getId(foundItem));
    setHighlightedItem(foundItem);

    // Clear search term if it might exclude the highlighted item
    if (searchTerm && setSearchTerm && !qParam) {
      setSearchTerm("");
    }

    // Reset facility filter to 'all' if current facility hides this item
    if (getFacilityId && setSelectedFacilityId && selectedFacilityId && selectedFacilityId !== "all") {
      const facId = getFacilityId(foundItem);
      if (facId && facId !== selectedFacilityId) {
        setSelectedFacilityId("all");
      }
    }

    // Reset status filter to 'all' if current status hides this item
    if (getStatus && setSelectedStatus && selectedStatus && selectedStatus !== "all") {
      const st = getStatus(foundItem);
      if (st && st !== selectedStatus) {
        setSelectedStatus("all");
      }
    }
  }, [
    highlightParam,
    items,
    getId,
    getSecondaryId,
    getFacilityId,
    getStatus,
    selectedFacilityId,
    setSelectedFacilityId,
    selectedStatus,
    setSelectedStatus,
    searchTerm,
    setSearchTerm,
    qParam,
    highlightedId,
  ]);

  // 3. Navigate pagination and scroll smoothly to the target row
  useEffect(() => {
    if (!highlightedId) return;

    const indexInFiltered = filteredItems.findIndex(
      (item) =>
        getId(item) === highlightedId ||
        (getSecondaryId && getSecondaryId(item) === highlightedId)
    );

    if (indexInFiltered !== -1) {
      const targetPage = Math.floor(indexInFiltered / pageSize) + 1;
      setCurrentPage(targetPage);

      const timer = setTimeout(() => {
        const rowId = `row-highlight-${highlightedId}`;
        const el = document.getElementById(rowId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 180);

      return () => clearTimeout(timer);
    }
  }, [highlightedId, filteredItems, getId, getSecondaryId, pageSize, setCurrentPage]);

  const clearHighlight = useCallback(() => {
    setHighlightedId(null);
    setHighlightedItem(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("highlight");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  }, []);

  const isHighlighted = useCallback(
    (item: T) => {
      if (!highlightedId) return false;
      return (
        getId(item) === highlightedId ||
        (getSecondaryId && getSecondaryId(item) === highlightedId)
      );
    },
    [highlightedId, getId, getSecondaryId]
  );

  return {
    highlightedId,
    highlightedItem,
    isHighlighted,
    clearHighlight,
  };
}
