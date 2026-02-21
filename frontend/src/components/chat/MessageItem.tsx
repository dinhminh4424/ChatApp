import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";

import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface IMessageItemPros {
  message: Message;
  index: number;
  messages: Message[];
  selectConversation: Conversation;
  lassMessageStatus: "delivered" | "seen";
}

const MessageItem = ({
  message,
  index,
  messages,
  selectConversation,
  lassMessageStatus,
}: IMessageItemPros) => {
  const prev = messages[index - 1];

  const isGroupBreak =
    index === 0 ||
    message.senderId !== prev?.senderId ||
    new Date(message.createdAt).getTime() -
      new Date(prev?.createdAt || 0).getTime() >
      300000; // > 5 phút

  // tìm các người dùng  với tìn nhắn cuối  cùng
  const participant = selectConversation.participants.find(
    (member: Participant) => {
      return member._id.toString() === prev?.senderId.toString();
    },
  );
  return (
    <div
      className={cn(
        "flex gap-2 message-bounce mt-1",
        message.isOwn ? "justify-end" : "justify-start  ",
      )}
    >
      {/* Avatar */}
      {!message.isOwn && (
        <div className="w-8">
          {isGroupBreak && (
            <UserAvatar
              type="chat"
              avatarUrl={participant?.avatarUrl ?? undefined}
              name={participant?.displayName ?? "Unknown"}
            />
          )}
        </div>
      )}
      {/* Tin nhắn */}
      <div
        className={cn(
          "max-w-sm lg:max-w-md space-y-1 flex flex-col ",
          message.isOwn ? "items-end" : "items-start",
        )}
      >
        <Card
          className={cn(
            "p-3",
            message.isOwn
              ? "chat-bubble-sent border-0"
              : "bg-chat-bubble-received border-0",
          )}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.content}
          </p>
        </Card>
        {/* timestapm */}
        {isGroupBreak && (
          <span className="text-sm text-foreground px-1">
            {formatMessageTime(new Date(message.createdAt))}
          </span>
        )}
        {/* seen/ delivered */}
        {message.isOwn &&
          message._id === selectConversation.lastMessage?._id && (
            <Badge
              variant={"outline"}
              className={cn(
                "text-xs px-1.5 py-0.5 h-4 border-0",
                lassMessageStatus === "seen"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            ></Badge>
          )}
      </div>
    </div>
  );
};

export default MessageItem;
