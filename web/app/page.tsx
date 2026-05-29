export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-black mb-6">
          La tua officina,<br />
          a portata di <span className="text-accent">tap</span>.
        </h1>
        <p className="text-xl text-textMuted max-w-2xl mx-auto mb-10">
          Cerca officine vicino a te, ricevi preventivi trasparenti, paghi in app o di persona.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="https://apps.apple.com/it/app/nvmcars"
            className="bg-text text-bg px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition"
          >
            📱 Scarica per iPhone
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.nvmcars.app"
            className="bg-accent text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition"
          >
            🤖 Scarica per Android
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-3 gap-6">
        <Feature emoji="🔍" title="Cerca per servizio">
          Cambio gomme, tagliando, freni, revisione. Trovi l&apos;officina giusta in 10 secondi.
        </Feature>
        <Feature emoji="💬" title="Chiedi un preventivo">
          Scrivi al meccanico in chat. Foto della tua auto, dettagli, preventivo trasparente.
        </Feature>
        <Feature emoji="✅" title="Paghi in app o di persona">
          Commissione bassa, niente sorprese. Garanzia sul lavoro fatto.
        </Feature>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-3xl font-black mb-4">Hai un&apos;officina?</h2>
        <p className="text-textMuted mb-6">Iscriviti gratis e ricevi richieste dai clienti della tua zona.</p>
        <a
          href="/per-le-officine"
          className="inline-block bg-accent text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition"
        >
          Scopri come funziona →
        </a>
      </section>
    </div>
  );
}

function Feature({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bgElevated border border-border rounded-2xl p-6">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-textMuted text-sm">{children}</p>
    </div>
  );
}
