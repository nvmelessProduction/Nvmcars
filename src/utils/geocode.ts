export type GeocodeResult = {
  lat: number;
  lng: number;
  formattedAddress: string;
  city: string;
  province: string;
  cap: string;
};

const CITY_DB: Record<string, { lat: number; lng: number; province: string }> = {
  cerveteri: { lat: 41.9926, lng: 12.099, province: "RM" },
  ladispoli: { lat: 41.9586, lng: 12.0742, province: "RM" },
  roma: { lat: 41.9028, lng: 12.4964, province: "RM" },
  milano: { lat: 45.4642, lng: 9.19, province: "MI" },
  torino: { lat: 45.0703, lng: 7.6869, province: "TO" },
  napoli: { lat: 40.8518, lng: 14.2681, province: "NA" },
  bologna: { lat: 44.4949, lng: 11.3426, province: "BO" },
  firenze: { lat: 43.7696, lng: 11.2558, province: "FI" },
  genova: { lat: 44.4056, lng: 8.9463, province: "GE" },
  palermo: { lat: 38.1157, lng: 13.3613, province: "PA" },
  bari: { lat: 41.1171, lng: 16.8719, province: "BA" },
  catania: { lat: 37.5079, lng: 15.083, province: "CT" },
  venezia: { lat: 45.4408, lng: 12.3155, province: "VE" },
  verona: { lat: 45.4384, lng: 10.9916, province: "VR" },
  padova: { lat: 45.4064, lng: 11.8768, province: "PD" },
  brescia: { lat: 45.5416, lng: 10.2118, province: "BS" },
  parma: { lat: 44.8015, lng: 10.3279, province: "PR" },
  modena: { lat: 44.6471, lng: 10.9252, province: "MO" },
  pisa: { lat: 43.7228, lng: 10.4017, province: "PI" },
  trieste: { lat: 45.6495, lng: 13.7768, province: "TS" },
};

export async function geocodeAddress(input: {
  address: string;
  city: string;
  cap?: string;
}): Promise<GeocodeResult | null> {
  await new Promise((r) => setTimeout(r, 400));
  const key = input.city.trim().toLowerCase();
  const match = CITY_DB[key];
  if (!match) {
    return {
      lat: 41.9028 + (Math.random() - 0.5) * 0.4,
      lng: 12.4964 + (Math.random() - 0.5) * 0.4,
      formattedAddress: `${input.address}, ${input.city}`,
      city: input.city,
      province: "",
      cap: input.cap ?? "",
    };
  }
  const jitterLat = (Math.random() - 0.5) * 0.02;
  const jitterLng = (Math.random() - 0.5) * 0.02;
  return {
    lat: match.lat + jitterLat,
    lng: match.lng + jitterLng,
    formattedAddress: `${input.address}, ${input.city} (${match.province})`,
    city: input.city,
    province: match.province,
    cap: input.cap ?? "",
  };
}

export function haversineDistanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}
