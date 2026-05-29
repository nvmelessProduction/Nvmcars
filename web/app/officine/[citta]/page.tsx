import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkshopsByCity } from "@/lib/supabase";

type Props = { params: { citta: string } };

export async function generateMetadata({ params }: Props) {
  const citta = decodeURIComponent(params.citta);
  const cityName = citta.charAt(0).toUpperCase() + citta.slice(1);
  return {
    title: `Officine a ${cityName}`,
    description: `Le migliori officine meccaniche a ${cityName}. Confronta prezzi, leggi recensioni, prenota online con Nvmcars.`,
  };
}

export default async function CityPage({ params }: Props) {
  const citta = decodeURIComponent(params.citta);
  const cityName = citta.charAt(0).toUpperCase() + citta.slice(1);
  const workshops = await getWorkshopsByCity(citta);

  if (workshops.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-3xl font-black mb-3">Officine a {cityName}</h1>
        <p className="text-textMuted">Ancora nessuna officina attiva in questa zona.</p>
        <Link href="/" className="inline-block mt-6 text-accent underline">
          ← Torna alla home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-black mb-3">Officine a {cityName}</h1>
      <p className="text-textMuted mb-8">
        {workshops.length} officine attive · ordinate per recensioni
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {workshops.map((w) => (
          <Link
            key={w.id}
            href={`/officina/${w.id}`}
            className="bg-bgElevated border border-border rounded-2xl p-5 hover:border-accent transition"
          >
            <h2 className="text-xl font-bold mb-1">{w.name}</h2>
            <p className="text-sm text-textMuted mb-2">
              {w.address}, {w.cap ?? ""} {w.city}
            </p>
            <p className="text-sm">
              ⭐ {Number(w.rating).toFixed(1)} ({w.reviews_count})
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
