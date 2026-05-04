"use client";

import { Newspaper, BookMarked, ExternalLink, Code2, Video, Star } from "lucide-react";
import Image from "next/image";

interface ResourceCardProps {
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  source: string;
  type: string;
  concepts?: string[];
  relevance?: number;
  stars?: string;
}

const sourceConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; iconLg: React.ReactNode }
> = {
  GitHub: {
    icon: <Code2 className="w-2.5 h-2.5" />,
    color: "oklch(0.78 0.03 260)",
    bg: "oklch(0.18 0.03 260)",
    iconLg: <Code2 className="w-7 h-7" />,
  },
  YouTube: {
    icon: <Video className="w-2.5 h-2.5" />,
    color: "oklch(0.65 0.22 25)",
    bg: "oklch(0.15 0.08 25)",
    iconLg: <Video className="w-7 h-7" />,
  },
  "Hacker News": {
    icon: <Newspaper className="w-2.5 h-2.5" />,
    color: "oklch(0.72 0.18 55)",
    bg: "oklch(0.15 0.06 55)",
    iconLg: <Newspaper className="w-7 h-7" />,
  },
  arXiv: {
    icon: <BookMarked className="w-2.5 h-2.5" />,
    color: "oklch(0.68 0.18 240)",
    bg: "oklch(0.14 0.06 240)",
    iconLg: <BookMarked className="w-7 h-7" />,
  },
};

function SourceBadge({ source }: { source: string }) {
  const cfg = sourceConfig[source] || {
    icon: <ExternalLink className="w-2.5 h-2.5" />,
    color: "oklch(0.60 0 0)",
    bg: "oklch(0.18 0.01 260)",
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.icon}
      {source}
    </span>
  );
}

export function ResourceCard({
  title,
  description,
  url,
  thumbnail,
  source,
  concepts = [],
  stars,
}: ResourceCardProps) {
  const config = sourceConfig[source] || {
    icon: <ExternalLink className="w-2.5 h-2.5" />,
    color: "oklch(0.60 0 0)",
    bg: "oklch(0.18 0.01 260)",
    iconLg: <ExternalLink className="w-7 h-7" />,
  };

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
      <div
        className="feed-card rounded-lg overflow-hidden h-full cursor-pointer"
        style={{
          background: "oklch(0.12 0.01 260)",
          border: "1px solid oklch(0.22 0.01 260)",
        }}
      >
        {thumbnail ? (
          <div className="relative w-full overflow-hidden" style={{ paddingTop: "56.25%" }}>
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover group-hover:scale-[1.06] transition-transform duration-400"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-2 left-2">
              <SourceBadge source={source} />
            </div>
          </div>
        ) : (
          <div
            className="h-20 flex items-center justify-center"
            style={{ background: config.bg, color: config.color }}
          >
            {config.iconLg}
          </div>
        )}

        <div className="p-3.5 flex flex-col gap-1.5">
          {!thumbnail && <SourceBadge source={source} />}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-[13px] font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2"
              style={{ color: "oklch(0.98 0 0)" }}
            >
              {title}
            </h3>
            {stars && (
              <span
                className="flex items-center gap-1 text-[11px] shrink-0 mt-0.5"
                style={{ color: "oklch(0.60 0 0)" }}
              >
                <Star className="w-2.5 h-2.5" style={{ color: "oklch(0.72 0.18 55)" }} />
                {stars}
              </span>
            )}
          </div>
          <p
            className="text-[12px] leading-relaxed line-clamp-2"
            style={{ color: "oklch(0.60 0 0)" }}
          >
            {description}
          </p>
          {concepts.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {concepts.slice(0, 3).map((c) => (
                <span
                  key={c}
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.16 0.01 260)",
                    color: "oklch(0.60 0 0)",
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
