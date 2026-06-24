import { Resend } from "resend";
import { renderReportPdf, type ReportData } from "./report.js";

export type EmailConfig = {
  apiKey: string;
  from: string;
  bcc?: string;
};

const fmtMoney = (n: number) =>
  `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(
    Math.round(n),
  )} zł`;
const fmtHours = (n: number) =>
  `${new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 1 }).format(n)} h`;

// Kramp Sp. z o.o. — public contact data (kramp.com / identyfikacja).
// TODO: verify before live use; keep in sync with CONTACT in api/report.ts.
const CONTACT = {
  company: "Kramp Sp. z o.o.",
  address: "ul. Skandynawska 1, Modła Królewska, 62-571 Stare Miasto",
  phone: "+48 63 240 67 00",
  email: "info.pl@kramp.com",
  web: "kramp.com",
};

function html(data: ReportData): string {
  const { customer, results } = data;
  // Brand CVI v1.0 colours (match src/index.css and api/report.ts).
  const RED = "#af000f";
  const BLUE = "#121f32";
  const TURQUOISE = "#65b994";
  const GREY = "#6b7280";
  const LINE = "#e5e7eb";
  const days = Math.round(results.total_hours_saved / 8);

  // Logo lives in /public so it has a stable, image-client-friendly URL
  // (data-URI images are stripped by Gmail). REPORT_SITE_URL overrides the host.
  const site = (process.env.REPORT_SITE_URL || "https://kramp-tco.vercel.app").replace(/\/$/, "");
  const logo = `${site}/kramp-logo-white.png`;

  const levers = [
    { name: "Spotkania z dostawcami", value: results.m1.revenue },
    { name: "Proces zamawiania", value: results.m2.revenue },
    { name: "Amortyzacja zapasów", value: results.m3.savings },
    { name: "Transport", value: results.m4.savings },
  ];
  const max = Math.max(1, ...levers.map((l) => Math.abs(l.value)));
  const top = levers.reduce((a, b) => (b.value > a.value ? b : a));

  // Email-safe horizontal bar: a 2-cell table, coloured cell sized by percent.
  const leverRow = (l: { name: string; value: number }, i: number) => {
    const pct = Math.max(4, Math.round((Math.abs(l.value) / max) * 100));
    const color = i < 2 ? RED : TURQUOISE;
    return `
      <tr><td style="padding:11px 0 3px">
        <table role="presentation" width="100%" style="border-collapse:collapse">
          <tr>
            <td style="font-size:13px;font-weight:bold;color:${BLUE}">${l.name}</td>
            <td align="right" style="font-size:13px;font-weight:bold;color:${BLUE}">${fmtMoney(
              Math.abs(l.value),
            )}</td>
          </tr>
        </table>
        <table role="presentation" width="100%" style="border-collapse:collapse;margin-top:6px;background:#eef1f4;border-radius:4px">
          <tr><td style="width:${pct}%;background:${color};height:7px;line-height:7px;border-radius:4px;font-size:0">&nbsp;</td><td style="font-size:0">&nbsp;</td></tr>
        </table>
      </td></tr>`;
  };

  return `
  <div style="background:#ffffff;padding:24px 0;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" style="border-collapse:collapse">
  <tr><td align="center">
  <table role="presentation" width="600" style="width:600px;max-width:600px;border-collapse:collapse;background:#ffffff;border:1px solid ${LINE};border-radius:10px;overflow:hidden">

    <!-- Header: white Kramp logo only -->
    <tr><td style="background:${RED};padding:18px 28px">
      <img src="${logo}" height="44" alt="Kramp" style="display:block;border:0" />
    </td></tr>

    <tr><td style="padding:28px 28px 0">
      <p style="font-size:15px;color:${BLUE};margin:0 0 14px">Dzień dobry${
        customer.name ? ", " + customer.name : ""
      },</p>
      <p style="font-size:14px;line-height:1.7;color:#374151;margin:0 0 12px">
        dziękujemy za skorzystanie z kalkulatora.
      </p>
      <p style="font-size:14px;line-height:1.7;color:#374151;margin:0">
        W załączniku znajdziesz pełny raport w PDF — z dokładnym wyliczeniem każdej dźwigni,
        Twoimi danymi i założeniami. Poniżej najważniejsze liczby.
      </p>
    </td></tr>

    <!-- Hero values: white, outlined (no fills) -->
    <tr><td style="padding:24px 28px 0">
      <table role="presentation" width="100%" style="border-collapse:separate;border-spacing:0">
        <tr>
          <td style="background:#ffffff;border:1.5px solid ${RED};border-radius:8px;padding:18px 18px;width:50%" valign="top">
            <div style="font-size:11px;text-transform:uppercase;color:${GREY};letter-spacing:.4px">Szacowany potencjał biznesowy</div>
            <div style="font-size:27px;font-weight:bold;color:${RED};line-height:1.1;margin:13px 0">${fmtMoney(results.net_benefit)}</div>
            <div style="font-size:11px;color:${GREY}">Potencjał z odzyskanego czasu i ograniczenia kosztów</div>
          </td>
          <td style="width:14px"></td>
          <td style="background:#ffffff;border:1.5px solid ${BLUE};border-radius:8px;padding:18px 18px;width:50%" valign="top">
            <div style="font-size:11px;text-transform:uppercase;color:${GREY};letter-spacing:.4px">Odzyskany czas / rok</div>
            <div style="font-size:27px;font-weight:bold;color:${BLUE};line-height:1.1;margin:13px 0">${fmtHours(results.total_hours_saved)}</div>
            <div style="font-size:11px;color:${GREY}">≈ ${days} dni roboczych dla zespołu</div>
          </td>
        </tr>
      </table>
    </td></tr>

    <!-- Biggest lever: white, outlined -->
    <tr><td style="padding:22px 28px 0">
      <table role="presentation" width="100%" style="border-collapse:collapse;background:#ffffff;border:1px solid ${LINE};border-radius:6px">
        <tr><td style="padding:14px 16px;border-left:3px solid ${TURQUOISE}">
          <span style="font-size:11px;text-transform:uppercase;color:${GREY}">Największy potencjał:</span>
          <strong style="font-size:14px;color:${BLUE}"> ${top.name}</strong>
          <span style="float:right;font-size:14px;font-weight:bold;color:${BLUE}">${fmtMoney(
            Math.abs(top.value),
          )}</span>
        </td></tr>
      </table>
    </td></tr>

    <!-- Composition bars -->
    <tr><td style="padding:26px 28px 0">
      <div style="font-size:11px;text-transform:uppercase;color:${GREY};font-weight:bold;letter-spacing:.4px;margin-bottom:4px">Z czego składa się korzyść</div>
      <table role="presentation" width="100%" style="border-collapse:collapse">
        ${levers.map(leverRow).join("")}
      </table>
    </td></tr>

    <!-- CTA: outlined button (no fill) -->
    <tr><td style="padding:28px 28px 6px" align="center">
      <a href="https://www.kramp.com/shop-pl/pl/bc/zostan-klientem" style="display:inline-block;background:#ffffff;border:2px solid ${RED};color:${RED};text-decoration:none;font-weight:bold;font-size:14px;padding:13px 28px;border-radius:8px">
        Porozmawiaj z doradcą Kramp
      </a>
    </td></tr>

    <tr><td style="padding:14px 28px 0">
      <p style="font-size:11px;color:#9ca3af;line-height:1.65;margin:0">
        Wartości mają charakter orientacyjny i bazują na podanych danych oraz średnich rynkowych.
        Niniejsza wiadomość nie stanowi oferty. Ostateczna korzyść zależy od zakresu konsolidacji ustalonego z Kramp.
      </p>
    </td></tr>

    <!-- Footer (as in the PDF) -->
    <tr><td style="padding:20px 28px 24px">
      <div style="border-top:1px solid ${LINE};padding-top:16px">
        <div style="font-size:12px;font-weight:bold;color:${BLUE}">${CONTACT.company}</div>
        <div style="font-size:11px;color:${GREY};line-height:1.6">
          ${CONTACT.address}<br/>
          tel. ${CONTACT.phone} · ${CONTACT.email} · ${CONTACT.web}
        </div>
      </div>
    </td></tr>

  </table>
  </td></tr>
  </table>
  </div>`;
}

/**
 * Sends the savings report to the customer with a PDF attachment.
 * Config (key/sender) is injected by the caller so this module stays free of
 * Node globals. Throws on failure — the caller decides whether that is fatal.
 */
export async function sendReportEmail(
  data: ReportData,
  config: EmailConfig,
): Promise<void> {
  const resend = new Resend(config.apiKey);
  const pdf = await renderReportPdf(data);

  const { error } = await resend.emails.send({
    from: config.from,
    to: [data.customer.email],
    ...(config.bcc ? { bcc: [config.bcc] } : {}),
    subject: "Twój raport oszczędności Kramp",
    html: html(data),
    attachments: [{ filename: "raport-kramp.pdf", content: pdf }],
  });

  if (error) throw new Error(error.message);
}
