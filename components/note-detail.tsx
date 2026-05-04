"use client";

import { useEffect, useState, useCallback } from "react";
import { ResourceCard } from "@/components/resource-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, BookOpen, Lightbulb } from "lucide-react";

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
    // Poll until recommendations appear
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
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!note) return null;

  const github = note.recommendations.filter((r) => r.source === "GitHub");
  const youtube = note.recommendations.filter((r) => r.source === "YouTube");
  const articles = note.recommendations.filter(
    (r) => r.source === "Hacker News" || r.source === "arXiv"
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Key Concepts</h3>
        </div>
        {note.concepts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {note.concepts.map((c) => (
              <Badge key={c} className="text-xs">
                {c}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs">Claude is analyzing your note...</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm text-muted-foreground">
            Note Preview
          </h3>
        </div>
        <Card className="bg-secondary border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
              {note.content}
            </p>
          </CardContent>
        </Card>
      </div>

      {note.recommendations.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm">Fetching personalized resources...</span>
        </div>
      ) : (
        <>
          {github.length > 0 && (
            <ResourceSection title="GitHub Projects" items={github} />
          )}
          {youtube.length > 0 && (
            <ResourceSection title="YouTube Tutorials" items={youtube} />
          )}
          {articles.length > 0 && (
            <ResourceSection title="Articles & Papers" items={articles} />
          )}
        </>
      )}
    </div>
  );
}

function ResourceSection({
  title,
  items,
}: {
  title: string;
  items: Recommendation[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <ResourceCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}
