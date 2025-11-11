import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./client";

export type ModerationImage = {
  id: string | number;
  url: string;
  title?: string;
  verdict?: "Approved" | "Flagged" | "Rejected" | "Safe" | "Unsafe" | "Risky";
  riskScore?: number; // 0-100
  createdAt?: string;
  status?: "pending" | "approved" | "flagged" | "rejected";
  metadata?: Record<string, unknown>;
};

export function useImagesQuery() {
  return useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      const res = await api.get("/moderation/images");
      return res.data as ModerationImage[];
    },
    refetchInterval: 5000,
  });
}

export function useUploadImageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/moderation/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["images"] });
    },
  });
}

