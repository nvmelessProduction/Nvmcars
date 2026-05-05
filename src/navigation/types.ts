import type { ServiceKey } from "@/types";

export type AuthStackParamList = {
  Onboarding: undefined;
  RoleSelection: undefined;
  Login: undefined;
  RegisterCustomer: undefined;
  RegisterProfessional: undefined;
};

export type CustomerStackParamList = {
  Home: undefined;
  WorkshopList: { service?: ServiceKey } | undefined;
  WorkshopDetail: { workshopId: string; service?: ServiceKey };
  CustomerProfile: undefined;
};

export type ProStackParamList = {
  ProDashboard: undefined;
  ProRequests: undefined;
  ProProfile: undefined;
};
