import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChatMessage, ChatMessageKind, Conversation } from "@/types";

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
  ensureConversation: (customerId: string, workshopId: string) => Conversation;
  send: (input: SendInput) => ChatMessage;
  sendText: (conversationId: string, senderId: string, text: string) => ChatMessage;
  messagesFor: (conversationId: string) => ChatMessage[];
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
    text: "Ciao Marco, abbiamo ricevuto la tua richiesta. Quando puoi passare per un'occhiata?",
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
      conversations: seedConversations,
      messages: seedMessages,
      ensureConversation: (customerId, workshopId) => {
        const id = conversationId(customerId, workshopId);
        const existing = get().conversations.find((c) => c.id === id);
        if (existing) return existing;
        const created: Conversation = {
          id,
          customerId,
          workshopId,
          unreadCount: 0,
        };
        set({ conversations: [...get().conversations, created] });
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
        };
        set({
          messages: [...get().messages, message],
          conversations: get().conversations.map((c) =>
            c.id === input.conversationId
              ? {
                  ...c,
                  lastMessage: previewFor(message),
                  lastMessageAt: message.createdAt,
                }
              : c
          ),
        });
        return message;
      },
      sendText: (convId, senderId, text) =>
        get().send({ conversationId: convId, senderId, kind: "text", text }),
      messagesFor: (convId) =>
        get()
          .messages.filter((m) => m.conversationId === convId)
          .sort((a, b) => a.createdAt - b.createdAt),
    }),
    {
      name: "nvmcars-chat",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
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
