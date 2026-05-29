// Helper di periodo, puro (nessuna dipendenza React Native) così è testabile
// in isolamento e riusabile da store/servizi.

/** Chiave periodo mensile (YYYY-MM) in UTC. */
export function monthKey(date: Date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
