import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractConcepts } from "@/lib/claude";
import { fetchAllResources } from "@/lib/resources";
import path from "path";

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Point to the standard fonts shipped with pdfjs-dist
  const standardFontDataUrl = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/standard_fonts/"
  ) + "/";

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    standardFontDataUrl,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  return pages.join("\n");
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  let content = "";
  const title = file.name.replace(/\.[^.]+$/, "");
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

  try {
    if (isPdf) {
      content = await extractPdfText(buffer);
    } else {
      content = buffer.toString("utf-8");
    }
  } catch (err) {
    console.error("File extraction error:", err);
    return NextResponse.json(
      { error: "Could not extract text from file" },
      { status: 400 }
    );
  }

  if (!content.trim()) {
    return NextResponse.json(
      { error: "File appears to be empty or unreadable" },
      { status: 400 }
    );
  }

  const note = await prisma.note.create({
    data: {
      title,
      content: content.slice(0, 50000),
      fileType: isPdf ? "pdf" : "text",
      concepts: "[]",
    },
  });

  extractConcepts(content, title)
    .then(async (extracted) => {
      await prisma.note.update({
        where: { id: note.id },
        data: { concepts: JSON.stringify(extracted.concepts) },
      });

      const resources = await fetchAllResources(
        extracted.searchQueries,
        extracted.concepts
      );

      await prisma.recommendation.createMany({
        data: resources.map((r) => ({
          noteId: note.id,
          type: r.type,
          title: r.title,
          description: r.description,
          url: r.url,
          thumbnail: r.thumbnail,
          source: r.source,
          relevance: r.relevance,
          concepts: JSON.stringify(r.concepts),
        })),
      });

      await prisma.feedItem.createMany({
        data: resources.slice(0, 12).map((r) => ({
          type: r.type,
          title: r.title,
          description: r.description,
          url: r.url,
          thumbnail: r.thumbnail,
          source: r.source,
          relevance: r.relevance,
          concepts: JSON.stringify(r.concepts),
          noteId: note.id,
        })),
      });
    })
    .catch(console.error);

  return NextResponse.json({ ...note, concepts: [] });
}
