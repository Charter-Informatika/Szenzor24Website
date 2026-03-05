import fs from "fs";
import { join } from "path";
import matter from "gray-matter";

const postsDirectory = join(process.cwd(), "src/markdown/docs");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string, fields: string[] = []) {
  // Support slugs that may be URL-encoded (e.g. from route params). Decode
  // before resolving the file path so filenames with non-ASCII chars (é, ü, etc.)
  // are correctly found on disk.
  const realSlug = slug.replace(/\.mdx$/, "");
  const decodedSlug = decodeURIComponent(realSlug);
  let fullPath = join(postsDirectory, `${decodedSlug}.mdx`);
  let fileContents: string;
  try {
    fileContents = fs.readFileSync(fullPath, "utf8");
  } catch (err: any) {
    // If exact file not found, attempt case-insensitive or filename variant matching
    const files = fs.readdirSync(postsDirectory);
    const match = files.find((f) => f.toLowerCase() === `${decodedSlug}.mdx`.toLowerCase());
    if (match) {
      fullPath = join(postsDirectory, match);
      fileContents = fs.readFileSync(fullPath, "utf8");
    } else {
      // Try to find by normalizing accents / percent-encoding variants
  // Remove diacritics using a broad Unicode combining mark range which
  // avoids \p{Diacritic} (not supported on older Node versions).
  const slugNoDiacritics = decodedSlug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const match2 = files.find((f) => f.replace(/\.mdx$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === slugNoDiacritics.toLowerCase());
      if (match2) {
        fullPath = join(postsDirectory, match2);
        fileContents = fs.readFileSync(fullPath, "utf8");
      } else {
        // Re-throw original error to signal missing file
        throw err;
      }
    }
  }
  const { data, content } = matter(fileContents);

  type Items = {
    [key: string]: string;
  };

  const items: Items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      // Expose decoded slug so routing/links match the actual filename
      items[field] = decodedSlug;
    }
    if (field === "content") {
      items[field] = content;
    }

    if (typeof data[field] !== "undefined") {
      items[field] = data[field];
    }
  });

  return items;
}

export function getAllPosts(fields: string[] = []) {
  const slugs = getPostSlugs();
  const posts = slugs
    .flatMap((slug) => {
      try {
        return [getPostBySlug(slug, fields)];
      } catch {
        return [];
      }
    })
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

  return posts;
}
