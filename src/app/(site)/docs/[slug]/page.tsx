import { structuredAlgoliaHtmlData } from "@/lib/crawlIndex";
import { getPostBySlug } from "@/lib/markdown";
import markdownToHtml from "@/lib/markdownToHtml";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  let post: ReturnType<typeof getPostBySlug> | null = null;
  try {
    post = getPostBySlug(params.slug, ["title", "author", "content"]);
  } catch {
    // file not found – fall through to "Not Found" metadata
  }
  const siteName = process.env.SITE_NAME;
  const authorName = process.env.AUTHOR_NAME;

  if (post) {
    return {
      title: `${post.title || "Single Post Page"} | ${siteName}`,
      description: `${post.metadata?.slice(0, 136)}...`,
      author: authorName,

      robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
          index: true,
          follow: false,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } else {
    return {
      title: "Not Found",
      description: "No Documentation has been found",
    };
  }
}

export default async function DocsPost(props: Props) {
  const { slug } = await props.params;

  let post: ReturnType<typeof getPostBySlug>;
  try {
    post = getPostBySlug(slug, ["title", "author", "content"]);
  } catch {
    notFound();
  }

  const content = await markdownToHtml(post!.content || "");

  // Fire-and-forget: Algolia indexing must not block the page render
  structuredAlgoliaHtmlData({
    type: "docs",
    title: post!.title,
    htmlString: content,
    pageUrl: `${process.env.SITE_URL}/docs/${slug}`,
    imageURL: "",
  }).catch((e) => console.error("Algolia indexing error:", e));

  return <article dangerouslySetInnerHTML={{ __html: content }} />;
}
