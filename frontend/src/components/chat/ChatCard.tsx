import React from "react";
import { Card } from "../ui/card";
import { cn, formatOnlineTime } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

interface IChatCardProds {
  conversationId: string;
  name: string;
  timestamp?: Date;
  isActive: boolean;
  onSelect: (id: string) => void;
  unReadCount: number;
  leftSection: React.ReactNode;
  subTitle: React.ReactNode;
}

const ChatCard = ({
  conversationId,
  name,
  timestamp,
  isActive,
  onSelect,
  unReadCount,
  leftSection,
  subTitle,
}: IChatCardProds) => {
  return (
    <Card
      key={conversationId}
      className={cn(
        "border-none p-3 cursor-pointer transition-smooth glass hover:bg-muted/30",
        isActive &&
          "ring-2 ring-primary/50 bg-gradient-to-tr from-primary-glow/10 to-primary-foreground",
      )}
      onClick={() => onSelect(conversationId)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">{leftSection}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                " font-semibold text-sm truncate",
                unReadCount && unReadCount > 0 && "text-foreground",
              )}
            >
              {name}
            </h3>
            <span className="text-sm text-muted-foreground">
              {timestamp ? formatOnlineTime(timestamp) : ""}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {subTitle}
            </div>
            <MoreHorizontal className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 hover:size-5 transition-smooth" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard;
