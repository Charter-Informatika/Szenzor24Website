import { getPostBySlug } from '@/lib/markdown';
import markdownToHtml from '@/lib/markdownToHtml';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug') || 'Szenzor24';

  try {
    const post = getPostBySlug(slug, ['title', 'content']);
    if (!post) {
      return new Response(`<pre>Post not found for slug: ${slug}</pre>`, { headers: { 'Content-Type': 'text/html' } });
    }

    const html = await markdownToHtml(post.content || '');
    const page = `<!doctype html><html><head><meta charset="utf-8"><title>MDX Debug: ${slug}</title></head><body style="font-family:Inter,Arial;margin:24px"><h1>${post.title || slug}</h1><section>${html}</section></body></html>`;

    return new Response(page, { headers: { 'Content-Type': 'text/html' } });
  } catch (e: any) {
    return new Response(`<pre>Error processing slug ${slug}: ${e?.message || String(e)}</pre>`, { headers: { 'Content-Type': 'text/html' } });
  }
}
