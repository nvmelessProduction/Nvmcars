export const metadata = { title: "Termini di Servizio" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-black mb-6">Termini di Servizio</h1>
      <p className="text-textMuted">
        I termini ufficiali sono generati e mantenuti su{" "}
        <a className="text-accent underline" href="https://www.iubenda.com/termini-e-condizioni/PLACEHOLDER">
          iubenda
        </a>
        .
      </p>
    </div>
  );
}
