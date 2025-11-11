"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ModerationImage } from "../api/hooks";

export default function ImageCard({ item }: { item: ModerationImage }) {
  const router = useRouter();
  const risk = typeof item.riskScore === "number" ? `${item.riskScore}%` : undefined;

  return (
    <div
      className="group relative overflow-hidden rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => {
        const params = new URLSearchParams({
          id: String(item.id ?? ""),
          title: item.title ?? "Image",
          image: item.url ?? "",
          verdict: item.verdict ?? "",
          riskScore: risk ?? "",
          timestamp: item.createdAt ?? "",
          source: "image-gallery",
        });
        router.push(`/test?${params.toString()}`);
      }}
    >
      <div className="relative w-full h-56">
        <Image
          src={item.url}
          alt={item.title ?? "image"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold truncate">{item.title ?? "Image"}</h3>
          {risk && <span className="text-xs font-medium">{risk}</span>}
        </div>
        {item.verdict && (
          <span className="mt-1 inline-flex rounded-full bg-black/40 px-2 py-0.5 text-xs">
            {item.verdict}
          </span>
        )}
      </div>
    </div>
  );
}
 
