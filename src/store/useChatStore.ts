import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChatMessage, ChatMessageKind, Conversation } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase";
import * as chatService from "@/services/chat";

type SendInput = {
  conversationId: string;
  senderId: string;
  kind?: ChatMessageKind;
  text?: string;
  mediaUri?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  quoteId?: string;
};

type ChatState = {
  conversations: Conversation[];
  messages: ChatMessage[];
  realtimeSubs: Record<string, () => void>;
  hydrateConversations: (filter: { customerId?: string; workshopId?: string }) => Promise<void>;
  hydrateMessages: (conversationId: string) => Promise<void>;
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: (conversationId: string) => void;
  ensureConversation: (customerId: string, workshopId: string) => Conversation;
  send: (input: SendInput) => ChatMessage;
  sendText: (conversationId: string, senderId: string, text: string) => ChatMessage;
  messagesFor: (conversationId: string) => ChatMessage[];
  markRead: (conversationId: string, role: "customer" | "pro") => void;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const conversationId = (customerId: string, workshopId: string) =>
  `cv-${customerId}-${workshopId}`;

const seedMessages: ChatMessage[] = [
  {
    id: "m1",
    conversationId: conversationId("demo-customer", "w3"),
    senderId: "w3",
    kind: "text",
    text: "Ciao Marco, abbiamo ricevuto la tua richiesta. Quando puoi passare?",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "m2",
    conversationId: conversationId("demo-customer", "w3"),
    senderId: "demo-customer",
    kind: "text",
    text: "Posso domani mattina alle 9?",
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "m3",
    conversationId: conversationId("demo-customer", "w3"),
    senderId: "w3",
    kind: "text",
    text: "Perfetto, ti aspettiamo. Porta libretto e patente.",
    createdAt: Date.now() - 1000 * 60 * 30,
  },
];

const seedConversations: Conversation[] = [
  {
    id: conversationId("demo-customer", "w3"),
    customerId: "demo-customer",
    workshopId: "w3",
    lastMessage: "Perfetto, ti aspettiamo. Porta libretto e patente.",
    lastMessageAt: Date.now() - 1000 * 60 * 30,
    unreadCount: 1,
  },
];

function previewFor(msg: ChatMessage): string {
  switch (msg.kind) {
    case "image":
      return "📷 Foto";
    case "video":
      return "🎬 Video";
    case "quote":
      return "💶 Preventivo ricevuto";
    case "system":
      return msg.text ?? "Aggiornamento";
    default:
      return msg.text ?? "";
  }
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // In Supabase live: niente seed (carichiamo dal DB).
      conversations: isSupabaseConfigured ? [] : seedConversations,
      messages: isSupabaseConfigured ? [] : seedMessages,
      realtimeSubs: {},

      hydrateConversations: async (filter) => {
        if (!isSupabaseConfigured) return;
        const list = await chatService.listMyConversations(filter);
        // sostituisco solo le conv che riguardano lo scope
        const kept = get().conversations.filter((c) =>
          filter.customerId
            ? c.customerId !== filter.customerId
            : c.workshopId !== filter.workshopId
        );
        set({ conversations: [...kept, ...list] });
      },

      hydrateMessages: async (convId) => {
        if (!isSupabaseConfigured) return;
        const remote = await chatService.listMessages(convId);
        const others = get().messages.filter((m) => m.conversationId !== convId);
        set({ messages: [...others, ...remote] });
      },

      subscribeToConversation: (convId) => {
        if (!isSupabaseConfigured) return;
        if (get().realtimeSubs[convId]) return;
        const unsub = chatService.subscribeToMessages(convId, (m) => {
          const exists = get().messages.some((x) => x.id === m.id);
          if (!exists) set({ messages: [...get().messages, m] });
        });
        set({ realtimeSubs: { ...get().realtimeSubs, [convId]: unsub } });
      },

      unsubscribeFromConversation: (convId) => {
        const u = get().realtimeSubs[convId];
        if (u) {
          u();
          const next = { ...get().realtimeSubs };
          delete next[convId];
          set({ realtimeSubs: next });
        }
      },

      ensureConversation: (customerId, workshopId) => {
        const id = conversationId(customerId, workshopId);
        const existing = get().conversations.find((c) => c.id === id);
        if (existing) {
          if (isSupabaseConfigured) {
            chatService.ensureConversationRemote(customerId, workshopId).catch(() => undefined);
          }
          return existing;
        }
        const created: Conversation = {
          id,
          customerId,
          workshopId,
          unreadCount: 0,
        };
        set({ conversations: [...get().conversations, created] });
        if (isSupabaseConfigured) {
          chatService.ensureConversationRemote(customerId, workshopId).then((remote) => {
            if (remote && remote.id !== id) {
              // Rimappa l'id locale (cv-...) all'UUID remoto e migra i messaggi
              // già accodati, così non spariscono dal thread né restano orfani.
              set({
                conversations: get().conversations.map((c) =>
                  c.id === id ? { ...remote } : c
                ),
                messages: get().messages.map((m) =>
                  m.conversationId === id ? { ...m, conversationId: remote.id } : m
                ),
              });
            } else if (remote) {
              set({
                conversations: get().conversations.map((c) =>
                  c.id === id ? { ...remote } : c
                ),
              });
            }
          }).catch(() => undefined);
        }
        return created;
      },

      send: (input) => {
        const message: ChatMessage = {
          id: generateId(),
          conversationId: input.conversationId,
          senderId: input.senderId,
          kind: input.kind ?? "text",
          text: input.text,
          mediaUri: input.mediaUri,
          mediaWidth: input.mediaWidth,
          mediaHeight: input.mediaHeight,
          quoteId: input.quoteId,
          createdAt: Date.now(),
          status: isSupabaseConfigured ? "sending" : undefined,
        };
        set({
          messages: [...get().messages, message],
          conversations: get().conversations.map((c) => {
            if (c.id !== input.conversationId) return c;
            const sentByCustomer = input.senderId === c.customerId;
            return {
              ...c,
              lastMessage: previewFor(message),
              lastMessageAt: message.createdAt,
              unreadCount: sentByCustomer ? c.unreadCount : c.unreadCount + 1,
              unreadCountPro: sentByCustomer
                ? (c.unreadCountPro ?? 0) + 1
                : c.unreadCountPro ?? 0,
            };
          }),
        });
        if (isSupabaseConfigured) {
          const markFailed = () =>
            set({
              messages: get().messages.map((m) =>
                m.id === message.id ? { ...m, status: "failed" } : m
              ),
            });
          const persistRemote = async () => {
            // I media vanno caricati su Supabase Storage prima dell'insert:
            // altrimenti `media_url` resterebbe un file:// locale, invisibile
            // sull'altro dispositivo. Carichiamo e usiamo l'URL firmato.
            let remoteMediaUri = input.mediaUri;
            if (
              input.mediaUri &&
              (message.kind === "image" || message.kind === "video")
            ) {
              const uploaded = await chatService.uploadChatMedia(
                input.conversationId,
                input.mediaUri,
                message.kind === "video"
              );
              if (!uploaded) {
                markFailed();
                return;
              }
              remoteMediaUri = uploaded;
              // Allinea anche il messaggio ottimistico locale all'URL remoto,
              // così sopravvive a un clear della cache locale.
              set({
                messages: get().messages.map((m) =>
                  m.id === message.id ? { ...m, mediaUri: uploaded } : m
                ),
              });
            }
            const remote = await chatService.sendMessageRemote({
              conversationId: input.conversationId,
              senderId: input.senderId,
              kind: message.kind,
              text: input.text,
              mediaUri: remoteMediaUri,
              mediaWidth: input.mediaWidth,
              mediaHeight: input.mediaHeight,
              quoteId: input.quoteId,
            });
            if (!remote) {
              markFailed();
              return;
            }
            // Sostituisce il messaggio ottimistico con quello persistito e
            // de-duplica un eventuale eco realtime già arrivato (stesso id DB).
            const stored: ChatMessage = { ...remote, status: "sent" };
            const withoutTemp = get().messages.filter((m) => m.id !== message.id);
            const already = withoutTemp.some((m) => m.id === stored.id);
            set({ messages: already ? withoutTemp : [...withoutTemp, stored] });
          };
          persistRemote().catch(() => markFailed());
        }
        return message;
      },

      sendText: (convId, senderId, text) =>
        get().send({ conversationId: convId, senderId, kind: "text", text }),

      messagesFor: (convId) =>
        get()
          .messages.filter((m) => m.conversationId === convId)
          .sort((a, b) => a.createdAt - b.createdAt),

      markRead: (convId, role) => {
        set({
          conversations: get().conversations.map((c) =>
            c.id === convId
              ? role === "customer"
                ? { ...c, unreadCount: 0 }
                : { ...c, unreadCountPro: 0 }
              : c
          ),
        });
        chatService.markConversationReadRemote(convId, role).catch(() => undefined);
      },
    }),
    {
      name: "nvmcars-chat",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      partialize: (state) => ({
        conversations: state.conversations,
        messages: state.messages,
      }),
      migrate: (persistedState: any, version) => {
        if (version < 2 && persistedState?.messages) {
          persistedState.messages = persistedState.messages.map((m: any) => ({
            ...m,
            kind: m.kind ?? "text",
          }));
        }
        return persistedState;
      },
    }
  )
);
