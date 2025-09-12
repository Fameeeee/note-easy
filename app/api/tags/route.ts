import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const tags = await prisma.tag.findMany({
    where: { notes: { some: { note: { authorId: session.user.id } } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(tags);
}
