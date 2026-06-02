import { NextResponse } from "next/server";
import { getSession } from "@/lib/current-user";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    user: {
      name: session.name,
      role: session.role,
      username: session.username,
      kind: session.kind,
    },
  });
}
