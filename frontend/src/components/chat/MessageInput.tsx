import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useState } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";

const MessageInput = ({
  selectConversation,
}: {
  selectConversation: Conversation;
}) => {
  const { user } = useAuthStore();

  const { sendDirectMessage, sendGroupMessage } = useChatStore();

  const [value, setValue] = useState("");

  if (!user) {
    return null;
  }

  const onChangeEmoji = (emoji: string) => {
    setValue((prev) => prev + emoji);
  };

  const sendMessage = async () => {
    if (!value.trim()) {
      return;
    }

    const valueTemp = value.trim();

    setValue("");
    try {
      if (selectConversation.type === "direct") {
        const participants = selectConversation.participants;
        const otherUser = participants.filter((member) => {
          return member._id !== user._id;
        })[0];

        await sendDirectMessage(otherUser._id, valueTemp, undefined);
      } else {
        await sendGroupMessage(selectConversation._id, valueTemp, undefined);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gửi tin nhắn thất bại! Vui lòng thử lại sau.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background">
      <Button
        variant={"ghost"}
        size={"icon"}
        className="hover:bg-primary/10 transition-smooth"
      >
        <ImagePlus className="size-4" />
      </Button>

      <div className="flex-1 relative">
        <Input
          onKeyDown={handleKeyPress}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          placeholder="Soạn tin nhắn"
          className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
        ></Input>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            // là chỉ là hình thức ko là nút thật asChild chuyển hết style của cha vào con vì không lồng 2 nút vào nhau được
            asChild // Gioongs type="Button"
            variant={"ghost"}
            size={"icon"}
            className="size-8 hover:bg-primary/10 transition-smooth"
          >
            <div>
              {/* Emoji picker */}
              <EmojiPicker
                // onChange={(emoji: string) => setValue(`${value}${emoji}}`)}
                onChange={onChangeEmoji}
              />
            </div>
          </Button>
        </div>
      </div>
      <Button
        className="bg-gradient-chat hover:shadow-glow transition-smooth"
        disabled={!value.trim()}
        onClick={sendMessage}
      >
        <Send className="size-4 text-white" />
      </Button>
    </div>
  );
};

export default MessageInput;
