import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type DiyGuide = {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: "facile" | "medio" | "difficile";
  durationMin: number;
  coverImageUrl?: string;
  intro: string;
  contentMarkdown: string;
  videoUrl?: string;
  partsList: { name: string; autodocQuery: string; qty: number }[];
  toolsList: { name: string; avgPriceEur?: number }[];
  warnings?: string;
  isPremium: boolean;
  viewCount: number;
  helpfulCount: number;
};

type DiyState = {
  guides: DiyGuide[];
  loading: boolean;
  hydrate: () => Promise<void>;
  byCategory: (category: string) => DiyGuide[];
  bySlug: (slug: string) => DiyGuide | undefined;
};

export const useDiyStore = create<DiyState>()(
  persist(
    (set, get) => ({
      guides: [],
      loading: false,

      hydrate: async () => {
        if (!isSupabaseConfigured) return;
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from("diy_guides")
            .select("*")
            .eq("published", true)
            .order("created_at", { ascending: false });
          if (error || !data) return;
          const guides: DiyGuide[] = data.map((r: any) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            category: r.category,
            difficulty: r.difficulty,
            durationMin: r.duration_min,
            coverImageUrl: r.cover_image_url,
            intro: r.intro,
            contentMarkdown: r.content_markdown,
            videoUrl: r.video_url,
            partsList: r.parts_list ?? [],
            toolsList: r.tools_list ?? [],
            warnings: r.warnings,
            isPremium: r.is_premium,
            viewCount: r.view_count ?? 0,
            helpfulCount: r.helpful_count ?? 0,
          }));
          set({ guides });
        } finally {
          set({ loading: false });
        }
      },

      byCategory: (category) => get().guides.filter((g) => g.category === category),
      bySlug: (slug) => get().guides.find((g) => g.slug === slug),
    }),
    {
      name: "nvmcars-diy",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const DIY_CATEGORIES = [
  { key: "motore", label: "Motore", icon: "⚙️" },
  { key: "freni", label: "Freni", icon: "🛑" },
  { key: "sospensioni", label: "Sospensioni", icon: "🔩" },
  { key: "elettrico", label: "Elettrico", icon: "🔌" },
  { key: "carrozzeria", label: "Carrozzeria", icon: "🪟" },
  { key: "filtri", label: "Filtri", icon: "🧽" },
  { key: "liquidi", label: "Liquidi", icon: "💧" },
  { key: "pneumatici", label: "Pneumatici", icon: "🛞" },
  { key: "altro", label: "Altro", icon: "🔧" },
] as const;
