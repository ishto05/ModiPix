"use client";

import * as React from "react";
import type { ModerationImage } from "../api/hooks";
import { useRouter } from "next/navigation";

export default function ModerationTable({ data }: { data: ModerationImage[] }) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr className="text-left text-muted-foreground">
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Risk Score</th>
            <th className="px-4 py-2">Decision</th>
            <th className="px-4 py-2">Timestamp</th>
            <th className="px-4 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const risk = typeof item.riskScore === "number" ? `${item.riskScore}%` : "―";
            return (
              <tr key={`${item.id}-${idx}`} className="border-b last:border-b-0">
                <td className="px-4 py-2">
                  <img src={item.url} alt={item.title ?? "image"} className="size-10 rounded object-cover" />
                </td>
                <td className="px-4 py-2">{risk}</td>
                <td className="px-4 py-2">{item.verdict ?? item.status ?? "―"}</td>
                <td className="px-4 py-2">{item.createdAt ?? "―"}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    className="text-primary hover:underline"
                    onClick={() => {
                      const params = new URLSearchParams({
                        id: String(item.id ?? ""),
                        title: item.title ?? "Image",
                        image: item.url ?? "",
                        verdict: item.verdict ?? String(item.status ?? ""),
                        riskScore: typeof item.riskScore === "number" ? String(item.riskScore) : "",
                        timestamp: item.createdAt ?? "",
                        source: "moderation-history",
                      });
                      router.push(`/test?${params.toString()}`);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

