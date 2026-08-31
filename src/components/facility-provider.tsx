"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

export interface Facility {
  id: string;
  name: string;
  address: string;
  _count?: {
    students?: number;
    classes?: number;
    leads?: number;
    orders?: number;
  };
}

interface FacilityContextType {
  selectedFacilityId: string;
  selectedFacility: Facility | null;
  facilities: Facility[];
  setSelectedFacilityId: (id: string) => void;
  getFacilityName: (id?: string) => string;
  isLoading: boolean;
}

const DEFAULT_FACILITIES: Facility[] = [
  {
    id: "facility-cau-giay",
    name: "Cơ sở Cầu Giấy",
    address: "123 Xuân Thủy, Cầu Giấy, Hà Nội",
  },
  {
    id: "facility-binh-thanh",
    name: "Cơ sở Bình Thạnh",
    address: "456 Điện Biên Phủ, Bình Thạnh, TP.HCM",
  },
  {
    id: "facility-hai-chau",
    name: "Cơ sở Hải Châu",
    address: "789 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
  },
];

const FacilityContext = createContext<FacilityContextType | undefined>(undefined);

export function FacilityProvider({ children }: { children: React.ReactNode }) {
  const [facilities, setFacilities] = useState<Facility[]>(DEFAULT_FACILITIES);
  const [selectedFacilityId, setSelectedFacilityIdState] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage and fetch current facilities from database
  useEffect(() => {
    let savedId = "all";
    try {
      const saved = localStorage.getItem("educenter_facility_id");
      if (saved) {
        savedId = saved;
        setSelectedFacilityIdState(saved);
      }
    } catch {
      // Ignore localStorage errors
    }

    async function loadFacilities() {
      try {
        const res = await fetch("/api/facilities");
        if (res.ok) {
          const data = await res.json();
          if (data.facilities && Array.isArray(data.facilities) && data.facilities.length > 0) {
            const fetchedList: Facility[] = data.facilities;
            setFacilities(fetchedList);

            // Auto-heal / validate selectedFacilityId
            setSelectedFacilityIdState((currId) => {
              if (currId === "all") return "all";
              const exists = fetchedList.some((f) => f.id === currId);
              if (exists) return currId;

              // If currId is an old legacy CUID or outdated id, try finding matching by slug/keywords
              if (currId.includes("cau-giay") || currId.toLowerCase().includes("hanoi")) {
                const matchHN = fetchedList.find((f) => f.id.includes("cau-giay") || f.name.includes("Cầu Giấy"));
                if (matchHN) return matchHN.id;
              }
              if (currId.includes("binh-thanh") || currId.toLowerCase().includes("hcm")) {
                const matchHCM = fetchedList.find((f) => f.id.includes("binh-thanh") || f.name.includes("Bình Thạnh"));
                if (matchHCM) return matchHCM.id;
              }
              if (currId.includes("hai-chau") || currId.toLowerCase().includes("danang")) {
                const matchDN = fetchedList.find((f) => f.id.includes("hai-chau") || f.name.includes("Hải Châu"));
                if (matchDN) return matchDN.id;
              }

              // Fallback to "all" and clear bad localStorage
              try {
                localStorage.setItem("educenter_facility_id", "all");
              } catch {}
              return "all";
            });
          }
        }
      } catch (e) {
        console.error("Error fetching facilities:", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadFacilities();
  }, []);

  const setSelectedFacilityId = (id: string) => {
    setSelectedFacilityIdState(id);
    try {
      localStorage.setItem("educenter_facility_id", id);
    } catch {
      // Ignore
    }
  };

  const selectedFacility = useMemo(() => {
    if (selectedFacilityId === "all") return null;
    return facilities.find((f) => f.id === selectedFacilityId) || null;
  }, [selectedFacilityId, facilities]);

  const getFacilityName = (id?: string) => {
    if (!id || id === "all") return "Tất cả cơ sở";
    const found = facilities.find((f) => f.id === id);
    return found ? found.name : "Tất cả cơ sở";
  };

  return (
    <FacilityContext.Provider
      value={{
        selectedFacilityId,
        selectedFacility,
        facilities,
        setSelectedFacilityId,
        getFacilityName,
        isLoading,
      }}
    >
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacility() {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error("useFacility must be used within a FacilityProvider");
  }
  return context;
}
