import { notFound } from "next/navigation";
import Link from "next/link";
import { getWorkshopById } from "@/lib/supabase";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  const w = await getWorkshopById(params.id);
  if (!w) return { title: "Officina" };
  return {
    title: `${w.name} — ${w.city}`,
    description: w.description ?? `${w.name} a ${w.city}. ⭐ ${Number(w.rating).toFixed(1)} (${w.reviews_count} recensioni).`,
    openGraph: { images: w.photo_url ? [w.photo_url] : undefined },
  };
}

export default async function WorkshopPage({ params }: Props) {
  const w = await getWorkshopById(params.id);
  if (!w) notFound();

  const deepLink = `nvmcars://workshop/${w.id}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href={`/officine/${encodeURIComponent(w.city.toLowerCase())}`} className="text-accent text-sm">
        ← Tutte le officine di {w.city}
      </Link>
      <h1 className="text-4xl font-black mt-3 mb-2">{w.name}</h1>
      <p className="text-textMuted">{w.address}, {w.cap ?? ""} {w.city} {w.province ? `(${w.province})` : ""}</p>
      <p className="mt-2 text-lg">⭐ {Number(w.rating).toFixed(1)} · {w.reviews_count} recensioni</p>

      {w.description ? (
        <p className="mt-6 text-base leading-relaxed text-text">{w.description}</p>
      ) : null}

      <div className="mt-8 bg-bgElevated border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-2">Prenota in 1 minuto</h2>
        <p className="text-textMuted text-sm mb-4">
          Scarica l&apos;app Nvmcars per chattare con l&apos;officina, ricevere preventivi
          trasparenti e prenotare un appuntamento.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={deepLink}
            className="bg-accent text-white px-5 py-2.5 rounded-xl font-bold"
          >
            Apri nell&apos;app →
          </a>
          <a
            href="https://apps.apple.com/it/app/nvmcars"
            className="bg-text text-bg px-5 py-2.5 rounded-xl font-bold"
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
    </div>
  );
}
