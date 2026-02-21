import type { ConversationResponse, Message } from "@/types/chat";
import api from "@/lib/axios";

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}

const pageLimit = 50;

export const chatService = {
  fetchConversation: async (): Promise<ConversationResponse> => {
    const res = await api.get("/api/conversation");
    return res.data;
  },

  fetchMessage: async (
    conversationId: string,
    cursor?: string,
  ): Promise<FetchMessageProps> => {
    const res = await api.get(
      `/api/conversation/${conversationId}/messages?limit=${pageLimit}&cursor=${cursor || ""}`,
    );
    return {
      messages: res.data.messages,
      cursor: res.data.nextCursor,
    };
  },

  sendDirectMessage: async (
    recipientId: string,
    content: string,
    imgUrl?: string,
    conversationId?: string,
  ) => {
    const res = await api.post("/api/message/direct", {
      recipientId,
      content,
      imgUrl,
      conversationId,
    });

    return res.data.newMessage;
  },

  sendGroupMessage: async (
    conversationId: string,
    content: string,
    imgUrl?: string,
  ) => {
    const res = await api.post("/api/message/group", {
      conversationId,
      content,
      imgUrl,
    });

    return res.data.newMessage;
  },
};
