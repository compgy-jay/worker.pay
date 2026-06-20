const currencyToLocale: Record<string, string> = {
  KES: "en-KE", USD: "en-US", EUR: "de-DE", GBP: "en-GB",
  JPY: "ja-JP", CNY: "zh-CN", INR: "en-IN", NGN: "en-NG",
  ZAR: "en-ZA", TZS: "en-TZ", UGX: "en-UG", RWF: "en-RW",
  ETB: "en-ET", GHS: "en-GH", XAF: "fr-CM", XOF: "fr-CI",
  MAD: "ar-MA", EGP: "ar-EG", SAR: "ar-SA", AED: "ar-AE",
  BRL: "pt-BR", CAD: "en-CA", AUD: "en-AU", NZD: "en-NZ",
  CHF: "de-CH", SEK: "sv-SE", NOK: "nb-NO", DKK: "da-DK",
  PLN: "pl-PL", CZK: "cs-CZ", HUF: "hu-HU", TRY: "tr-TR",
  RUB: "ru-RU", MXN: "es-MX", ARS: "es-AR", CLP: "es-CL",
  COP: "es-CO", PEN: "es-PE", PHP: "en-PH", SGD: "en-SG",
  MYR: "ms-MY", THB: "th-TH", IDR: "id-ID", VND: "vi-VN",
  KRW: "ko-KR", PKR: "en-PK", BDT: "bn-BD", LKR: "si-LK",
  NPR: "ne-NP", BHD: "ar-BH", OMR: "ar-OM", QAR: "ar-QA",
  KWD: "ar-KW", JOD: "ar-JO", LBP: "ar-LB", ILS: "he-IL",
  IRR: "fa-IR", AFN: "ps-AF", MMK: "my-MM",
};

export function formatMoney(value: number, currency = "KES") {
  const safeValue = Number.isFinite(value) ? value : 0;
  const locale = currencyToLocale[currency] || "en-KE";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(safeValue);
  } catch {
    return `${currency} ${safeValue.toLocaleString(locale, { maximumFractionDigits: 2 })}`;
  }
}

export function formatDate(value: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}

export function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function mondayISO(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  return copy.toISOString().split("T")[0];
}

export function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function downloadCsv(filename: string, rows: unknown[][]) {
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function toQueryString(params: Record<string, string>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
