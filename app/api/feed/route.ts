import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function safeParse(str: string): unknown[] {
  try {
    const val = JSON.parse(str);
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

export async function GET() {
  const items = await prisma.feedItem.findMany({
    orderBy: [{ relevance: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return NextResponse.json(
    items.map((item) => ({
      ...item,
      concepts: safeParse(item.concepts),
    }))
  );
}
