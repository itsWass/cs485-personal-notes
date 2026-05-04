"use client";

import { useState, useEffect, useCallback } from "react";
import { UploadPanel } from "@/components/upload-panel";
import { NoteCard } from "@/components/note-card";
import { NoteDetail } from "@/components/note-detail";
import { DiscoveryFeed } from "@/components/discovery-feed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, BookOpen, Rss } from "lucide-react";
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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-80 shrink-0 border-r border-border flex flex-col h-screen">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-none">NotesFlix</h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Knowledge Discovery
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 border-b border-border shrink-0">
          <UploadPanel
            onNoteAdded={() => {
              loadNotes();
              setActiveTab("notes");
            }}
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <div className="px-3 py-2 flex items-center gap-2 shrink-0">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              My Notes ({notes.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            <div className="space-y-2">
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
                      setActiveTab("notes");
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
        <Tabs
          value={activeTab}
          onValueChange={(v: string) => setActiveTab(v as "notes" | "feed")}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="border-b border-border px-6 pt-4">
            <TabsList className="mb-0">
              <TabsTrigger value="feed" className="flex items-center gap-1.5">
                <Rss className="w-3.5 h-3.5" />
                Discovery Feed
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Note Resources
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="feed" className="flex-1 overflow-auto m-0 p-6 bg-background">
            <ErrorBoundary>
              <DiscoveryFeed />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="notes" className="flex-1 overflow-auto m-0 p-6 bg-background">
            <ErrorBoundary>
            {selectedNoteId ? (
              <div className="max-w-4xl">
                <h2 className="text-xl font-bold mb-6">
                  {notes.find((n) => n.id === selectedNoteId)?.title}
                </h2>
                <NoteDetail noteId={selectedNoteId} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-muted-foreground">
                <BookOpen className="w-16 h-16 opacity-20" />
                <p className="font-medium">Select a note to view resources</p>
                <p className="text-sm opacity-70 max-w-sm">
                  Click any note from the sidebar to see personalized
                  recommendations powered by Claude AI.
                </p>
              </div>
            )}
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
