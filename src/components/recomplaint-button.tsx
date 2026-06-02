"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function RecomplaintButton({
  id,
  caseNo,
}: {
  id: number;
  caseNo: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onRecomplaint() {
    if (!window.confirm(`Re-file complaint #${caseNo}? It will reopen as Pending.`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/incidents/${id}/recomplaint`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error || "Could not reopen");
        return;
      }
      toast.success(`Complaint #${caseNo} reopened`);
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
      onClick={onRecomplaint}
      disabled={busy}
      className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      Re-file
    </button>
  );
}
