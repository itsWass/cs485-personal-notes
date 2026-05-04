import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractConcepts } from "@/lib/claude";
import { fetchAllResources } from "@/lib/resources";

function safeParse(str: string): unknown[] {
  try {
    const val = JSON.parse(str);
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
    include: { recommendations: { orderBy: { relevance: "desc" }, take: 10 } },
  });

  return NextResponse.json(
    notes.map((n) => ({
      ...n,
      concepts: safeParse(n.concepts),
      recommendations: n.recommendations.map((r) => ({
        ...r,
        concepts: safeParse(r.concepts),
      })),
    }))
  );
}

export async function POST(req: NextRequest) {
  const { title, content } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content required" }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: { title, content, fileType: "text", concepts: "[]" },
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
