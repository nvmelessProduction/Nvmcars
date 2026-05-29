import Link from "next/link";
import { notFound } from "next/navigation";

const SERVICES: Record<string, { label: string; description: string; common: string[] }> = {
  "tagliando": {
    label: "Tagliando auto",
    description:
      "Il tagliando è la manutenzione periodica programmata. Olio motore, filtri, controlli vari. Da fare ogni 15.000-30.000 km o ogni 1-2 anni.",
    common: ["Cambio olio motore", "Filtro olio", "Filtro aria", "Filtro abitacolo", "Controllo freni", "Controllo livelli"],
  },
  "cambio-gomme": {
    label: "Cambio gomme",
    description:
      "Sostituzione pneumatici. Estivi, invernali, all-season. Inclusivo di smontaggio, montaggio, equilibratura.",
    common: ["4 pneumatici nuovi", "Equilibratura", "Smaltimento gomme vecchie", "Convergenza opzionale"],
  },
  "freni": {
    label: "Sostituzione freni",
    description:
      "Pastiglie anteriori e posteriori, dischi se necessario. Operazione di sicurezza critica, non rimandare.",
    common: ["Pastiglie anteriori", "Pastiglie posteriori", "Dischi anteriori", "Liquido freni"],
  },
  "revisione": {
    label: "Revisione auto",
    description:
      "Controllo obbligatorio per legge. Prima volta dopo 4 anni, poi ogni 2 anni. Costo fisso stabilito dal MIT.",
    common: ["Verifica emissioni", "Verifica fari e luci", "Verifica freni", "Verifica sterzo", "Verifica sospensioni"],
  },
  "carrozzeria": {
    label: "Carrozzeria",
    description:
      "Riparazione danni, riverniciatura, lavorazione lamiera. Ammaccature, graffi profondi, sostituzione paraurti.",
    common: ["Bollatura", "Riverniciatura parziale", "Sostituzione paraurti", "Levabolli"],
  },
  "diagnosi": {
    label: "Diagnosi computerizzata",
    description:
      "Lettura centralina, errori motore (spia gialla, MIL). Indispensabile per individuare guasti elettronici.",
    common: ["Lettura codici errore", "Reset spia", "Controllo sensori"],
  },
};

type Props = { params: { servizio: string } };

export async function generateMetadata({ params }: Props) {
  const s = SERVICES[params.servizio];
  if (!s) return { title: "Servizio" };
  return {
    title: `${s.label} — prezzi e officine`,
    description: `${s.description} Trova le officine vicine, confronta i prezzi, prenota online.`,
  };
}

export default function ServicePage({ params }: Props) {
  const s = SERVICES[params.servizio];
  if (!s) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-accent text-sm">
        ← Home
      </Link>
      <h1 className="text-4xl font-black mt-3 mb-4">{s.label}</h1>
      <p className="text-lg text-textMuted leading-relaxed mb-8">{s.description}</p>

      <div className="bg-bgElevated border border-border rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-bold mb-3">Cosa è incluso</h2>
        <ul className="space-y-2">
          {s.common.map((c) => (
            <li key={c} className="text-sm flex gap-2">
              <span className="text-accent font-black">✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-bgElevated border border-accent rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-2">Trova un&apos;officina vicino a te</h2>
        <p className="text-textMuted mb-4">
          Apri l&apos;app Nvmcars: cerca per servizio, confronta prezzi, leggi le recensioni.
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
    </div>
  );
}

export function generateStaticParams() {
  return Object.keys(SERVICES).map((servizio) => ({ servizio }));
}
