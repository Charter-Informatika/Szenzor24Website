import Link from "next/link";
import fs from "fs";
import path from "path";
import { getAllPosts } from "@/lib/markdown";
import { redirect } from "next/navigation";

// This is a server component so we can read the public/docs folder at build/runtime.
function readDocs(): string[] {
  try {
    const docsDir = path.join(process.cwd(), "public", "docs");
    if (!fs.existsSync(docsDir)) return [];
    const files = fs.readdirSync(docsDir);
    // filter to common docx/doc formats
    return files.filter((f) => /\.(docx?|pdf|txt)$/i.test(f));
  } catch (err) {
    return [];
  }
}

const docsList = readDocs();

try {
  const posts = getAllPosts(["slug"]);
  if (posts && posts.length > 0) {
    const defaultSlug = posts.find((p) => p.slug === "Szenzor24")
      ? "Szenzor24"
      : posts[0].slug;
    redirect(`/docs/${defaultSlug}`);
  }
} catch (err) {
  // ignore if markdown helper fails or no posts
}

export const metadata = {
  title: "Dokumentáció - Szenzor24",
  description: "",
};

export default function DocsIndex() {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4"></h1>

      <p className="mb-4">
        
      </p>

      <div className="space-y-4">
        {docsList.length === 0 ? (
          <div></div>
        ) : (
          docsList.map((f) => (
            <div key={f}>
              <div>
                <div className="font-medium">{f}</div>
                <div className="text-sm text-slate-500">Hely: <code>/docs/{f}</code></div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

