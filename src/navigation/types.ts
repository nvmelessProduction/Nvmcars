import type { ServiceKey } from "@/types";

export type AuthStackParamList = {
  Onboarding: undefined;
  RoleSelection: undefined;
  Login: undefined;
  RegisterCustomer: undefined;
  RegisterProfessional: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  WorkshopList: { service?: ServiceKey; mapView?: boolean } | undefined;
  WorkshopDetail: { workshopId: string; service?: ServiceKey };
  BookingForm: { workshopId: string; service: ServiceKey };
  AddReview: { workshopId: string; bookingId?: string };
  Chat: { workshopId: string };
  QuoteDetail: { quoteId: string };
  Payment: { quoteId: string };
  PaymentSuccess: { quoteId: string };
  MyCar: undefined;
  AddCar: undefined;
  CarServiceLog: { carId: string };
};

export type BookingsStackParamList = {
  BookingsList: undefined;
  BookingDetail: { bookingId: string };
  AddReview: { workshopId: string; bookingId?: string };
};

export type FavoritesStackParamList = {
  FavoritesList: undefined;
  WorkshopDetail: { workshopId: string; service?: ServiceKey };
};

export type NotificationsStackParamList = {
  NotificationsList: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  MyCar: undefined;
  AddCar: undefined;
  CarServiceLog: { carId: string };
  CustomerChatsList: undefined;
  Chat: { workshopId: string };
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DataExport: undefined;
  DeleteAccount: undefined;
};

export type CustomerTabParamList = {
  HomeTab: undefined;
  BookingsTab: undefined;
  FavoritesTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

export type ProDashboardStackParamList = {
  ProDashboard: undefined;
  ProStats: undefined;
};

export type ProRequestsStackParamList = {
  ProRequests: undefined;
  ProChat: { conversationId: string };
  ProProposeSlots: { bookingId: string };
  CreateQuote: { conversationId: string };
  QuoteDetail: { quoteId: string };
};

export type ProChatStackParamList = {
  ProChatsList: undefined;
  ProChat: { conversationId: string };
  CreateQuote: { conversationId: string };
  QuoteDetail: { quoteId: string };
};

export type ProPriceListStackParamList = {
  ProPriceList: undefined;
};

export type ProCalendarStackParamList = {
  ProCalendar: undefined;
};

export type ProProfileStackParamList = {
  ProProfile: undefined;
  ProOnboarding: undefined;
  ProEditWorkshop: undefined;
  ProPriceList: undefined;
  ProNotifications: undefined;
  ProSettings: undefined;
  ProChatsList: undefined;
  ProChat: { conversationId: string };
  CreateQuote: { conversationId: string };
  QuoteDetail: { quoteId: string };
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  DataExport: undefined;
  DeleteAccount: undefined;
};

export type ProTabParamList = {
  ProDashboardTab: undefined;
  ProRequestsTab: undefined;
  ProChatTab: undefined;
  ProCalendarTab: undefined;
  ProProfileTab: undefined;
};

export type ProNotificationsStackParamList = {
  ProNotificationsList: undefined;
};

export type AdminStackParamList = {
  AdminHome: undefined;
};
