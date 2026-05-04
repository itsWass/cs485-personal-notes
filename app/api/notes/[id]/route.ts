import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function safeParse(str: string): unknown[] {
  try {
    const val = JSON.parse(str);
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.note.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const note = await prisma.note.findUnique({
    where: { id },
    include: {
      recommendations: { orderBy: { relevance: "desc" } },
    },
  });

  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...note,
    concepts: safeParse(note.concepts),
    recommendations: note.recommendations.map((r) => ({
      ...r,
      concepts: safeParse(r.concepts),
    })),
  });
}
