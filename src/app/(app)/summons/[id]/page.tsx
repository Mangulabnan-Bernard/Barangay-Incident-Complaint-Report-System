import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/incidents";
import { PrintButton } from "@/components/print-button";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export default async function SummonsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const s = await prisma.summons.findUnique({ where: { id } });
  if (!s) notFound();

  const respondentList = [
    s.respondent1,
    s.respondent2,
    s.respondent3,
    s.respondent4,
  ].filter((r): r is string => Boolean(r && r.trim()));

  const appearanceDate = `${ordinal(s.day_of_summons)} day of ${s.month_of_summons}, ${s.year_of_summons}`;
  const servingDate = `${ordinal(s.serving_day)} day of ${s.serving_month}, ${s.serving_year}`;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Print stylesheet: at print time strip margins and show only the
          document area on letter paper. */}
      <style>{`
        @media print {
          @page { size: letter; margin: 0.75in; }
          body { background: #fff; }
          .no-print { display: none !important; }
          .summons-doc {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            color: #000 !important;
          }
        }
      `}</style>

      <div className="no-print flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Summons #{s.id}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            KP Form 7 · Issued {formatDate(s.date)}
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
          <Link
            href="/summons"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Back
          </Link>
        </div>
      </div>

      <article className="summons-doc mx-auto max-w-[8.5in] rounded-xl border border-slate-200 bg-white p-10 text-sm leading-relaxed text-slate-900 shadow-sm dark:border-slate-800 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        {/* Header */}
        <header className="text-center">
          <p className="uppercase">Republic of the Philippines</p>
          <p>Province of _______________</p>
          <p>Municipality of _______________</p>
          <p className="font-semibold">Barangay San Juan</p>
          <p className="mt-2 font-semibold uppercase">
            Office of the Lupon Tagapamayapa
          </p>
        </header>

        <div className="my-6 border-t border-slate-300" />

        {/* Case caption */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-medium">Complainant(s)</p>
            <p className="mt-6">{s.respondents}</p>
            <p className="mt-4 italic">— against —</p>
            <p className="mt-4 font-medium">Respondent(s)</p>
            <p className="mt-2">{s.respondent_name}</p>
          </div>
          <div className="text-right">
            <p>
              Barangay Case No.{" "}
              <span className="font-mono">#{s.id}</span>
            </p>
            <p className="mt-2">For: _______________</p>
          </div>
        </div>

        <h2 className="my-6 text-center text-xl font-bold uppercase tracking-wide">
          Summons
        </h2>

        {/* Body */}
        <div className="space-y-4 text-justify">
          <p>
            TO: <span className="font-semibold">{s.respondent_name}</span>
          </p>
          <p>
            You are hereby required to appear before me in person, together with
            your witnesses, on the {appearanceDate}, at the Office of the Lupon
            Tagapamayapa, Barangay San Juan, then and there to answer to a
            complaint made before me, copy of which is attached hereto, for
            mediation/conciliation of your dispute with the complainant.
          </p>
          <p>
            You are hereby warned that if you refuse or willfully fail to appear
            in obedience to this summons, you may be barred from filing any
            counterclaim arising from said complaint.
          </p>
          <p>
            FAIL NOT or else face punishment as for contempt of court.
          </p>
          <p>
            This {appearanceDate}, at Barangay San Juan.
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-12 grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Prepared by:
            </p>
            <div className="mt-10 border-t border-slate-400 pt-1">
              <p className="font-semibold">{s.prepared_by}</p>
              <p className="text-xs">Punong Barangay / Lupon Chairman</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Attested by:
            </p>
            <div className="mt-10 border-t border-slate-400 pt-1">
              <p className="font-semibold">{s.barangay_secretary}</p>
              <p className="text-xs">Barangay Secretary</p>
            </div>
          </div>
        </div>

        <div className="my-8 border-t border-slate-300" />

        {/* Officer's Return */}
        <section>
          <h3 className="text-center font-bold uppercase tracking-wide">
            Officer&apos;s Return
          </h3>
          <p className="mt-4 text-justify">
            I hereby certify that on the {servingDate}, I served a copy of the
            foregoing summons upon the respondent(s) named below, by leaving a
            copy at the respondent&apos;s
            {s.dwelling_person_name
              ? ` dwelling/residence in the presence of ${s.dwelling_person_name}`
              : " dwelling/residence"}
            {s.office_person_name
              ? ` and at the office in the presence of ${s.office_person_name}`
              : ""}
            .
          </p>

          {respondentList.length > 0 && (
            <div className="mt-4">
              <p className="font-medium">Respondent(s) served:</p>
              <ol className="ml-6 mt-1 list-decimal space-y-0.5">
                {respondentList.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ol>
            </div>
          )}

          {(s.complainee1 || s.complainee2) && (
            <div className="mt-4">
              <p className="font-medium">Service record:</p>
              <ul className="ml-6 mt-1 list-disc space-y-0.5">
                {s.complainee1 && (
                  <li>
                    {s.complainee1}
                    {s.date1 ? ` — ${formatDate(s.date1)}` : ""}
                  </li>
                )}
                {s.complainee2 && (
                  <li>
                    {s.complainee2}
                    {s.date2 ? ` — ${formatDate(s.date2)}` : ""}
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="mt-12 flex justify-end">
            <div className="w-64 text-center">
              <div className="border-t border-slate-400 pt-1">
                <p className="text-xs">Serving Officer</p>
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
