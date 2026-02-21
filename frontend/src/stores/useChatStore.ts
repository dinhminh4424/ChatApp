import { chatService } from "@/services/chatServive";
import type { ChatState } from "@/types/store";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      conversationloading: false,
      messageLoading: false,

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          conversationloading: false,
          messageLoading: false,
        });
      },
      fetchConversations: async () => {
        try {
          set({ conversationloading: true });
          const res = await chatService.fetchConversation();

          set({ conversations: res.conversations });
          toast.success("Lấy danh sách cuộc hội thoại thành công");
        } catch (error) {
          console.error(error);
          toast.error("Lấy danh sách cuộc hội thoại thất bại: " + error);
        } finally {
          set({ conversationloading: false });
        }
      },
      fetchMessages: async (conversitionId) => {
        try {
          const { messages, activeConversationId } = get();
          const { user } = useAuthStore.getState();

          const converId = conversitionId ?? activeConversationId;

          if (!converId) {
            return;
          }

          const current = messages?.[converId];

          const nextCursor =
            current?.nextCursor === undefined ? "" : current?.nextCursor;

          if (nextCursor === null) {
            return;
          }

          set({ messageLoading: true });
          const { messages: fetchMessages, cursor } =
            await chatService.fetchMessage(converId, nextCursor);

          const processed = fetchMessages.map((m) => {
            return {
              ...m,
              isOwn: m.senderId === user?._id,
            };
          });

          set((state) => {
            const prev = state.messages[converId]?.items ?? []; // lấy các tin nhắn cũ
            const merged =
              prev.length > 0 ? [...processed, ...prev] : processed;
            return {
              messages: {
                ...state.messages,
                [converId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.error(error);
          toast.error(
            "Lấy danh sách tin nhắn của cuộc hội thoại thất bại: " + error,
          );
        } finally {
          set({ messageLoading: false });
        }
      },
      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          set({ messageLoading: true });

          const activeConversation = get().activeConversationId;
          const res = await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversation ?? undefined,
          );

          set((state) => ({
            conversations: state.conversations.map((conversation) => {
              return conversation._id === activeConversation
                ? { ...conversation, seenBy: [] }
                : conversation;
            }),
          }));
        } catch (error) {
          console.error("Gửi tin nhắn Direct thất bại: ", error);
          toast.error("Gửi tin nhắn Direct thất bại: " + error);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl) => {
        try {
          set({ messageLoading: true });

          const res = await chatService.sendGroupMessage(
            conversationId,
            content,
            imgUrl,
          );

          set((state) => ({
            conversations: state.conversations.map((conversation) => {
              return conversation._id === get().activeConversationId
                ? { ...conversation, seenBy: [] }
                : conversation;
            }),
          }));
        } catch (error) {
          console.error("Gửi tin nhắn Group thất bại: ", error);
          toast.error("Gửi tin nhắn Group thất bại: " + error);
        } finally {
          set({ messageLoading: false });
        }
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }), // chọn phần tử muốn được lưu
    },
  ),
);
