import { useChatStore } from "@/stores/useChatStore";
import React from "react";
import ChatWellComeScreen from "./ChatWellComeScreen";
import MessageItem from "./MessageItem";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
  } = useChatStore();

  const messages = allMessages[activeConversationId!]?.items ?? [];

  console.log("messages: ", messages);

  const selectConversation =
    conversations.find((converstion) => {
      return converstion._id === activeConversationId;
    }) ?? null;

  if (!selectConversation) {
    return <ChatWellComeScreen />;
  }

  if (!messages) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Chưa có tin nhắn nào trong cuộc trò chuyện này
      </div>
    );
  }
  return (
    <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div className="flex flex-col overflow-y-auto overflow-x-hidden beautiful-scrollbar">
        {messages.map((message, index) => {
          return (
            <MessageItem
              index={index}
              key={message._id ?? index}
              message={message}
              messages={messages}
              selectConversation={selectConversation}
              lassMessageStatus="delivered"
            />
          );
        })}
      </div>
    </div>
  );
};

export default ChatWindowBody;
