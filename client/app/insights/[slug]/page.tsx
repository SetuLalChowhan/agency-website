import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getArticle as getCmsArticle, getArticles } from "@/lib/cms";
import { RevealImage } from "@/components/ui/RevealImage";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCTA } from "@/components/home/FinalCTA";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { data } = await getArticles();
  return data.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getCmsArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.dateISO,
      images: [{ url: article.art, width: 1600, height: 1000, alt: article.title }],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getCmsArticle(slug);
  if (!article) notFound();

  const { data: articles } = await getArticles();
  const related = articles.filter((a) => a.slug !== slug).slice(0, 2);

  return (
    <article>
      <header className="px-5 pt-32 md:px-10 md:pt-44">
        <div className="mx-auto max-w-[1920px]">
          <Link
            href="/insights"
            data-cursor="link"
            className="group inline-flex items-center gap-2 meta-label text-smoke transition-colors duration-300 hover:text-paper"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            The journal
          </Link>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="meta-label text-acid">{article.category}</span>
            <span className="meta-label text-smoke">{article.date}</span>
            <span className="meta-label text-smoke">{article.readingTime}</span>
          </div>
          <h1 className="display mt-4 max-w-5xl text-[clamp(2.2rem,6vw,5.5rem)] leading-[1.02] text-paper">
            {article.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-smoke md:text-lg">
            {article.excerpt}
          </p>
        </div>
      </header>

      <div className="mt-12 px-5 md:mt-16 md:px-10">
        <RevealImage
          src={article.art}
          alt={article.title}
          className="aspect-[21/9] w-full"
          sizes="100vw"
          priority
        />
      </div>

      <div className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        {article.body.map((section, i) => (
          <Reveal key={i}>
            <section className="border-t hairline-d py-10 first:border-t-0 first:pt-0">
              <h2 className="display text-xl text-paper md:text-2xl">{section.heading}</h2>
              {section.paragraphs.map((p, j) => (
                <p key={j} className="mt-5 text-[16px] leading-[1.75] text-paper/80">
                  {p}
                </p>
              ))}
            </section>
          </Reveal>
        ))}

        {/* Pull quote */}
        <Reveal>
          <blockquote className="mt-14 border-l-2 border-acid pl-6">
            <p className="font-accent text-2xl italic leading-snug text-paper md:text-3xl">
              “{article.pullQuote}”
            </p>
            <footer className="meta-label mt-5 text-smoke">— The KERN® editorial desk</footer>
          </blockquote>
        </Reveal>

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t hairline-d pt-8">
          <span className="meta-label text-stone">
            {article.category} — {article.date}
          </span>
          <a href="#" data-cursor="link" className="link-sweep meta-label text-paper">
            Share this essay
          </a>
        </div>
      </div>

      {/* Related */}
      <section className="border-t hairline-d px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1920px]">
          <p className="meta-label text-smoke">Keep reading</p>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            {related.map((a) => (
              <Link
                key={a.slug}
                href={`/insights/${a.slug}`}
                data-cursor="view"
                className="group border-t hairline-d pt-6"
              >
                <div className="flex items-baseline justify-between gap-6">
                  <h2 className="display text-2xl text-paper transition-colors duration-500 group-hover:text-acid md:text-3xl">
                    {a.title}
                  </h2>
                  <ArrowUpRight className="h-5 w-5 flex-none text-smoke transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-acid" />
                </div>
                <p className="meta-label mt-3 text-smoke">
                  {a.category} — {a.readingTime}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </article>
  );
}
