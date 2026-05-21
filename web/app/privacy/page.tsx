export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-invert">
      <h1 className="text-4xl font-black mb-6">Privacy Policy</h1>
      <p className="text-textMuted">
        La privacy policy ufficiale è generata e mantenuta su{" "}
        <a className="text-accent underline" href="https://www.iubenda.com/privacy-policy/PLACEHOLDER">
          iubenda
        </a>
        .
      </p>
      <p className="text-textMuted mt-4">
        Per richieste GDPR (export dati, cancellazione, rettifica): apri l&apos;app, vai su
        Profilo → Privacy, oppure scrivi a{" "}
        <a className="text-accent underline" href="mailto:privacy@nvmcars.it">privacy@nvmcars.it</a>.
      </p>
    </div>
  );
}
