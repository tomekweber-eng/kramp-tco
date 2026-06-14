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

function html(data: ReportData): string {
  const { customer, results } = data;
  // Brand CVI v1.0 colours (match src/index.css).
  const RED = "#af000f";
  const BLUE = "#121f32";

  const levers = [
    { name: "Spotkania z dostawcami", value: results.m1.revenue },
    { name: "Proces zamawiania", value: results.m2.revenue },
    { name: "Amortyzacja zapasów", value: results.m3.savings },
    { name: "Transport", value: results.m4.savings },
  ];
  const top = levers.reduce((a, b) => (b.value > a.value ? b : a));

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;color:${BLUE};max-width:560px;margin:0 auto">
    <div style="background:${RED};color:#fff;padding:18px 20px;border-radius:8px">
      <div style="font-size:18px;font-weight:bold">Kramp · Raport oszczędności</div>
    </div>
    <p style="font-size:15px">Dzień dobry${customer.name ? ", " + customer.name : ""},</p>
    <p style="font-size:14px;line-height:1.5">
      w załączniku znajdziesz pełny raport oszczędności w PDF. Poniżej skrót wyliczeń:
    </p>
    <table role="presentation" width="100%" style="border-collapse:separate;border-spacing:0 8px;margin:8px 0">
      <tr>
        <td style="background:${RED};color:#fff;padding:16px 18px;border-radius:8px;width:50%" valign="top">
          <div style="font-size:11px;text-transform:uppercase;opacity:.85">Roczna korzyść netto</div>
          <div style="font-size:26px;font-weight:bold">${fmtMoney(results.net_benefit)}</div>
        </td>
        <td style="width:10px"></td>
        <td style="background:${BLUE};color:#fff;padding:16px 18px;border-radius:8px;width:50%" valign="top">
          <div style="font-size:11px;text-transform:uppercase;opacity:.85">Odzyskany czas / rok</div>
          <div style="font-size:26px;font-weight:bold">${fmtHours(results.total_hours_saved)}</div>
        </td>
      </tr>
    </table>
    <div style="background:#eaf3ef;border-left:3px solid #65b994;padding:12px 16px;border-radius:4px;margin:8px 0">
      <span style="font-size:11px;text-transform:uppercase;color:#6b7280">Największy potencjał:</span>
      <strong style="font-size:14px"> ${top.name}</strong>
      <span style="float:right;font-weight:bold">${fmtMoney(Math.abs(top.value))}</span>
    </div>
    <p style="font-size:13px;font-weight:bold;text-transform:uppercase;color:#6b7280;margin-bottom:6px">
      Co wpływa na wynik
    </p>
    <ul style="font-size:14px;line-height:1.6;padding-left:18px;margin-top:0">
      <li>Ograniczenie liczby dostawców</li>
      <li>Automatyzacja zamówień</li>
      <li>Redukcja stanów magazynowych</li>
      <li>Optymalizacja dostaw</li>
    </ul>
    <a href="https://www.kramp.com/" style="display:inline-block;background:${RED};color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px;margin:12px 0">
      Porozmawiaj z doradcą Kramp
    </a>
    <p style="font-size:11px;color:#9ca3af;line-height:1.5;margin-top:20px">
      Wartości mają charakter orientacyjny i bazują na podanych danych oraz
      średnich rynkowych. Ostateczna korzyść zależy od zakresu konsolidacji
      ustalonego z Kramp.
    </p>
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
