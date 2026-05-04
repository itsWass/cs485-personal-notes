"use client";

import { useEffect, useState, useCallback } from "react";
import { ResourceCard } from "@/components/resource-card";
import { RefreshCw, Sparkles, Code2, Video, Newspaper } from "lucide-react";

interface FeedItem {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  source: string;
  concepts: string[];
  relevance: number;
  stars?: string;
}

type FilterType = "all" | "github" | "youtube" | "articles";

function SkeletonCard() {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: "oklch(0.12 0.01 260)", border: "1px solid oklch(0.22 0.01 260)" }}
    >
      <div
        className="shimmer"
        style={{ height: 140 }}
      />
      <div className="p-3.5 flex flex-col gap-2">
        <div className="shimmer rounded h-3" style={{ width: "60%" }} />
        <div className="shimmer rounded h-2.5" style={{ width: "90%" }} />
        <div className="shimmer rounded h-2.5" style={{ width: "75%" }} />
      </div>
    </div>
  );
}

export function DiscoveryFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feed");
      const data = await res.json();
      setItems(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "github") return item.source === "GitHub";
    if (filter === "youtube") return item.source === "YouTube";
    if (filter === "articles")
      return item.source === "Hacker News" || item.source === "arXiv";
    return true;
  });

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All", icon: <Sparkles className="w-3 h-3" /> },
    { key: "github", label: "GitHub", icon: <Code2 className="w-3 h-3" /> },
    { key: "youtube", label: "YouTube", icon: <Video className="w-3 h-3" /> },
    { key: "articles", label: "Articles", icon: <Newspaper className="w-3 h-3" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5" style={{ color: "oklch(0.65 0.25 25)" }} />
          <h2 className="text-lg font-bold">Discovery Feed</h2>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: "oklch(0.18 0.01 260)", color: "oklch(0.60 0 0)" }}
          >
            {items.length} resources
          </span>
        </div>
        <button
          onClick={() => { setLoading(true); load(); }}
          title="Refresh"
          className="flex items-center p-1.5 rounded-md transition-all cursor-pointer"
          style={{
            background: "transparent",
            border: "1px solid oklch(0.22 0.01 260)",
            color: "oklch(0.60 0 0)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "oklch(0.26 0.01 260)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "oklch(0.22 0.01 260)"; }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all"
            style={{
              border: `1px solid ${filter === f.key ? "oklch(0.65 0.25 25)" : "oklch(0.22 0.01 260)"}`,
              background: filter === f.key ? "oklch(0.65 0.25 25)" : "oklch(0.18 0.01 260)",
              color: filter === f.key ? "oklch(0.98 0 0)" : "oklch(0.60 0 0)",
            }}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Sparkles className="w-10 h-10 opacity-20" />
          <p className="font-medium" style={{ color: "oklch(0.60 0 0)" }}>
            Your feed is empty
          </p>
          <p
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: "oklch(0.45 0 0)" }}
          >
            Add your first note to start discovering resources tailored to your learning.
          </p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="animate-card-entrance"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <ResourceCard {...item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
