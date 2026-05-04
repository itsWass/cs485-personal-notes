"use client";

import { useEffect, useState, useCallback } from "react";
import { ResourceCard } from "@/components/resource-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Sparkles, Code2, Video, Newspaper } from "lucide-react";

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
}

type FilterType = "all" | "github" | "youtube" | "articles";

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

  const filters: { key: FilterType; label: string; icon: React.ReactNode }[] =
    [
      { key: "all", label: "All", icon: <Sparkles className="w-3 h-3" /> },
      { key: "github", label: "GitHub", icon: <Code2 className="w-3 h-3" /> },
      { key: "youtube", label: "YouTube", icon: <Video className="w-3 h-3" /> },
      { key: "articles", label: "Articles", icon: <Newspaper className="w-3 h-3" /> },
    ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Discovery Feed</h2>
          <Badge variant="secondary" className="text-xs">
            {items.length} resources
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex gap-2">
        {filters.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? "default" : "secondary"}
            size="sm"
            onClick={() => setFilter(f.key)}
            className="flex items-center gap-1.5"
          >
            {f.icon}
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading your feed...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground/30" />
          <p className="font-medium text-muted-foreground">
            Your feed is empty
          </p>
          <p className="text-sm text-muted-foreground/70 max-w-sm">
            Add your first note to start discovering relevant resources,
            tutorials, and papers tailored to your learning.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <ResourceCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
