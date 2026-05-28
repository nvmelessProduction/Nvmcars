export type UserRole = "customer" | "professional" | "admin";

export type ServiceKey =
  | "tagliando"
  | "cambioGomme"
  | "carrozzeria"
  | "batteria"
  | "freni"
  | "revisione"
  | "olioMotore"
  | "frizione"
  | "distribuzione"
  | "climatizzatore";

export type Service = {
  key: ServiceKey;
  label: string;
  emoji: string;
};

export type FuelType = "benzina" | "diesel" | "ibrido" | "elettrico" | "gpl" | "metano";
export type CarCategory = "city" | "compact" | "sedan" | "suv" | "premium";

export type Car = {
  id: string;
  plate: string;
  make: string;
  model: string;
  year: number;
  fuel: FuelType;
  displacement: number;
  category: CarCategory;
  nickname?: string;
  km?: number;
  lastServiceAt?: number;
  nextRevisionAt?: number;
  nextServiceKm?: number;
};

export type CustomerUser = {
  id: string;
  role: "customer";
  email: string;
  name: string;
  phone: string;
};

export type ProfessionalUser = {
  id: string;
  role: "professional";
  email: string;
  name: string;
  phone: string;
  vatNumber: string;
  workshopId: string;
  inviteCode: string;
};

export type AdminUser = {
  id: string;
  role: "admin";
  email: string;
  name: string;
};

export type AuthUser = CustomerUser | ProfessionalUser | AdminUser;

export type WorkshopHours = {
  monday: { open: string; close: string; closed?: boolean };
  tuesday: { open: string; close: string; closed?: boolean };
  wednesday: { open: string; close: string; closed?: boolean };
  thursday: { open: string; close: string; closed?: boolean };
  friday: { open: string; close: string; closed?: boolean };
  saturday: { open: string; close: string; closed?: boolean };
  sunday: { open: string; close: string; closed?: boolean };
};

export type WorkshopFiscalData = {
  legalName: string;
  vatNumber: string;
  taxCode: string;
  sdiCode?: string;
  pec?: string;
  ibanLast4?: string;
};

export type WorkshopOwner = {
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
};

export type ServicePriceOverride = {
  id: string;
  serviceKey: ServiceKey;
  brand?: string;
  model?: string;
  price: number;
};

export type WorkshopVacation = {
  id: string;
  fromDate: string;
  toDate: string;
  reason?: string;
};

export type WorkshopStatus = "draft" | "active" | "paused";

export type Workshop = {
  id: string;
  ownerId?: string;
  name: string;
  city: string;
  address: string;
  cap?: string;
  province?: string;
  phone: string;
  lat: number;
  lng: number;
  rating: number;
  reviewsCount: number;
  photo: string;
  photos?: string[];
  logo?: string;
  description: string;
  hours: WorkshopHours;
  services: Partial<Record<ServiceKey, number>>;
  priceOverrides?: ServicePriceOverride[];
  fiscalData?: WorkshopFiscalData;
  owner?: WorkshopOwner;
  vacations?: WorkshopVacation[];
  status?: WorkshopStatus;
  acceptingRequests?: boolean;
  stripeConnected?: boolean;
  inOfficinaPayment?: boolean;
  responseTimeHours?: number;
  autoReplyOutOfHours?: string;
};

export type BookingSlot = {
  id: string;
  startAt: number;
  durationMinutes: number;
};

export type BookingStatus =
  | "requested"
  | "slot_proposed"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled_by_customer"
  | "cancelled_by_pro"
  | "rejected"
  | "pending"
  | "accepted";

export type Booking = {
  id: string;
  customerId: string;
  workshopId: string;
  service: ServiceKey;
  carId: string;
  estimatedPrice: number;
  status: BookingStatus;
  message: string;
  createdAt: number;
  scheduledAt?: number;
  proposedSlots?: BookingSlot[];
  proposedAt?: number;
  proposedNote?: string;
  selectedSlotId?: string;
  startedAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  cancellationReason?: string;
  photos?: string[];
};

export type Review = {
  id: string;
  customerId: string;
  customerName: string;
  workshopId: string;
  bookingId?: string;
  rating: number;
  comment: string;
  createdAt: number;
};

export type NotificationType =
  | "booking_requested"
  | "booking_slot_proposed"
  | "booking_confirmed"
  | "booking_in_progress"
  | "booking_completed"
  | "booking_cancelled"
  | "booking_rejected"
  | "booking_reminder"
  | "booking_accepted"
  | "new_message"
  | "new_quote"
  | "quote_accepted"
  | "quote_rejected"
  | "payment_received"
  | "payment_succeeded"
  | "new_review"
  | "review_received"
  | "service_reminder"
  | "revision_due"
  | "promo"
  | "system";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  relatedId?: string;
  relatedKind?: "booking" | "quote" | "review" | "conversation" | "car";
};

export type ChatMessageKind = "text" | "image" | "video" | "quote" | "system";

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: ChatMessageKind;
  text?: string;
  mediaUri?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  quoteId?: string;
  createdAt: number;
};

export type QuoteStatus = "pending" | "accepted" | "rejected" | "paid" | "expired";

export type QuoteLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  autodocProduct?: {
    productId: string;
    brand: string;
    name: string;
    priceCents: number;
    url: string;
  };
};

export type Quote = {
  id: string;
  workshopId: string;
  customerId: string;
  conversationId: string;
  title: string;
  notes?: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  commissionFeePct: number;
  commissionFee: number;
  total: number;
  status: QuoteStatus;
  createdAt: number;
  validUntil: number;
  acceptedAt?: number;
  paidAt?: number;
  paymentRef?: string;
};

export type Conversation = {
  id: string;
  customerId: string;
  workshopId: string;
  lastMessage?: string;
  lastMessageAt?: number;
  unreadCount: number;
  unreadCountPro?: number;
};

export type ServiceLogEntry = {
  id: string;
  carId: string;
  workshopId?: string;
  workshopName?: string;
  service: ServiceKey;
  description?: string;
  cost?: number;
  km?: number;
  performedAt: number;
};

export type CarReminderKind = "revision" | "service" | "insurance" | "tax";

export type CarReminder = {
  id: string;
  carId: string;
  kind: CarReminderKind;
  dueAt: number;
  note?: string;
};
