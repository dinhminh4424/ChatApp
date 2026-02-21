import type { Conversation } from "@/types/chat";
import React from "react";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import UnReadCountsBadge from "./UnReadCountsBadge";
import { useSocketStore } from "@/stores/useSocketStore";

const DirectMessageCard = ({
  conversation,
}: {
  conversation: Conversation; // định nghĩa biến conversation là Type Conversation
}) => {
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const {
    activeConversationId,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore();

  if (!user) {
    return null;
  }

  // lấy user đối diện
  const otherUser = conversation.participants.find((member) => {
    return member._id !== user._id;
  });

  if (!otherUser) {
    return null;
  }

  // lấy số lượng tin nhắn chưa đọc
  const unReadCount = conversation.unreadCounts[user._id];

  // lấy nội dung tin nhắn cuối cùng
  const lastMessage = conversation.lastMessage?.content ?? "";

  // hàm sử lý khi người dùng click vào conersation
  const handleSelectConversation = async (conversationId: string) => {
    setActiveConversation(conversationId);
    if (!messages[conversationId]) {
      await fetchMessages(conversationId);
    }
  };

  return (
    <div>
      <ChatCard
        conversationId={conversation._id}
        isActive={conversation._id === activeConversationId}
        leftSection={
          <>
            {/* // todo: user avatar */}
            <UserAvatar
              type="sidebar"
              name={otherUser.displayName ?? ""}
              avatarUrl={otherUser.avatarUrl ?? undefined}
            />
            {/* // todo: status badge */}
            {/* <StatusBadge status="offline" /> */}

            <StatusBadge
              status={
                onlineUsers.includes(otherUser._id) ? "online" : "offline"
              }
            />
            {/* // todo: unread count */}
            {unReadCount > 0 && <UnReadCountsBadge unReadCount={unReadCount} />}
          </>
        }
        subTitle={
          <p
            className={cn(
              "text-sm truncate ",
              unReadCount > 0 ? "font-medium" : "text-muted-foreground",
            )}
          >
            {lastMessage}
          </p>
        }
        name={otherUser.displayName}
        onSelect={handleSelectConversation}
        timestamp={
          conversation.createdAt ? new Date(conversation.createdAt) : undefined
        }
        unReadCount={unReadCount}
        key={conversation._id}
      />
    </div>
  );
};

export default DirectMessageCard;
