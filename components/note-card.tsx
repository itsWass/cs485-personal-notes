"use client";

import { useState } from "react";
import { FileText, FileType2, Trash2, X, Loader2 } from "lucide-react";
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
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAnalyzing = !note.concepts || note.concepts.length === 0;

  return (
    <div
      className="animate-sidebar-slide cursor-pointer rounded-lg transition-colors"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
      style={{
        padding: "12px 12px 10px",
        background: isSelected
          ? "oklch(0.65 0.25 25 / 0.15)"
          : hovered
          ? "oklch(0.19 0.01 260)"
          : "oklch(0.12 0.01 260)",
        border: `1px solid ${
          isSelected
            ? "oklch(0.65 0.25 25)"
            : hovered
            ? "oklch(0.26 0.01 260)"
            : "oklch(0.22 0.01 260)"
        }`,
        transition: "background 0.15s, border-color 0.15s",
        userSelect: "none",
      }}
    >
      {/* Header row */}
      <div className="flex items-start gap-2 mb-1.5">
        <div
          className="mt-0.5 shrink-0"
          style={{
            color: note.fileType === "pdf" ? "oklch(0.65 0.18 25)" : "oklch(0.65 0.18 240)",
          }}
        >
          {note.fileType === "pdf" ? (
            <FileType2 className="w-3.5 h-3.5" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
        </div>
        <span className="text-[12.5px] font-semibold flex-1 leading-snug break-words">
          {note.title}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirmDelete) {
              onDelete();
            } else {
              setConfirmDelete(true);
              setTimeout(() => setConfirmDelete(false), 2000);
            }
          }}
          title={confirmDelete ? "Click again to confirm" : "Delete note"}
          className="shrink-0 rounded transition-all cursor-pointer"
          style={{
            padding: "3px 4px",
            background: confirmDelete ? "oklch(0.577 0.245 27.325 / 0.2)" : "transparent",
            border: `1px solid ${confirmDelete ? "oklch(0.577 0.245 27.325)" : "transparent"}`,
            color: confirmDelete ? "oklch(0.577 0.245 27.325)" : "oklch(0.60 0 0)",
            transition: "all 0.15s",
          }}
        >
          {confirmDelete ? (
            <X className="w-3 h-3" />
          ) : (
            <Trash2 className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Content preview */}
      <p
        className="text-[11px] leading-relaxed mb-1.5"
        style={{
          color: "oklch(0.60 0 0)",
          marginLeft: 22,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {note.content.slice(0, 110)}…
      </p>

      {/* Concepts */}
      <div style={{ marginLeft: 22, marginBottom: 6 }}>
        {isAnalyzing ? (
          <span
            className="flex items-center gap-1.5 text-[10px] italic"
            style={{ color: "oklch(0.45 0 0)" }}
          >
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            Analyzing concepts…
          </span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {note.concepts.slice(0, 4).map((c, i) => (
              <span
                key={c}
                className="concept-pop text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: "oklch(0.16 0.01 260)",
                  color: "oklch(0.60 0 0)",
                  animationDelay: `${i * 50}ms`,
                }}
              >
                {c}
              </span>
            ))}
            {note.concepts.length > 4 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  border: "1px solid oklch(0.22 0.01 260)",
                  color: "oklch(0.45 0 0)",
                }}
              >
                +{note.concepts.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between" style={{ marginLeft: 22 }}>
        <span className="text-[10px]" style={{ color: "oklch(0.45 0 0)" }}>
          {formatDistanceToNow(note.createdAt)}
        </span>
        {note.recommendations && note.recommendations.length > 0 && (
          <span
            className="text-[10px] font-medium"
            style={{ color: "oklch(0.65 0.25 25)" }}
          >
            {note.recommendations.length} resources
          </span>
        )}
      </div>
    </div>
  );
}
