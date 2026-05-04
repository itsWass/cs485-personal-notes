"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface UploadPanelProps {
  onNoteAdded: () => void;
}

export function UploadPanel({ onNoteAdded }: UploadPanelProps) {
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
      toast.success("Note saved! Generating recommendations...");
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
      toast.success(`"${file.name}" uploaded! Generating recommendations...`);
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
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Add Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="text" className="flex-1">
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Text
            </TabsTrigger>
            <TabsTrigger value="file" className="flex-1">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-3">
            <Input
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary border-border"
            />
            <Textarea
              placeholder="Paste your notes or lecture content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="bg-secondary border-border min-h-32 resize-none"
            />
            <Button
              className="w-full"
              onClick={handleTextSubmit}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {loading ? "Processing..." : "Add Note"}
            </Button>
          </TabsContent>

          <TabsContent value="file">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragOver
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Processing...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Drop PDF or TXT file</p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse
                  </p>
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
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
