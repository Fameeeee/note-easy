import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

// List notes with search/filter/sort/pagination
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const sort = searchParams.get("sort") || "createdAt-desc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "10", 10), 50);

  const where: Prisma.NoteWhereInput = { authorId: session.user.id };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ];
  }
  if (tag) where.tags = { some: { tag: { name: tag } } };

  const [field, direction] = sort.split("-");
  const orderBy = { [field]: direction === "asc" ? "asc" : "desc" } as Prisma.NoteOrderByWithRelationInput;

  const [total, items] = await Promise.all([
    prisma.note.count({ where }),
    prisma.note.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        author: { select: { id: true, email: true, name: true } },
        tags: { include: { tag: true } },
      },
    }),
  ]);

  return NextResponse.json({ total, page, pageSize, items });
}

// Create or update note; maintain history and tags
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const data = await req.json();
  const { id, title, content, tags = [] } = data as {
    id?: string;
    title: string;
    content: string;
    tags?: string[];
  };

  // Upsert tags
  const tagRecords = await Promise.all(
    (tags as string[]).map(async (t) =>
      prisma.tag.upsert({
        where: { name: t },
        update: {},
        create: { name: t },
      })
    )
  );

  if (id) {
    const prev = await prisma.note.findUnique({ where: { id } });
    if (!prev || prev.authorId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 });
    }

  const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // history
      await tx.noteHistory.create({
        data: { noteId: id, title: prev.title, content: prev.content },
      });

  const result = await tx.note.update({
        where: { id },
        data: {
          title,
          content,
          tags: {
            deleteMany: {},
            create: tagRecords.map((tr) => ({ tagId: tr.id })),
          },
        },
        include: { tags: { include: { tag: true } }, author: true },
      });
      return result;
    });

    return NextResponse.json(updated);
  } else {
  const created = await prisma.note.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        tags: { create: tagRecords.map((tr) => ({ tagId: tr.id })) },
      },
      include: { tags: { include: { tag: true } }, author: true },
    });
    return NextResponse.json(created, { status: 201 });
  }
}

// Delete a note
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const note = await prisma.note.findUnique({ where: { id } });
  if (!note || note.authorId !== session.user.id) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  try {
    await prisma.$transaction([
      prisma.noteTag.deleteMany({ where: { noteId: id } }),
      prisma.noteHistory.deleteMany({ where: { noteId: id } }),
      prisma.note.delete({ where: { id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to delete note";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
