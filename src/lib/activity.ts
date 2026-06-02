import { prisma } from "./prisma";

// Central audit-log helper. Every create/update/delete should call this.
// Non-fatal: a logging failure must never break the underlying action.
export async function logActivity(message: string): Promise<void> {
  try {
    await prisma.activity_logs.create({
      data: { timestamp: new Date(), message },
    });
  } catch {
    // swallow — logging is best-effort
  }
}
