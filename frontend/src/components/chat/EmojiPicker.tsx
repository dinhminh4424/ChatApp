import { useThemeStore } from "@/stores/useThemeStore";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Smile } from "lucide-react";

// các thành phần của emoji-mart
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface IEmojiPickerProps {
  onChange: (value: string) => void;
}

const EmojiPicker = ({ onChange }: IEmojiPickerProps) => {
  const { isDark } = useThemeStore();

  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer">
        <Smile className="size-4"></Smile>
      </PopoverTrigger>
      <PopoverContent
        side="right" // popup hiện bên phải trigger
        sideOffset={40} // cách trigger 40px
        className="bg-transparent border-none shadow-none drop-shadow-none mb-12" // style
      >
        <Picker
          theme={isDark ? "dark" : "light"}
          data={data} // dataset emoji của emoji-mart
          onEmojiSelect={(emoji: any) => onChange(emoji.native)} //khi user click emoji: chọn emoji.native để lấy ký tự emoji thật
          emojiSize={24} // size icon emoji trong picker
        />
      </PopoverContent>
    </Popover>
  );
};

// sử dụng : <EmojiPicker
//                 //onChange={(emoji: string) => setValue(`${value}${emoji}}`)}
//                 onChange={onChangeEmoji}
//               />

//   const onChangeEmoji = (emoji: string) => {
//     setValue((prev) => prev + emoji);
//   };

export default EmojiPicker;
