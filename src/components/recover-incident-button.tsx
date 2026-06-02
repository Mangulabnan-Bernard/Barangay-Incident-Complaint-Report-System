"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function RecoverIncidentButton({
  id,
  caseNo,
}: {
  id: number;
  caseNo: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onRecover() {
    if (!window.confirm("Recover this incident?")) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/incidents/${id}/recover`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Recover failed");
        return;
      }
      toast.success(`Case #${caseNo} recovered`);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onRecover}
      disabled={busy}
      className="rounded-md px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
    >
      Recover
    </button>
  );
}
