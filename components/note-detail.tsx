"use client";

import { useEffect, useState, useCallback } from "react";
import { ResourceCard } from "@/components/resource-card";
import { Loader2, BookOpen, Lightbulb, Code2, Video, Newspaper, Search } from "lucide-react";

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  source: string;
  relevance: number;
  concepts: string[];
  stars?: string;
}

interface NoteDetail {
  id: string;
  title: string;
  content: string;
  concepts: string[];
  recommendations: Recommendation[];
}

interface NoteDetailProps {
  noteId: string;
}

export function NoteDetail({ noteId }: NoteDetailProps) {
  const [note, setNote] = useState<NoteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}`);
      const data = await res.json();
      setNote(data);
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    load();
    const interval = setInterval(async () => {
      const res = await fetch(`/api/notes/${noteId}`);
      const data = await res.json();
      setNote(data);
      if (data.recommendations?.length > 0 && data.concepts?.length > 0) {
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [noteId, load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "oklch(0.65 0.25 25)" }} />
      </div>
    );
  }

  if (!note) return null;

  const isAnalyzing = !note.concepts || note.concepts.length === 0;
  const github = note.recommendations.filter((r) => r.source === "GitHub");
  const youtube = note.recommendations.filter((r) => r.source === "YouTube");
  const articles = note.recommendations.filter(
    (r) => r.source === "Hacker News" || r.source === "arXiv"
  );

  return (
    <div className="animate-fade-slide-in space-y-7 pb-10">
      {/* Key Concepts */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Lightbulb className="w-4 h-4" style={{ color: "oklch(0.65 0.25 25)" }} />
          <h3 className="text-[13px] font-semibold">Key Concepts</h3>
        </div>
        {isAnalyzing ? (
          <div
            className="flex items-center gap-2"
            style={{ color: "oklch(0.60 0 0)" }}
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-sm">Analyzing your note…</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {note.concepts.map((c, i) => (
              <span
                key={c}
                className="concept-pop text-xs px-3 py-1 rounded-full font-medium"
                style={{
                  background: "oklch(0.65 0.25 25 / 0.15)",
                  color: "oklch(0.65 0.25 25)",
                  border: "1px solid oklch(0.65 0.25 25 / 0.3)",
                  animationDelay: `${i * 55}ms`,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Note Preview */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <BookOpen className="w-3.5 h-3.5" style={{ color: "oklch(0.60 0 0)" }} />
          <h3
            className="text-[13px] font-semibold"
            style={{ color: "oklch(0.60 0 0)" }}
          >
            Note Preview
          </h3>
        </div>
        <div
          className="rounded-lg px-4 py-3.5"
          style={{
            background: "oklch(0.16 0.01 260)",
            border: "1px solid oklch(0.22 0.01 260)",
          }}
        >
          <p
            className="text-sm leading-relaxed line-clamp-5"
            style={{ color: "oklch(0.60 0 0)" }}
          >
            {note.content}
          </p>
        </div>
      </div>

      {/* Resources */}
      {note.recommendations.length === 0 ? (
        isAnalyzing ? (
          <div
            className="flex items-center gap-2.5 py-5"
            style={{ color: "oklch(0.60 0 0)" }}
          >
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "oklch(0.65 0.25 25)" }} />
            <span className="text-sm">Fetching personalized resources…</span>
          </div>
        ) : (
          <div
            className="flex flex-col items-center py-8 gap-2.5 text-center"
            style={{ color: "oklch(0.45 0 0)" }}
          >
            <Search className="w-8 h-8" />
            <p className="text-sm">No resources yet</p>
          </div>
        )
      ) : (
        <>
          {github.length > 0 && (
            <ResourceSection title="GitHub Projects" icon={<Code2 className="w-3.5 h-3.5" />} items={github} />
          )}
          {youtube.length > 0 && (
            <ResourceSection title="YouTube Tutorials" icon={<Video className="w-3.5 h-3.5" />} items={youtube} />
          )}
          {articles.length > 0 && (
            <ResourceSection title="Articles & Papers" icon={<Newspaper className="w-3.5 h-3.5" />} items={articles} />
          )}
        </>
      )}
    </div>
  );
}

function ResourceSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: Recommendation[];
}) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: "oklch(0.60 0 0)" }}>{icon}</span>
        <h3
          className="text-[13px] font-semibold uppercase tracking-wider"
          style={{ color: "oklch(0.60 0 0)", letterSpacing: "0.06em" }}
        >
          {title}
        </h3>
        <span className="text-[11px]" style={{ color: "oklch(0.45 0 0)" }}>
          {items.length}
        </span>
      </div>
      <div
        className="grid gap-3.5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="animate-card-entrance"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <ResourceCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
