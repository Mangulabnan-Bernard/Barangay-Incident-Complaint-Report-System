import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { setSession } from "@/lib/current-user";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const result = await authenticate(
    parsed.data.identifier,
    parsed.data.password,
  );
  if (!result.ok) {
    const dev = process.env.NODE_ENV !== "production";
    const error = dev
      ? result.reason === "no_user"
        ? `No account found for "${parsed.data.identifier}". (Check the email/username — autofill may have changed it.)`
        : "Account found, but the password is wrong."
      : "Incorrect username or password.";
    return NextResponse.json({ ok: false, error }, { status: 401 });
  }

  await setSession(result.session);
  return NextResponse.json({
    ok: true,
    user: { name: result.session.name, role: result.session.role },
  });
}
