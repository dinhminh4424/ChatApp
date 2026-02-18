import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { updateConversationAfterCreateMessage } from "../utils/messageHelper.js";

class MessageController {
  // Gửi tin nhắn Cá Nhân
  async sendDirectMessage(req, res) {
    try {
      const {
        recipientId,
        conversationId = null,
        content,
        imageUrl,
      } = req.body;
      const userId = req.user._id;

      if (!content && !imageUrl) {
        console.log(
          "MessageController : Không thể thiếu content hoặc imageUrl",
        );
        return res.status(400).json({
          success: false,
          message: "Không thể thiếu content hoặc imageUrl",
        });
      }

      let conversation;

      if (!conversationId) {
        console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk 1");
        conversation = await Conversation.create({
          type: "direct",
          participants: [
            { userId: userId, joinedAt: new Date() },
            { userId: recipientId, joinedAt: new Date() },
          ],
          lastMessageAt: new Date(),
          unReadCount: new Map(),
        });
      } else {
        console.log(
          " llllllllllllllllllllllllllllllllllllllllllllllllllllll 2",
        );

        conversation = await Conversation.findById(conversationId);
      }

      let isMember = conversation.participants
        .map((member) => {
          return member.userId.toString();
        })
        .includes(userId.toString());

      if (!isMember) {
        console.log(
          "MessageController : Bạn không có quyền gửi tin nhắn vào hộp thoại này",
        );
        return res.status(401).json({
          success: false,
          message: "Bạn không có quyền gửi tin nhắn vào hộp thoại này",
        });
      }

      const newMessage = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        content: content || null,
        imageUrl: imageUrl || null,
      });

      updateConversationAfterCreateMessage(conversation, newMessage);

      await conversation.save();

      return res.status(201).json({
        success: true,
        message: "Gửi tin nhắn thành công",
        conversation: conversation,
        newMessage: newMessage,
      });
    } catch (error) {
      console.log("MessageController : Lỗi khi gửi tin nhắn: ", error);
      return res.status(500).json({
        success: false,
        message: " Lỗi khi gửi tin nhắn: " + error.message,
      });
    }
  }

  // Gửi tin nhắn Nhóm
  async sendGroupMessage(req, res) {
    try {
      const { conversationId, content, imageUrl } = req.body;
      const userId = req.user._id;
      const conversation = req.conversation; // Trong middleware

      if (!content && !imageUrl) {
        console.log(
          "MessageController : Không thể thiếu content hoặc imageUrl",
        );
        return res.status(400).json({
          success: false,
          message: "Không thể thiếu content hoặc imageUrl",
        });
      }

      const newMessage = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        content: content || null,
        imageUrl: imageUrl || null,
      });

      updateConversationAfterCreateMessage(conversation, newMessage);

      conversation.save();

      return res.status(200).json({
        success: true,
        message: "Gửi tin nhắn nhóm thành công",
        conversation: conversation,
        newMessage: newMessage,
      });
    } catch (error) {
      console.log("Lỗi khi gửi tin nhắn nhóm: ", error);
      return res.status(500).json({
        success: false,
        message:
          " MessageController : Lỗi khi gửi tin nhắn nhóm: " + error.message,
      });
    }
  }
}

export default new MessageController();
