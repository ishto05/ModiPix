"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { fetchModerationHistory, fetchModerationHistoryItem } from "@/lib/moderation";


export function useModerationHistory() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["moderation-history"],
    queryFn: async () => {
      const token = await getToken({ template: "modipixBackend" });
      if (!token) throw new Error("Auth token missing");
      return fetchModerationHistory(token);
    },
    staleTime: 1000 * 60 * 2, // cache for 2 minutes
    refetchOnWindowFocus: false,
  });
}
export function useModerationHistoryItem(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["moderation-history", id],
    queryFn: async () => {
      const token = await getToken({ template: "modipixBackend" });
      return fetchModerationHistoryItem(id, token!);
    },
    enabled: !!id,
  });
}