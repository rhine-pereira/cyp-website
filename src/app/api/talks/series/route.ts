import { NextResponse } from "next/server";
import { getAllTalks } from "@/app/lib/talksStore";

export async function GET() {
  try {
    const items = await getAllTalks();
    const set = new Set<string>();
    for (const it of items) {
      const s = (it.series || "").trim();
      if (s) set.add(s);
    }
    return NextResponse.json({ series: Array.from(set).sort() });
  } catch {
    return NextResponse.json({ series: [] });
  }
}
