import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Notification, NotificationType } from "@/types";

function rowToNotif(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body ?? "",
    read: !!row.read,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    relatedId: row.related_id ?? undefined,
    relatedKind: row.related_kind ?? undefined,
  };
}

export async function listMyNotifications(userId: string): Promise<Notification[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToNotif);
}

export async function pushNotification(
  n: Omit<Notification, "id" | "createdAt" | "read">
): Promise<Notification | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: n.userId,
      type: n.type,
      title: n.title,
      body: n.body,
      related_id: n.relatedId ?? null,
      related_kind: n.relatedKind ?? null,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return rowToNotif(data);
}

export async function markReadRemote(id: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("notifications").update({ read: true }).eq("id", id);
}

export async function markAllReadRemote(userId: string) {
  if (!isSupabaseConfigured) return;
  await supabase.from("notifications").update({ read: true }).eq("user_id", userId);
}

export function subscribeToNotifications(
  userId: string,
  onNew: (n: Notification) => void
) {
  if (!isSupabaseConfigured) return () => undefined;
  const channel = supabase
    .channel(`notifications-${userId}`)
    .on(
      "postgres_changes" as any,
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload: any) => {
        if (payload.new) onNew(rowToNotif(payload.new));
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
