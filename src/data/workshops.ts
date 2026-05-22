import type { Workshop, WorkshopHours } from "@/types";

const standardHours: WorkshopHours = {
  monday: { open: "08:00", close: "19:00" },
  tuesday: { open: "08:00", close: "19:00" },
  wednesday: { open: "08:00", close: "19:00" },
  thursday: { open: "08:00", close: "19:00" },
  friday: { open: "08:00", close: "19:00" },
  saturday: { open: "08:00", close: "13:00" },
  sunday: { open: "00:00", close: "00:00", closed: true },
};

const gommistaHours: WorkshopHours = {
  monday: { open: "08:30", close: "19:30" },
  tuesday: { open: "08:30", close: "19:30" },
  wednesday: { open: "08:30", close: "19:30" },
  thursday: { open: "08:30", close: "19:30" },
  friday: { open: "08:30", close: "19:30" },
  saturday: { open: "08:30", close: "19:30" },
  sunday: { open: "00:00", close: "00:00", closed: true },
};

export const WORKSHOPS: Workshop[] = [
  {
    id: "w1",
    name: "Autofficina Aurelia",
    city: "Cerveteri",
    address: "Via Aurelia 142, Cerveteri (RM)",
    phone: "+393331112201",
    lat: 41.9926,
    lng: 12.0992,
    rating: 4.7,
    reviewsCount: 124,
    photo: "https://images.unsplash.com/photo-1632823469850-2f77dd9c7c93?w=800",
    description:
      "Officina multimarca con 15 anni di esperienza. Specializzati in tagliandi, freni e diagnosi elettronica.",
    hours: standardHours,
    services: {
      tagliando: 89,
      cambioGomme: 45,
      freni: 120,
      batteria: 95,
      revisione: 79,
      olioMotore: 65,
      distribuzione: 450,
      climatizzatore: 80,
    },
  },
  {
    id: "w2",
    name: "Gommista Etrusco",
    city: "Cerveteri",
    address: "Via Settevene Palo 22, Cerveteri (RM)",
    phone: "+393331112202",
    lat: 41.9994,
    lng: 12.1023,
    rating: 4.5,
    reviewsCount: 87,
    photo: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
    description:
      "Centro pneumatici con tutte le marche più diffuse. Montaggio rapido e bilanciatura computerizzata.",
    hours: gommistaHours,
    services: {
      cambioGomme: 39,
      tagliando: 95,
      freni: 130,
    },
  },
  {
    id: "w3",
    name: "Carrozzeria Tirrenica",
    city: "Ladispoli",
    address: "Via Ancona 8, Ladispoli (RM)",
    phone: "+393331112203",
    lat: 41.9544,
    lng: 12.0738,
    rating: 4.8,
    reviewsCount: 201,
    photo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    description:
      "Carrozzeria di fiducia, ripristini grandinata e riparazioni assicurative dirette.",
    hours: {
      ...standardHours,
      monday: { open: "07:30", close: "18:30" },
      tuesday: { open: "07:30", close: "18:30" },
      wednesday: { open: "07:30", close: "18:30" },
      thursday: { open: "07:30", close: "18:30" },
      friday: { open: "07:30", close: "18:30" },
      saturday: { open: "00:00", close: "00:00", closed: true },
    },
    services: {
      carrozzeria: 250,
      tagliando: 99,
      freni: 140,
    },
  },
  {
    id: "w4",
    name: "Officina Marina",
    city: "Ladispoli",
    address: "Viale Italia 56, Ladispoli (RM)",
    phone: "+393331112204",
    lat: 41.9501,
    lng: 12.0712,
    rating: 4.4,
    reviewsCount: 63,
    photo: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800",
    description:
      "Officina di quartiere, atmosfera familiare e preventivi senza sorprese.",
    hours: standardHours,
    services: {
      tagliando: 79,
      batteria: 89,
      cambioGomme: 42,
      revisione: 75,
      freni: 115,
      olioMotore: 60,
      frizione: 380,
    },
  },
  {
    id: "w5",
    name: "Pneus Cerveteri",
    city: "Cerveteri",
    address: "Via Fontana Morella 14, Cerveteri (RM)",
    phone: "+393331112205",
    lat: 41.9871,
    lng: 12.0944,
    rating: 4.6,
    reviewsCount: 142,
    photo: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800",
    description:
      "Specialisti gomme con stoccaggio gratuito. Convenzionati con flotte aziendali.",
    hours: gommistaHours,
    services: {
      cambioGomme: 35,
      tagliando: 85,
      batteria: 90,
      climatizzatore: 75,
    },
  },
  {
    id: "w6",
    name: "Auto Service Ladispoli",
    city: "Ladispoli",
    address: "Via Flavia 41, Ladispoli (RM)",
    phone: "+393331112206",
    lat: 41.9558,
    lng: 12.0801,
    rating: 4.3,
    reviewsCount: 45,
    photo: "https://images.unsplash.com/photo-1597007029837-99c5d8e63e7f?w=800",
    description:
      "Multibrand con sala d'attesa e WiFi gratuito mentre la tua auto è in lavorazione.",
    hours: standardHours,
    services: {
      tagliando: 75,
      revisione: 70,
      freni: 110,
      carrozzeria: 230,
      climatizzatore: 70,
    },
  },
];

const DAY_KEYS: (keyof WorkshopHours)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function isOpenNow(hours: WorkshopHours, now = new Date()): boolean {
  const day = DAY_KEYS[now.getDay()];
  const slot = hours[day];
  if (!slot || slot.closed) return false;
  const [oH, oM] = slot.open.split(":").map(Number);
  const [cH, cM] = slot.close.split(":").map(Number);
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= oH * 60 + oM && minutes <= cH * 60 + cM;
}

export function formatWeeklyHours(hours: WorkshopHours): string {
  const days: { key: keyof WorkshopHours; label: string }[] = [
    { key: "monday", label: "Lun" },
    { key: "tuesday", label: "Mar" },
    { key: "wednesday", label: "Mer" },
    { key: "thursday", label: "Gio" },
    { key: "friday", label: "Ven" },
    { key: "saturday", label: "Sab" },
    { key: "sunday", label: "Dom" },
  ];
  return days
    .map(({ key, label }) => {
      const slot = hours[key];
      if (!slot || slot.closed) return `${label}: chiuso`;
      return `${label}: ${slot.open}–${slot.close}`;
    })
    .join(" · ");
}
