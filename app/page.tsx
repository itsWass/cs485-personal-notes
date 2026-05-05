"use client";

import { useState, useEffect, useCallback } from "react";
import { UploadPanel } from "@/components/upload-panel";
import { NoteCard } from "@/components/note-card";
import { NoteDetail } from "@/components/note-detail";
import { DiscoveryFeed } from "@/components/discovery-feed";
import { Sparkles, BookOpen, Rss, Menu, Plus, ChevronDown, FileText, FileType2 } from "lucide-react";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";

interface Note {
  id: string;
  title: string;
  content: string;
  fileType: string;
  concepts: string[];
  createdAt: string;
  recommendations: { id: string }[];
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "feed">("feed");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const loadNotes = useCallback(async () => {
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(data);
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    const interval = setInterval(loadNotes, 5000);
    return () => clearInterval(interval);
  }, [loadNotes]);

  async function deleteNote(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    toast.success("Note deleted");
    if (selectedNoteId === id) setSelectedNoteId(null);
    loadNotes();
  }

  function switchTab(tab: "notes" | "feed") {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setAnimKey((k) => k + 1);
  }

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 300 : 0,
          minWidth: sidebarOpen ? 300 : 0,
          transition: "width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          flexShrink: 0,
        }}
        className="border-r border-border flex flex-col h-screen bg-sidebar"
      >
        <div style={{ width: 300 }} className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-none tracking-tight">NotesFlix</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wide">
                Knowledge Discovery
              </p>
            </div>
          </div>

          {/* Add Note toggle */}
          <div className="px-3 py-2.5 border-b border-border shrink-0">
            <button
              onClick={() => setUploadOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer"
              style={{
                background: uploadOpen ? "oklch(0.65 0.25 25 / 0.15)" : "oklch(0.18 0.01 260)",
                border: `1px solid ${uploadOpen ? "oklch(0.65 0.25 25)" : "oklch(0.22 0.01 260)"}`,
                color: uploadOpen ? "oklch(0.65 0.25 25)" : "oklch(0.60 0 0)",
              }}
            >
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Note
              </span>
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{ transform: uploadOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            {/* Collapsible upload form */}
            <div
              style={{
                maxHeight: uploadOpen ? 500 : 0,
                overflow: "hidden",
                transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <div className="pt-2.5">
                <UploadPanel
                  onNoteAdded={() => {
                    loadNotes();
                    setUploadOpen(false);
                    setActiveTab("notes");
                    setAnimKey((k) => k + 1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Notes list */}
          <div className="px-3 py-2 flex items-center gap-2 shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
              My Notes ({notes.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
            <div className="space-y-1.5">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No notes yet</p>
                </div>
              ) : (
                notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isSelected={selectedNoteId === note.id}
                    onSelect={() => {
                      setSelectedNoteId(note.id);
                      switchTab("notes");
                    }}
                    onDelete={() => deleteNote(note.id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div
          className="border-b border-border flex items-stretch shrink-0"
          style={{ background: "oklch(0.10 0.01 260)" }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            className="flex items-center px-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Tabs */}
          {(
            [
              { id: "feed", label: "Discovery Feed", icon: <Rss className="w-3.5 h-3.5" /> },
              { id: "notes", label: "Note Resources", icon: <BookOpen className="w-3.5 h-3.5" /> },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium cursor-pointer bg-transparent transition-colors"
              style={{
                color: activeTab === t.id ? "oklch(0.98 0 0)" : "oklch(0.60 0 0)",
                fontWeight: activeTab === t.id ? 600 : 400,
                marginBottom: -1,
                border: "none",
                borderBottomStyle: "solid",
                borderBottomWidth: 2,
                borderBottomColor: activeTab === t.id ? "oklch(0.65 0.25 25)" : "transparent",
              }}
            >
              {t.icon}
              {t.label}
              {t.id === "notes" && selectedNote && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full ml-1"
                  style={{
                    background: "oklch(0.65 0.25 25 / 0.15)",
                    color: "oklch(0.65 0.25 25)",
                  }}
                >
                  {selectedNote.title.split(" ").slice(0, 2).join(" ")}…
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content with animation */}
        <div
          key={animKey}
          className="flex-1 overflow-auto p-6 bg-background animate-fade-slide-in"
        >
          <ErrorBoundary>
            {activeTab === "feed" && <DiscoveryFeed />}

            {activeTab === "notes" && (
              selectedNote ? (
                <div className="max-w-4xl">
                  <div className="flex items-center gap-2.5 mb-6">
                    {selectedNote.fileType === "pdf" ? (
                      <FileType2 className="w-5 h-5 shrink-0" style={{ color: "oklch(0.65 0.18 25)" }} />
                    ) : (
                      <FileText className="w-5 h-5 shrink-0" style={{ color: "oklch(0.65 0.18 240)" }} />
                    )}
                    <h2 className="text-xl font-bold tracking-tight">{selectedNote.title}</h2>
                  </div>
                  <NoteDetail noteId={selectedNote.id} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-muted-foreground">
                  <BookOpen className="w-12 h-12 opacity-20" />
                  <p className="font-medium text-base" style={{ color: "oklch(0.60 0 0)" }}>
                    Select a note to view resources
                  </p>
                  <p className="text-sm opacity-70 max-w-sm leading-relaxed">
                    Click any note from the sidebar to see personalized recommendations powered by Claude AI.
                  </p>
                  {notes.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {notes.slice(0, 3).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            setSelectedNoteId(n.id);
                            setAnimKey((k) => k + 1);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all"
                          style={{
                            background: "oklch(0.18 0.01 260)",
                            border: "1px solid oklch(0.22 0.01 260)",
                            color: "oklch(0.60 0 0)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "oklch(0.65 0.25 25)";
                            e.currentTarget.style.color = "oklch(0.65 0.25 25)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "oklch(0.22 0.01 260)";
                            e.currentTarget.style.color = "oklch(0.60 0 0)";
                          }}
                        >
                          {n.fileType === "pdf" ? (
                            <FileType2 className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {n.title.slice(0, 28)}{n.title.length > 28 ? "…" : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
