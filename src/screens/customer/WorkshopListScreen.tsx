import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { ScreenContainer } from "@/components/ScreenContainer";
import { WorkshopCard } from "@/components/WorkshopCard";
import { EmptyState } from "@/components/EmptyState";
import { WORKSHOPS } from "@/data/workshops";
import { getServiceLabel } from "@/data/services";
import { haversineKm } from "@/utils/distance";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useActiveCar } from "@/store/useCarStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { useWorkshopStore } from "@/store/useWorkshopStore";
import { isSupabaseConfigured } from "@/lib/supabase";
import { resolvePrice } from "@/utils/pricing";
import { useActiveBoosts, makeBoostLookup } from "@/hooks/useActiveBoosts";
import type { Workshop } from "@/types";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "WorkshopList">;
type Route = RouteProp<HomeStackParamList, "WorkshopList">;

type SortKey = "distance" | "price" | "rating";
type CityFilter = "all" | "Cerveteri" | "Ladispoli";

export function WorkshopListScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const service = route.params?.service;
  const colors = useColors();
  const t = useT();
  const car = useActiveCar();
  const { location, loading } = useUserLocation();
  const [sort, setSort] = useState<SortKey>("distance");
  const [city, setCity] = useState<CityFilter>("all");
  const [view, setView] = useState<"list" | "map">("list");

  const ownWorkshops = useWorkshopStore((s) => s.ownWorkshops);
  const remoteWorkshops = useWorkshopStore((s) => s.remoteWorkshops);
  const hydrateAll = useWorkshopStore((s) => s.hydrateAll);
  const hydrating = useWorkshopStore((s) => s.hydrating);
  const { boosts } = useActiveBoosts({ serviceKey: service });
  const isBoosted = useMemo(() => makeBoostLookup(boosts), [boosts]);
  useEffect(() => {
    hydrateAll();
  }, [hydrateAll]);
  const onRefresh = useCallback(() => {
    hydrateAll();
  }, [hydrateAll]);

  const items = useMemo(() => {
    // In Supabase live: usa SOLO remoteWorkshops + own. Niente mock.
    // In mock: usa WORKSHOPS hardcoded + own.
    const base: Workshop[] = isSupabaseConfigured
      ? remoteWorkshops.map((w) => ownWorkshops[w.id] ?? w)
      : WORKSHOPS.map((w) => ownWorkshops[w.id] ?? w);
    const source = [...base];
    for (const own of Object.values(ownWorkshops)) {
      if (!source.some((m) => m.id === own.id)) source.push(own);
    }
    const filtered = source.filter((w) => {
      if (w.status === "draft") return false;
      if (service && w.services[service] === undefined) return false;
      if (city !== "all" && w.city !== city) return false;
      return true;
    });

    const withMeta = filtered.map((w) => {
      const res = service ? resolvePrice(w, service, car) : null;
      const price = res
        ? res.finalPrice
        : Object.values(w.services).length > 0
          ? Math.min(...Object.values(w.services))
          : Infinity;
      return {
        workshop: w,
        distanceKm: location ? haversineKm(location.lat, location.lng, w.lat, w.lng) : 0,
        price,
      };
    });

    return withMeta.sort((a, b) => {
      // Boost wins always: officine boostate vanno in cima a parità di filtro.
      const aBoost = isBoosted(a.workshop.id) ? 1 : 0;
      const bBoost = isBoosted(b.workshop.id) ? 1 : 0;
      if (aBoost !== bBoost) return bBoost - aBoost;
      if (sort === "distance") return a.distanceKm - b.distanceKm;
      if (sort === "price") return a.price - b.price;
      return b.workshop.rating - a.workshop.rating;
    });
  }, [service, location, sort, city, car, ownWorkshops, remoteWorkshops, isBoosted]);

  if (loading) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} />
          <Text style={{ color: colors.textMuted, marginTop: 12 }}>{t.common.loading}</Text>
        </View>
      </ScreenContainer>
    );
  }

  const mapRegion = location
    ? { latitude: location.lat, longitude: location.lng, latitudeDelta: 0.08, longitudeDelta: 0.08 }
    : { latitude: 41.97, longitude: 12.09, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  return (
    <ScreenContainer>
      <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 10 }}>
        {service ? (
          <View
            style={{
              backgroundColor: colors.accentSoft,
              borderWidth: 1,
              borderColor: colors.accent,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.textMuted }}>
              Servizio cercato:{" "}
              <Text style={{ fontWeight: "800", color: colors.text }}>
                {getServiceLabel(service)}
              </Text>
            </Text>
            {car ? (
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                Prezzi adattati per la tua {car.make} {car.model}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.bgElevated,
            borderRadius: 12,
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {(["list", "map"] as const).map((v) => (
            <Pressable
              key={v}
              onPress={() => setView(v)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: view === v ? colors.accent : "transparent",
                alignItems: "center",
              }}
            >
              <Text style={{ color: view === v ? "#FFF" : colors.text, fontWeight: "700", fontSize: 13 }}>
                {v === "list" ? `📋 ${t.workshop.list}` : `🗺️ ${t.workshop.map}`}
              </Text>
            </Pressable>
          ))}
        </View>

        {view === "list" ? (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <SortChip label={`📍 ${t.workshop.distance}`} active={sort === "distance"} onPress={() => setSort("distance")} />
              <SortChip label={`💶 ${t.workshop.price}`} active={sort === "price"} onPress={() => setSort("price")} />
              <SortChip label={`⭐ ${t.workshop.rating}`} active={sort === "rating"} onPress={() => setSort("rating")} />
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <SortChip label="Tutte" active={city === "all"} onPress={() => setCity("all")} />
              <SortChip label="Cerveteri" active={city === "Cerveteri"} onPress={() => setCity("Cerveteri")} />
              <SortChip label="Ladispoli" active={city === "Ladispoli"} onPress={() => setCity("Ladispoli")} />
            </View>
          </View>
        ) : null}
      </View>

      {view === "list" ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.workshop.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={hydrating}
              onRefresh={onRefresh}
              tintColor={colors.accent}
            />
          }
          renderItem={({ item, index }) => (
            <WorkshopCard
              workshop={item.workshop}
              distanceKm={item.distanceKm}
              highlightedService={service}
              priceOverride={item.price === Infinity ? undefined : item.price}
              index={index}
              boosted={isBoosted(item.workshop.id)}
              onPress={() =>
                navigation.navigate("WorkshopDetail", {
                  workshopId: item.workshop.id,
                  service,
                })
              }
            />
          )}
          ListEmptyComponent={<EmptyState emoji="🔍" title={t.common.empty} />}
        />
      ) : (
        <View style={{ flex: 1, marginTop: 12 }}>
          <MapView
            provider={PROVIDER_DEFAULT}
            style={{ flex: 1 }}
            initialRegion={mapRegion}
            showsUserLocation
          >
            {items
              .filter(
                ({ workshop }) =>
                  Number.isFinite(workshop.lat) &&
                  Number.isFinite(workshop.lng) &&
                  (workshop.lat !== 0 || workshop.lng !== 0)
              )
              .map(({ workshop, price }) => (
              <Marker
                key={workshop.id}
                coordinate={{ latitude: workshop.lat, longitude: workshop.lng }}
                title={workshop.name}
                description={`€${price} · ⭐ ${workshop.rating.toFixed(1)}`}
                onCalloutPress={() =>
                  navigation.navigate("WorkshopDetail", {
                    workshopId: workshop.id,
                    service,
                  })
                }
              />
            ))}
          </MapView>

        </View>
      )}
    </ScreenContainer>
  );
}

function SortChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? colors.text : colors.border,
        backgroundColor: active ? colors.text : colors.bgElevated,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: active ? colors.bg : colors.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
