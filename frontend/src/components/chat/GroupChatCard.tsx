import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import GroupChatAvatar from "./GroupChatAvatar";

const GroupChatCard = ({ conversation }: { conversation: Conversation }) => {
  const { user } = useAuthStore();

  const {
    messages,
    activeConversationId,
    setActiveConversation,
    fetchMessages,
  } = useChatStore();

  if (!user) {
    return null;
  }

  // Đếm tin nhắn chưa đọc
  if (!conversation.unreadCounts) return null;
  const unReadCount = conversation.unreadCounts[user._id];

  // Lấy tên group
  const groupName = conversation.group.name;
  // sử lý khi chọn select conversation
  const handleSelectConversation = async (conversationId: string) => {
    setActiveConversation(conversationId);

    if (!messages[conversationId]) {
      await fetchMessages(conversationId);
    }
  };

  return (
    <ChatCard
      conversationId={conversation._id}
      isActive={conversation._id === activeConversationId}
      name={groupName}
      leftSection={
        conversation.participants.length > 0 && (
          <GroupChatAvatar
            participants={conversation.participants}
            type="chat"
          />
        )
      }
      subTitle={
        <p className="text-muted-foreground text-sm truncate">
          {conversation.participants?.length} thành viên
        </p>
      }
      timestamp={
        conversation.lastMessage?.createdAt
          ? new Date(conversation.lastMessage.createdAt)
          : undefined
      }
      onSelect={handleSelectConversation}
      key={conversation._id}
      unReadCount={unReadCount}
    />
  );
};

export default GroupChatCard;
