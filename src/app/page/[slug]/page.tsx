import { notFound } from "next/navigation";

interface PageData {
  title: string;
  content: string;
}

async function getPageData(slug: string): Promise<PageData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/pages/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageData(slug);

  if (!page) {
    notFound();
  }

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
          {page.title}
        </h1>
        <div
          className="prose prose-gray max-w-none
            prose-headings:text-foreground
            prose-p:text-muted prose-p:leading-relaxed
            prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-li:text-muted"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </section>
  );
}
