export type UserRole = "customer" | "professional";

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

export type AuthUser = CustomerUser | ProfessionalUser;

export type WorkshopHours = {
  monday: { open: string; close: string; closed?: boolean };
  tuesday: { open: string; close: string; closed?: boolean };
  wednesday: { open: string; close: string; closed?: boolean };
  thursday: { open: string; close: string; closed?: boolean };
  friday: { open: string; close: string; closed?: boolean };
  saturday: { open: string; close: string; closed?: boolean };
  sunday: { open: string; close: string; closed?: boolean };
};

export type Workshop = {
  id: string;
  name: string;
  city: "Cerveteri" | "Ladispoli";
  address: string;
  phone: string;
  lat: number;
  lng: number;
  rating: number;
  reviewsCount: number;
  photo: string;
  description: string;
  hours: WorkshopHours;
  services: Partial<Record<ServiceKey, number>>;
};

export type BookingStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

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

export type Notification = {
  id: string;
  userId: string;
  type: "booking_accepted" | "booking_rejected" | "booking_completed" | "new_review" | "promo" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
  relatedId?: string;
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
};
