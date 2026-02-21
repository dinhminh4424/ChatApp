import type { Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Ellipsis } from "lucide-react";

interface IGroupChatAvatarProps {
  participants: Participant[];
  type: "sidebar" | "chat";
}

const GroupChatAvatar = ({ participants, type }: IGroupChatAvatarProps) => {
  const avatars = [];
  const limit = Math.min(participants.length, 4); // nếu mà < 4 thì lấy hết còn > 4 thì lấy 4 người đầu thôi

  for (let i = 0; i < limit; i++) {
    const member = participants[i];
    avatars.push(
      // thêm vào cuối
      <UserAvatar
        key={i}
        name={member.displayName}
        type={type}
        avatarUrl={member.avatarUrl ?? undefined}
      />,
    );
  }

  return (
    <div className="relative flex -space-x-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2">
      {avatars}
      {/* nếu nhiều hơn 4 thành viên thì render dấu ... */}
      {participants.length > limit && (
        <div className="flex items-center z-10 justify-center size-8 bg-muted ring-2 ring-background text-muted-foreground">
          <Ellipsis className="size-4" />
        </div>
      )}
    </div>
  );
};

export default GroupChatAvatar;
