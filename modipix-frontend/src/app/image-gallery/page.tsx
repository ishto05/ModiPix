"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/nextjs";

import {
  fetchModerationHistory,
  type ModerationHistoryItem,
  getSafetyLevel,
} from "@/lib/moderation";

/* -------------------------------------------------------
   Gallery Item Type (FE Mapped)
------------------------------------------------------- */
interface GalleryItem {
  id: string;
  title: string;
  image: string;
  verdict: "Safe" | "Risky" | "Unsafe";
  verdictColor: string;
  icon: "check_circle" | "warning" | "error";
  riskScore: string;
  createdAt: string;

  // Pass-through to detail page:
  provider: "sightengine" | "nudenet" | "mixed";
  normalized: ModerationHistoryItem["normalized"];
}

/* -------------------------------------------------------
   MAIN
------------------------------------------------------- */
const ImageGallery = () => {
  const router = useRouter();
  const { getToken } = useAuth();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("All Verdicts");
  const [riskScoreFilter, setRiskScoreFilter] = useState("Any Risk Score");
  const [dateFilter, setDateFilter] = useState("");

  /* -------------------------------------------------------
     Fetch Moderation History → Transform for Gallery
  ------------------------------------------------------- */
  useEffect(() => {
    async function load() {
      const token = await getToken({ template: "modipixBackend" });
      if (!token) {
        setLoading(false);
        return;
      }

      const history = await fetchModerationHistory(token);

      const mapped: GalleryItem[] = history.map((h) => {
        const level = getSafetyLevel(h.scores.overall);

        const verdict =
          level.level === "safe"
            ? "Safe"
            : level.level === "caution"
            ? "Risky"
            : "Unsafe";

        const verdictColor =
          level.level === "safe"
            ? "bg-green-100/20 text-green-300 ring-green-400/30"
            : level.level === "caution"
            ? "bg-yellow-100/20 text-yellow-300 ring-yellow-400/30"
            : "bg-red-100/20 text-red-300 ring-red-400/30";

        const icon =
          level.level === "safe"
            ? "check_circle"
            : level.level === "caution"
            ? "warning"
            : "error";

        return {
          id: h.id,
          title: h.imageUrl.split("/").pop() || "Image",
          image: h.imageUrl,
          verdict,
          verdictColor,
          icon,
          riskScore: `${h.scores.overall}%`,
          createdAt: h.createdAt,
          provider: h.provider,
          normalized: h.normalized,
        };
      });

      setItems(mapped);
      setLoading(false);
    }

    load();
  }, [getToken]);

  /* -------------------------------------------------------
     Filtering Logic
  ------------------------------------------------------- */
  const filteredImages = useMemo(() => {
    return items.filter((img) => {
      // Search
      const matchesSearch = img.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // Verdict filter
      const matchesVerdict =
        verdictFilter === "All Verdicts" || img.verdict === verdictFilter;

      // Risk score filter
      let matchesRiskScore = true;
      if (riskScoreFilter !== "Any Risk Score") {
        const value = parseInt(img.riskScore.replace("%", ""));
        if (riskScoreFilter === "High (75% - 100%)")
          matchesRiskScore = value >= 75;
        if (riskScoreFilter === "Medium (40% - 74%)")
          matchesRiskScore = value >= 40 && value < 75;
        if (riskScoreFilter === "Low (0% - 39%)")
          matchesRiskScore = value < 40;
      }

      // Date filter
      const matchesDate =
        !dateFilter || img.createdAt.startsWith(dateFilter);

      return matchesSearch && matchesVerdict && matchesRiskScore && matchesDate;
    });
  }, [items, searchTerm, verdictFilter, riskScoreFilter, dateFilter]);

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */
  return (
    <>
      <SignedIn>
        <div
          className="w-full min-h-screen bg-background"
          style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
          <main className="w-full bg-muted/30 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-screen-xl">
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  Image Gallery
                </h2>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  Browse and filter your moderated uploads.
                </p>
              </div>

              {/* Filters */}
              <div className="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search by image name..."
                    className="w-full rounded-md border border-input bg-background text-foreground py-2.5 pl-3 pr-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {/* Verdict */}
                  <select
                    className="w-full rounded-md border border-input bg-background text-foreground py-2.5 pl-3 pr-10 text-sm focus:border-ring focus:ring-ring"
                    value={verdictFilter}
                    onChange={(e) => setVerdictFilter(e.target.value)}
                  >
                    <option>All Verdicts</option>
                    <option>Safe</option>
                    <option>Risky</option>
                    <option>Unsafe</option>
                  </select>

                  {/* Risk Score */}
                  <select
                    className="w-full rounded-md border border-input bg-background text-foreground py-2.5 pl-3 pr-10 text-sm focus:border-ring focus:ring-ring"
                    value={riskScoreFilter}
                    onChange={(e) => setRiskScoreFilter(e.target.value)}
                  >
                    <option>Any Risk Score</option>
                    <option>High (75% - 100%)</option>
                    <option>Medium (40% - 74%)</option>
                    <option>Low (0% - 39%)</option>
                  </select>

                  {/* Date */}
                  <input
                    type="date"
                    className="w-full rounded-md border border-input bg-background text-foreground py-2.5 px-3 text-sm focus:border-ring focus:ring-ring"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {loading ? (
                  <div className="col-span-full py-20 text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : filteredImages.length > 0 ? (
                  filteredImages.map((img) => (
                    <div
                      key={img.id}
                      className="group relative cursor-pointer overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-lg"
                      onClick={() => {
                        const params = new URLSearchParams({
                          id: img.id,
                          title: img.title,
                          image: img.image,
                          verdict: img.verdict,
                          riskScore: img.riskScore,
                          provider: img.provider,
                          source: "image-gallery",
                        });
                        router.push(`/test?${params.toString()}`);
                      }}
                    >
                      <img
                        src={img.image}
                        alt={img.title}
                        className="h-48 sm:h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      <div className="absolute bottom-0 left-0 p-3 sm:p-4 text-white">
                        <h3 className="text-sm font-semibold truncate">
                          {img.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ring-1 ring-inset ${img.verdictColor}`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {img.icon}
                            </span>
                            <span className="hidden sm:inline">
                              {img.verdict}
                            </span>
                          </span>
                          <span className="font-medium">{img.riskScore}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-muted-foreground">
                      search_off
                    </span>
                    <h3 className="mt-4 text-lg font-medium text-foreground">
                      No images found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search terms.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default ImageGallery;
