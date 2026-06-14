import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import type { ReportData } from "./report.js";

/**
 * POST /api/lead
 * Stores a lead (customer + computed results + RODO consent) in Neon Postgres.
 * Email/PDF delivery is intentionally out of scope for now — see project plan.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // The Neon/Vercel integration may expose the connection string under a few
  // different names depending on how it was provisioned.
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!databaseUrl) {
    res.status(503).json({ error: "DATABASE_URL not configured" });
    return;
  }

  const body = (req.body ?? {}) as {
    company?: string;
    email?: string;
    postalCode?: string;
    consentRodo?: boolean;
    consentMarketing?: boolean;
    inputs?: unknown;
    results?: ReportData["results"] | null;
  };

  const company = body.company?.trim();
  const email = body.email?.trim();
  const postalCode = body.postalCode?.trim();

  if (!company || !email || !postalCode) {
    res.status(400).json({ error: "Brak wymaganych pól." });
    return;
  }
  if (!body.consentRodo) {
    res.status(400).json({ error: "Wymagana zgoda na przetwarzanie danych." });
    return;
  }

  try {
    const sql = neon(databaseUrl);

    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id            BIGSERIAL PRIMARY KEY,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
        company       TEXT NOT NULL,
        email         TEXT NOT NULL,
        postal_code   TEXT NOT NULL,
        inputs        JSONB,
        results       JSONB,
        net_benefit   NUMERIC,
        consent_rodo      BOOLEAN NOT NULL DEFAULT false,
        consent_marketing BOOLEAN NOT NULL DEFAULT false,
        ip            TEXT,
        user_agent    TEXT
      )
    `;

    const fwd = req.headers["x-forwarded-for"];
    const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim() ?? null;
    const userAgent = req.headers["user-agent"] ?? null;
    const netBenefit =
      typeof body.results?.net_benefit === "number"
        ? body.results.net_benefit
        : null;

    await sql`
      INSERT INTO leads
        (company, email, postal_code, inputs, results, net_benefit,
         consent_rodo, consent_marketing, ip, user_agent)
      VALUES
        (${company}, ${email}, ${postalCode},
         ${JSON.stringify(body.inputs ?? null)}::jsonb,
         ${JSON.stringify(body.results ?? null)}::jsonb,
         ${netBenefit}, ${!!body.consentRodo}, ${!!body.consentMarketing},
         ${ip}, ${userAgent})
    `;

    // Dormant until RESEND_API_KEY is configured. Email failure must never
    // break lead capture, so it is best-effort and logged only.
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && body.results) {
      try {
        const data: ReportData = {
          customer: { name: company, email, postalCode },
          results: body.results,
          date: new Date().toLocaleDateString("pl-PL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        };
        // Dynamic import keeps @react-pdf/renderer out of the cold-start path
        // while the mailer is dormant.
        const { sendReportEmail } = await import("./email.js");
        await sendReportEmail(data, {
          apiKey: resendKey,
          from: process.env.REPORT_FROM || "Kramp <onboarding@resend.dev>",
          bcc: process.env.REPORT_BCC || undefined,
        });
      } catch (mailErr) {
        console.error("report email failed (lead still saved):", mailErr);
      }
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("lead insert failed:", err);
    res.status(500).json({ error: "Nie udało się zapisać leada." });
  }
}
