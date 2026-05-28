import { notFound } from "next/navigation";
import Link from "next/link";
import { getDiyGuideBySlug } from "@/lib/supabase";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const g = await getDiyGuideBySlug(params.slug);
  if (!g) return { title: "Guida" };
  return {
    title: g.title,
    description: g.intro,
    openGraph: { images: g.cover_image_url ? [g.cover_image_url] : undefined },
  };
}

export default async function DiyGuidePage({ params }: Props) {
  const g = await getDiyGuideBySlug(params.slug);
  if (!g) notFound();

  // Mostriamo solo intro + primi 600 caratteri di contenuto sul web.
  // Il resto (procedura completa, parts list, video) richiede l'app.
  const preview = g.content_markdown.slice(0, 600);
  const isTruncated = g.content_markdown.length > 600;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-accent text-sm">
        ← Home
      </Link>
      <div className="mt-3 flex gap-2 mb-3">
        <span className="text-xs font-black uppercase tracking-wider text-textMuted">
          {g.category}
        </span>
        <span className="text-xs font-black uppercase tracking-wider text-accent">
          · {g.difficulty}
        </span>
        <span className="text-xs font-black uppercase tracking-wider text-textMuted">
          · ⏱ {g.duration_min} min
        </span>
      </div>
      <h1 className="text-4xl font-black mb-4">{g.title}</h1>
      <p className="text-lg text-textMuted leading-relaxed mb-8">{g.intro}</p>

      <article className="prose prose-invert whitespace-pre-wrap text-base leading-relaxed">
        {preview}
      </article>

      {isTruncated || g.is_premium ? (
        <div className="mt-8 bg-bgElevated border border-accent rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-2">
            {g.is_premium ? "🔒 Guida DIY Pro" : "📱 Continua nell'app"}
          </h2>
          <p className="text-textMuted mb-4">
            {g.is_premium
              ? "Sblocca questa guida (e tutte le altre) con DIY Pro a 4,99€/mese. Lista pezzi precisa, video HD, modalità offline."
              : "Per leggere la procedura completa, vedere i pezzi consigliati e attivare la modalità offline scarica l'app."}
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="https://apps.apple.com/it/app/nvmcars"
              className="bg-accent text-white px-5 py-2.5 rounded-xl font-bold"
            >
              iPhone
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.nvmcars.app"
              className="bg-text text-bg px-5 py-2.5 rounded-xl font-bold"
            >
              Android
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
