import React from "react";

import { useChatStore } from "@/stores/useChatStore";

// import { useAuthStore } from "@/stores/useAuthStore";
import DirectMessageCard from "./DirectMessageCard";

const DirectMessageList = () => {
  const { conversations } = useChatStore();

  // const { user } = useAuthStore();

  if (!conversations) {
    return;
  }

  // tìm conversation của Direct
  const directConversation = conversations.filter((conversation) => {
    return conversation.type === "direct";
  });

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {directConversation.map((conversation) => {
        return (
          <DirectMessageCard
            conversation={conversation}
            key={conversation._id}
          />
        );
      })}
    </div>
  );
};

export default DirectMessageList;
