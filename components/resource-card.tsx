"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Newspaper,
  BookOpen,
  ExternalLink,
  Code2,
  Video,
} from "lucide-react";
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
}

const sourceConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  GitHub: {
    icon: <Code2 className="w-3.5 h-3.5" />,
    color: "text-slate-300",
    bg: "bg-slate-800",
  },
  YouTube: {
    icon: <Video className="w-3.5 h-3.5" />,
    color: "text-red-400",
    bg: "bg-red-950",
  },
  "Hacker News": {
    icon: <Newspaper className="w-3.5 h-3.5" />,
    color: "text-orange-400",
    bg: "bg-orange-950",
  },
  arXiv: {
    icon: <BookOpen className="w-3.5 h-3.5" />,
    color: "text-blue-400",
    bg: "bg-blue-950",
  },
};

export function ResourceCard({
  title,
  description,
  url,
  thumbnail,
  source,
  concepts = [],
}: ResourceCardProps) {
  const config = sourceConfig[source] || {
    icon: <ExternalLink className="w-3.5 h-3.5" />,
    color: "text-gray-400",
    bg: "bg-gray-900",
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="feed-card bg-card border-border overflow-hidden h-full cursor-pointer">
        {thumbnail ? (
          <div className="relative w-full aspect-video bg-muted overflow-hidden">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
              {config.icon}
              <span>{source}</span>
            </div>
          </div>
        ) : (
          <div className={`w-full h-24 flex items-center justify-center ${config.bg}`}>
            <span className={`${config.color} scale-150`}>{config.icon}</span>
          </div>
        )}

        <CardContent className="p-4 space-y-2">
          {!thumbnail && (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
              {config.icon}
              <span>{source}</span>
            </div>
          )}
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
          {concepts.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {concepts.slice(0, 3).map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </a>
  );
}
