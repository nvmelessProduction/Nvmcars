import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { ChatMessage, Conversation } from "@/types";

function rowToConv(row: any): Conversation {
  return {
    id: row.id,
    customerId: row.customer_id,
    workshopId: row.workshop_id,
    lastMessage: row.last_message_preview ?? undefined,
    lastMessageAt: row.last_message_at ? new Date(row.last_message_at).getTime() : undefined,
    unreadCount: Number(row.customer_unread ?? 0),
    unreadCountPro: Number(row.workshop_unread ?? 0),
  };
}

function rowToMessage(row: any): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    kind: row.kind,
    text: row.text ?? undefined,
    mediaUri: row.media_url ?? undefined,
    mediaWidth: row.media_width ?? undefined,
    mediaHeight: row.media_height ?? undefined,
    quoteId: row.quote_id ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

export async function listMyConversations(
  filter: { customerId?: string; workshopId?: string }
): Promise<Conversation[]> {
  if (!isSupabaseConfigured) return [];
  let q = supabase.from("conversations").select("*");
  if (filter.customerId) q = q.eq("customer_id", filter.customerId);
  if (filter.workshopId) q = q.eq("workshop_id", filter.workshopId);
  const { data, error } = await q.order("last_message_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToConv);
}

export async function ensureConversationRemote(
  customerId: string,
  workshopId: string
): Promise<Conversation | null> {
  if (!isSupabaseConfigured) return null;
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("customer_id", customerId)
    .eq("workshop_id", workshopId)
    .maybeSingle();
  if (existing) return rowToConv(existing);
  const { data, error } = await supabase
    .from("conversations")
    .insert({ customer_id: customerId, workshop_id: workshopId })
    .select("*")
    .single();
  if (error || !data) return null;
  return rowToConv(data);
}

export async function listMessages(conversationId: string): Promise<ChatMessage[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map(rowToMessage);
}

export async function sendMessageRemote(msg: {
  conversationId: string;
  senderId: string;
  kind: string;
  text?: string;
  mediaUri?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  quoteId?: string;
}): Promise<ChatMessage | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: msg.conversationId,
      sender_id: msg.senderId,
      kind: msg.kind,
      text: msg.text ?? null,
      media_url: msg.mediaUri ?? null,
      media_width: msg.mediaWidth ?? null,
      media_height: msg.mediaHeight ?? null,
      quote_id: msg.quoteId ?? null,
    })
    .select("*")
    .single();
  if (error || !data) return null;

  // I metadati della conversazione (anteprima, ultimo messaggio, non-letti)
  // sono mantenuti dal trigger DB `messages_after_insert` (migration 0013),
  // in modo atomico e server-authoritative.
  return rowToMessage(data);
}

export async function markConversationReadRemote(
  conversationId: string,
  role: "customer" | "pro"
) {
  if (!isSupabaseConfigured) return;
  const update = role === "customer" ? { customer_unread: 0 } : { workshop_unread: 0 };
  await supabase.from("conversations").update(update).eq("id", conversationId);
}

export function subscribeToMessages(conversationId: string, onMsg: (m: ChatMessage) => void) {
  if (!isSupabaseConfigured) return () => undefined;
  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on(
      "postgres_changes" as any,
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload: any) => {
        if (payload.new) onMsg(rowToMessage(payload.new));
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function uploadChatMedia(
  conversationId: string,
  fileUri: string,
  isVideo: boolean
): Promise<string | null> {
  if (!isSupabaseConfigured) return fileUri;
  try {
    const res = await fetch(fileUri);
    const blob = await res.blob();
    const ext = fileUri.split(".").pop() ?? (isVideo ? "mp4" : "jpg");
    const path = `${conversationId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("chat-media")
      .upload(path, blob, { contentType: blob.type || (isVideo ? "video/mp4" : "image/jpeg") });
    if (error) return null;
    // chat-media è private bucket → signed URL valido 7 giorni
    const { data: signed } = await supabase.storage
      .from("chat-media")
      .createSignedUrl(path, 60 * 60 * 24 * 7);
    return signed?.signedUrl ?? null;
  } catch {
    return null;
  }
}
