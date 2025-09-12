import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const { searchParams } = new URL(req.url);
  const noteId = searchParams.get("noteId");
  if (!noteId) return NextResponse.json({ error: "noteId required" }, { status: 400 });

  const note = await prisma.note.findUnique({ where: { id: noteId } });
  if (!note || note.authorId !== session.user.id) return new NextResponse("Not Found", { status: 404 });

  const histories = await prisma.noteHistory.findMany({
    where: { noteId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(histories);
}
