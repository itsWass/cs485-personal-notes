"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, FileType2, Trash2, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date";

interface Note {
  id: string;
  title: string;
  content: string;
  fileType: string;
  concepts: string[];
  createdAt: string;
  recommendations?: { id: string }[];
}

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, isSelected, onSelect, onDelete }: NoteCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all border ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 bg-card"
      }`}
      onClick={onSelect}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {note.fileType === "pdf" ? (
              <FileType2 className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span className="font-medium text-sm truncate">{note.title}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <ChevronRight
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                isSelected ? "rotate-90 text-primary" : ""
              }`}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {note.content.slice(0, 120)}...
        </p>
        {note.concepts.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {note.concepts.slice(0, 4).map((c) => (
              <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">
                {c}
              </Badge>
            ))}
            {note.concepts.length > 4 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{note.concepts.length - 4}
              </Badge>
            )}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground italic">
            Analyzing concepts...
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(note.createdAt)}
          </span>
          {note.recommendations && note.recommendations.length > 0 && (
            <span className="text-[10px] text-primary font-medium">
              {note.recommendations.length} resources
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
