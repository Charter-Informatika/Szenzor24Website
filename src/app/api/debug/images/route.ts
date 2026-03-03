import fs from "fs";
import { join } from "path";

export async function GET() {
  const dir = join(process.cwd(), "public", "images", "docs");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch (e: any) {
    const msg = `Error reading directory ${dir}: ${e?.message || String(e)}`;
    return new Response(`<pre>${msg}</pre>`, { headers: { "Content-Type": "text/html" } });
  }

  const imgs = files
    .map(
      (f) =>
        `<div style="margin:12px"><div style="font-family:monospace">${f}</div><img src="/images/docs/${encodeURIComponent(
          f,
        )}" alt="${f}" style="max-width:600px;height:auto;border:1px solid #ddd;padding:6px;background:#fff"/></div>`,
    )
    .join("\n");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Image debug</title></head><body style="font-family:Inter,system-ui,Arial,Helvetica,sans-serif;margin:24px"><h1>Images in /public/images/docs</h1>${imgs}</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html" } });
}
