export const metadata = {
  title: "Per le officine — Iscriviti gratis",
  description: "Iscrivi la tua officina su Nvmcars. 30 giorni gratis, poi 19€/mese se entri tra le prime 100 (offerta pioniere).",
};

export default function ForWorkshopsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-5xl font-black mb-4">Per le officine</h1>
      <p className="text-xl text-textMuted mb-10">
        Più clienti, meno chiamate a vuoto. Solo richieste qualificate dalla tua zona.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-12">
        <Step n="1" title="Iscriviti gratis">
          Compila il tuo profilo in 5 minuti. Foto, servizi, prezzi.
        </Step>
        <Step n="2" title="Ricevi richieste">
          I clienti della zona ti scrivono direttamente in app. Tu scegli a chi rispondere.
        </Step>
        <Step n="3" title="Lavora e incassa">
          Pagamenti gestiti in app o di persona. Commissione 5% solo se pagano via Nvmcars.
        </Step>
      </div>

      <div className="bg-bgElevated border border-accent rounded-2xl p-6 mb-10">
        <h2 className="text-2xl font-black mb-2">🎁 Offerta pioniere</h2>
        <p className="text-textMuted">
          Le prime 100 officine: <strong className="text-text">19€/mese a vita</strong> per il piano Pro.
          30 giorni gratis di prova, annulli quando vuoi.
        </p>
      </div>

      <h2 className="text-3xl font-black mb-4">I piani</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Plan name="Free" price="0€" features={["Profilo pubblico", "5 richieste/mese", "Risposta entro 7 giorni"]} />
        <Plan
          name="Pro"
          price="29€/mese"
          highlight
          features={["Richieste illimitate", "Calendario completo", "Statistiche", "Badge verificato"]}
        />
        <Plan
          name="Premium"
          price="79€/mese"
          features={["Tutto di Pro", "Top nei risultati", "WhatsApp diretto", "Boost gratuito mensile"]}
        />
      </div>

      <div className="mt-12 text-center">
        <a
          href="https://apps.apple.com/it/app/nvmcars"
          className="inline-block bg-accent text-white px-8 py-4 rounded-2xl font-bold text-lg"
        >
          Inizia gratis ora →
        </a>
        <p className="text-sm text-textMuted mt-3">
          Hai domande? Scrivici a{" "}
          <a href="mailto:nvmcarshelp@gmail.com" className="underline">nvmcarshelp@gmail.com</a>
        </p>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bgElevated border border-border rounded-2xl p-5">
      <div className="text-accent text-3xl font-black mb-2">{n}</div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm text-textMuted">{children}</p>
    </div>
  );
}

function Plan({
  name,
  price,
  features,
  highlight,
}: {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 border ${
        highlight ? "border-accent bg-bgElevated" : "border-border bg-bgElevated/50"
      }`}
    >
      <h3 className="text-xl font-bold mb-1">{name}</h3>
      <p className="text-3xl font-black mb-4">{price}</p>
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f} className="text-sm text-textMuted flex gap-2">
            <span className="text-accent font-black">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
