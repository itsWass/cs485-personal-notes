"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface UploadPanelProps {
  onNoteAdded: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  background: "oklch(0.16 0.01 260)",
  border: "1px solid oklch(0.22 0.01 260)",
  borderRadius: 6,
  color: "oklch(0.98 0 0)",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

export function UploadPanel({ onNoteAdded }: UploadPanelProps) {
  const [tab, setTab] = useState<"text" | "file">("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleTextSubmit() {
    if (!title.trim() || !content.trim()) {
      toast.error("Please add a title and content");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to save note");
      toast.success("Note saved! Generating recommendations…");
      setTitle("");
      setContent("");
      onNoteAdded();
    } catch {
      toast.error("Failed to save note");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      toast.success(`"${file.name}" uploaded! Generating recommendations…`);
      onNoteAdded();
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex gap-0.5 p-0.5 rounded-md mb-3"
        style={{ background: "oklch(0.16 0.01 260)" }}
      >
        {(["text", "file"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex flex-1 items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium cursor-pointer transition-all"
            style={{
              background: tab === t ? "oklch(0.12 0.01 260)" : "transparent",
              color: tab === t ? "oklch(0.98 0 0)" : "oklch(0.60 0 0)",
              border: "none",
              boxShadow: tab === t ? "0 1px 4px oklch(0 0 0 / 25%)" : "none",
            }}
          >
            {t === "text" ? <FileText className="w-3 h-3" /> : <Upload className="w-3 h-3" />}
            {t === "text" ? "Text" : "Upload"}
          </button>
        ))}
      </div>

      {tab === "text" ? (
        <div className="flex flex-col gap-2">
          <input
            style={inputStyle}
            placeholder="Note title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={(e) => { e.target.style.borderColor = "oklch(0.65 0.25 25)"; }}
            onBlur={(e) => { e.target.style.borderColor = "oklch(0.22 0.01 260)"; }}
          />
          <textarea
            style={{ ...inputStyle, minHeight: 88, resize: "vertical", lineHeight: 1.5 }}
            placeholder="Paste your notes or lecture content here…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={(e) => { e.target.style.borderColor = "oklch(0.65 0.25 25)"; }}
            onBlur={(e) => { e.target.style.borderColor = "oklch(0.22 0.01 260)"; }}
          />
          <button
            onClick={handleTextSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-[13px] font-semibold cursor-pointer transition-all"
            style={{
              background: loading ? "oklch(0.18 0.01 260)" : "oklch(0.65 0.25 25)",
              color: "oklch(0.98 0 0)",
              border: "none",
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "oklch(0.70 0.25 25)"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "oklch(0.65 0.25 25)"; }}
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing…</>
            ) : (
              <><Plus className="w-3.5 h-3.5" /> Add Note</>
            )}
          </button>
        </div>
      ) : (
        <div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="rounded-lg text-center cursor-pointer transition-all"
            style={{
              border: `2px dashed ${dragOver ? "oklch(0.65 0.25 25)" : "oklch(0.22 0.01 260)"}`,
              padding: "28px 16px",
              background: dragOver ? "oklch(0.65 0.25 25 / 0.15)" : "transparent",
            }}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "oklch(0.65 0.25 25)" }} />
                <p className="text-xs" style={{ color: "oklch(0.60 0 0)" }}>Processing…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <Upload className="w-7 h-7" style={{ color: "oklch(0.60 0 0)" }} />
                <p className="text-[12.5px] font-medium">Drop PDF or TXT file</p>
                <p className="text-xs" style={{ color: "oklch(0.60 0 0)" }}>or click to browse</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.txt"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      )}
    </div>
  );
}
