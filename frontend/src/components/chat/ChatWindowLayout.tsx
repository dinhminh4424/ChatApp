import { useChatStore } from "@/stores/useChatStore";
import ChatWellComeScreen from "./ChatWellComeScreen";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";

const ChatWindowLayout = () => {
  const {
    setActiveConversation,
    activeConversationId,
    conversations,
    messageLoading: loading,
    messages,
  } = useChatStore();

  const selectConverstion =
    conversations.find((converstion) => {
      return converstion._id === activeConversationId;
    }) ?? null;

  if (!selectConverstion) {
    return <ChatWellComeScreen />;
  }

  if (loading) {
    return <ChatWindowSkeleton />;
  }
  return (
    <SidebarInset className="flex flex-col h-full flex-1  overflow-hidden rounded-sm shadow-md">
      {/* header */}
      <ChatWindowHeader chat={selectConverstion} />
      {/* body */}
      <div className="flex-1 overflow-y-auto bg-primary-foreground">
        <ChatWindowBody />
      </div>
      {/* footer */}
      <MessageInput selectConversation={selectConverstion} />
    </SidebarInset>
  );
};

export default ChatWindowLayout;
