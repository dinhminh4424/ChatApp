import { useChatStore } from "@/stores/useChatStore";
import GroupChatCard from "./GroupChatCard";

const GroupChatList = () => {
  const { conversations } = useChatStore();

  if (!conversations) {
    return;
  }

  // tìm conversation của Direct
  const groupConversation = conversations.filter((conversation) => {
    return conversation.type === "group";
  });

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {groupConversation.map((conversation) => {
        return (
          <GroupChatCard conversation={conversation} key={conversation._id} />
        );
      })}
    </div>
  );
};

export default GroupChatList;
