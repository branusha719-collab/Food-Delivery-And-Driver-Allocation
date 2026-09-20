// All money from the backend is integer paise (1 rupee = 100 paise).
export const money = (paise) => {
  const value = (Number(paise) || 0) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2,
  }).format(value);
};
export const dateTime = (iso) =>
  iso ? new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
export const minutesSince = (iso) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));

// Local calendar day boundaries as ISO timestamps, so "to" includes the whole local day.
export const startOfDayIso = (yyyyMmDd) => (yyyyMmDd ? new Date(`${yyyyMmDd}T00:00:00`).toISOString() : undefined);
export const endOfDayIso = (yyyyMmDd) => (yyyyMmDd ? new Date(`${yyyyMmDd}T23:59:59.999`).toISOString() : undefined);

export function toCsv(rows, columns) {
  const esc = (v) => {
    let s = String(v ?? "");
    if (/^[=+\-@]/.test(s)) s = `'${s}`; // avoid spreadsheet formula injection
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = columns.map((c) => esc(c.label)).join(",");
  const body = rows.map((r) => columns.map((c) => esc(c.csv ? c.csv(r) : r[c.key])).join(","));
  return [head, ...body].join("\n");
}
export function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
