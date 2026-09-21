"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { SiteData } from "./types";

interface SiteDataContextValue {
  data: SiteData;
  refresh: () => Promise<void>;
  refreshing: boolean;
}

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({
  initialData,
  children,
}: {
  initialData: SiteData;
  children: React.ReactNode;
}) {
  const [data, setData] = useState<SiteData>(initialData);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/site", { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as SiteData;
        setData(json);
      }
    } catch {
      // keep current data on failure
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SiteDataContext.Provider value={{ data, refresh, refreshing }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData must be used within SiteDataProvider");
  return ctx;
}

export function useProduct(slug: string) {
  const { data } = useSiteData();
  return data.products.find((p) => p.slug === slug) ?? null;
}
