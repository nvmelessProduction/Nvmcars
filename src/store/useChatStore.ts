import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ChatMessage, Conversation } from "@/types";

type ChatState = {
  conversations: Conversation[];
  messages: ChatMessage[];
  ensureConversation: (customerId: string, workshopId: string) => Conversation;
  send: (conversationId: string, senderId: string, text: string) => void;
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
    text: "Ciao Marco, abbiamo ricevuto la tua richiesta. Quando puoi passare per un'occhiata?",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "m2",
    conversationId: conversationId("demo-customer", "w3"),
    senderId: "demo-customer",
    text: "Posso domani mattina alle 9?",
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "m3",
    conversationId: conversationId("demo-customer", "w3"),
    senderId: "w3",
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
      send: (convId, senderId, text) => {
        const message: ChatMessage = {
          id: generateId(),
          conversationId: convId,
          senderId,
          text,
          createdAt: Date.now(),
        };
        set({
          messages: [...get().messages, message],
          conversations: get().conversations.map((c) =>
            c.id === convId
              ? { ...c, lastMessage: text, lastMessageAt: message.createdAt }
              : c
          ),
        });
      },
      messagesFor: (convId) =>
        get()
          .messages.filter((m) => m.conversationId === convId)
          .sort((a, b) => a.createdAt - b.createdAt),
    }),
    {
      name: "nvmcars-chat",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
