export type UserRole = "customer" | "professional";

export type ServiceKey =
  | "tagliando"
  | "cambioGomme"
  | "carrozzeria"
  | "batteria"
  | "freni"
  | "revisione";

export type Service = {
  key: ServiceKey;
  label: string;
  emoji: string;
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
  hours: string;
  services: Partial<Record<ServiceKey, number>>;
};

export type ServiceRequest = {
  id: string;
  customerId: string;
  workshopId: string;
  service: ServiceKey;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: number;
};
