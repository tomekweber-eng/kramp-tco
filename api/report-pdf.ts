import type { VercelRequest, VercelResponse } from "@vercel/node";
import { renderReportPdf, type ReportData } from "./report.js";

/**
 * POST /api/report-pdf
 * Renders the 3-page savings report and returns it as application/pdf.
 * Used by the "Pobierz raport PDF" button on the summary slide. The client
 * falls back to window.print() if this route is unavailable (e.g. plain Vite
 * dev with no /api), so this stays a thin, stateless renderer.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = (req.body ?? {}) as Partial<ReportData>;
  if (!body.results || !body.inputs || !body.customer) {
    res.status(400).json({ error: "Brak danych do wygenerowania raportu." });
    return;
  }

  try {
    const data: ReportData = {
      customer: body.customer,
      inputs: body.inputs,
      results: body.results,
      date: new Date().toLocaleDateString("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };

    const pdf = await renderReportPdf(data);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="raport-kramp.pdf"');
    res.setHeader("Content-Length", pdf.length);
    res.status(200).end(pdf);
  } catch (err) {
    console.error("report-pdf render failed:", err);
    res.status(500).json({ error: "Nie udało się wygenerować raportu." });
  }
}
