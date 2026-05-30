import type { BookingStatus, NotificationType } from "@/types";

export type StatusMeta = {
  label: string;
  color: string;
  icon: string;
};

const BOOKING_STATUS_META: Record<BookingStatus, StatusMeta> = {
  requested: { label: "In attesa di risposta", color: "#F59E0B", icon: "⏳" },
  pending: { label: "In attesa di risposta", color: "#F59E0B", icon: "⏳" },
  slot_proposed: { label: "Slot proposti", color: "#3B82F6", icon: "📅" },
  confirmed: { label: "Confermata", color: "#10B981", icon: "✅" },
  accepted: { label: "Confermata", color: "#10B981", icon: "✅" },
  in_progress: { label: "Lavorazione in corso", color: "#8B5CF6", icon: "🔧" },
  completed: { label: "Completata", color: "#059669", icon: "🏁" },
  cancelled_by_customer: { label: "Annullata dal cliente", color: "#9CA3AF", icon: "✖️" },
  cancelled_by_pro: { label: "Annullata dall'officina", color: "#9CA3AF", icon: "✖️" },
  rejected: { label: "Rifiutata", color: "#EF4444", icon: "🚫" },
};

export function statusMeta(status: BookingStatus): StatusMeta {
  return BOOKING_STATUS_META[status];
}

export function isTerminalStatus(status: BookingStatus): boolean {
  return (
    status === "completed" ||
    status === "rejected" ||
    status === "cancelled_by_customer" ||
    status === "cancelled_by_pro"
  );
}

export function canCustomerCancel(status: BookingStatus): boolean {
  return (
    status === "requested" ||
    status === "pending" ||
    status === "slot_proposed" ||
    status === "confirmed" ||
    status === "accepted"
  );
}

export function canProAct(status: BookingStatus): boolean {
  return status === "requested" || status === "pending";
}

export function canProStart(status: BookingStatus): boolean {
  return status === "confirmed" || status === "accepted";
}

export function canProComplete(status: BookingStatus): boolean {
  // Si completa solo un lavoro effettivamente avviato: confirmed → in_progress
  // → completed. Evita di saltare lo stato "in lavorazione" (e startedAt).
  return status === "in_progress";
}

export function canCustomerReview(status: BookingStatus): boolean {
  return status === "completed";
}

const NOTIFICATION_META: Record<NotificationType, { icon: string; color: string }> = {
  booking_requested: { icon: "📨", color: "#3B82F6" },
  booking_slot_proposed: { icon: "📅", color: "#3B82F6" },
  booking_confirmed: { icon: "✅", color: "#10B981" },
  booking_accepted: { icon: "✅", color: "#10B981" },
  booking_in_progress: { icon: "🔧", color: "#8B5CF6" },
  booking_completed: { icon: "🏁", color: "#059669" },
  booking_cancelled: { icon: "✖️", color: "#9CA3AF" },
  booking_rejected: { icon: "🚫", color: "#EF4444" },
  booking_reminder: { icon: "⏰", color: "#F59E0B" },
  new_message: { icon: "💬", color: "#3B82F6" },
  new_quote: { icon: "📄", color: "#3B82F6" },
  quote_accepted: { icon: "👍", color: "#10B981" },
  quote_rejected: { icon: "👎", color: "#EF4444" },
  payment_received: { icon: "💰", color: "#10B981" },
  payment_succeeded: { icon: "💳", color: "#10B981" },
  new_review: { icon: "⭐", color: "#F59E0B" },
  review_received: { icon: "⭐", color: "#F59E0B" },
  service_reminder: { icon: "🔧", color: "#F59E0B" },
  revision_due: { icon: "📋", color: "#F59E0B" },
  promo: { icon: "🎁", color: "#EC4899" },
  system: { icon: "ℹ️", color: "#6B7280" },
};

export function notificationMeta(type: NotificationType): { icon: string; color: string } {
  // Fallback difensivo: un tipo non mappato (es. drift dal backend) non deve
  // far crashare il rendering della lista notifiche.
  return NOTIFICATION_META[type] ?? { icon: "🔔", color: "#6B7280" };
}
