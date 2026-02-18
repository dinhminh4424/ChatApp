import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

class ConversationController {
  async createConversation(req, res) {
    try {
      const { type, name, memberIds } = req.body;
      const userId = req.user._id;

      if (
        !type ||
        (type == "group" && !name) ||
        !memberIds ||
        !memberIds.length ||
        !Array.isArray(memberIds)
      ) {
        console.log(
          "createConversation: Tên nhóm, Type, memberIds  là bắt buộc",
        );
        return res.status(400).json({
          success: false,
          message: " Tên nhóm, Type, memberIds  là bắt buộc",
        });
      }

      let conversation;
      let participants = memberIds.map((memberId) => {
        return {
          userId: memberId,
          joinedAt: new Date(),
        };
      });

      if (type === "direct") {
        conversation = await Conversation.findOne({
          type: "direct",
          "participants.userId": { $all: [userId, memberIds] },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            type: "direct",
            participants: [
              { userId: userId, joinedAt: new Date() },
              ...participants,
            ],
            lastMessageAt: new Date(),
          });
        }
      }
      if (type === "group") {
        let group = {
          name: name,
          createBy: userId,
        };

        conversation = await Conversation.create({
          type: "group",
          participants: [
            { userId: userId, joinedAt: new Date() },
            ...participants,
          ],
          lastMessageAt: new Date(),
          group: group,
        });
      }

      if (!conversation) {
        console.log("createConversation: lỗi tạo conversation ");
        return res.status(400).json({
          success: false,
          message: "Lỗi  khi tạo hộp thoại mới: ",
        });
      }

      await conversation.populate([
        { path: "participants.userId" },
        { path: "seenBy" },
        { path: "lastMessage.senderId" },
      ]);

      return res.status(200).json({
        success: true,
        message: "Tạo hộp thoại mới thành công",
        conversation: conversation,
      });
    } catch (error) {
      console.log(
        "createConversation: Lỗi hệ thống khi tạo hộp thoại mới: ",
        error,
      );
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tạo hộp thoại mới: " + error.message,
      });
    }
  }

  async getConversation(req, res) {
    try {
      const userId = req.user._id;

      const conversations = await Conversation.find({
        "participants.userId": userId,
      })
        .sort({ lastMessageAt: -1, updateAt: -1 })
        .populate("participants.userId")
        .populate("lastMessage.senderId")
        .populate("seenBy");

      const formatted = conversations.map((conversation) => {
        const participants = (conversation.participants || []).map((p) => {
          return {
            _id: p.userId?._id,
            displayName: p.userId?.displayName,
            avatarUrl: p.userId?.avatarUrl ?? null,
            joinedAt: p.joinedAt,
          };
        });

        return {
          ...conversation.toObject(),
          participants: participants || {},
          unReadCount: conversation.unReadCount || {},
        };
      });

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách hộp thoại thành công",
        conversations: formatted,
      });
    } catch (error) {
      console.log(
        "createConversation: Lỗi hệ thống khi lấy thông tin hộp thoại : ",
        error,
      );
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thông tin hộp thoại: " + error.message,
      });
    }
  }

  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const { limit = 50, cursor } = req.query;
      const userId = req.user._id;

      if (!conversationId) {
        console.log("getMessages: Ko tìm thấy conversationId trong req.params");
        return res.status(400).json({
          success: false,
          message: "Không thể thiếu conversationId",
        });
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        "participants.userId": userId,
      });

      if (!conversation) {
        console.log(
          "getMessages: Người dùng hiện tại không có quyền truy cập vào hộp thoại này",
        );
        return res.status(400).json({
          success: false,
          message: "Bạn không có quyền truy cập vào hộp thoại này",
        });
      }

      const query = { conversationId: conversationId };
      if (cursor) {
        query.createdAt = { $lt: new Date(cursor) };
      }

      let messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit) + 1) // lấy hơn 1 để kiểm tra coi còn tin nữa không để phân trang
        .populate("senderId", "displayName avatarUrl");

      let nextCursor = null;
      if (messages.length > Number(limit)) {
        const nextMessage = messages[messages.length - 1]; // lấy thằng mà limit + 1 á
        nextCursor = nextMessage.createdAt.toISOString(); // cập nhật lại time để lấy mới
        messages.pop(); // lấy thằng cuối ra là thằng mà limit + 1 á
      }

      messages = messages.reverse(); // đảo lại để hiển thị lên khung chat

      return res.status(200).json({
        success: true,
        message: "Lấy tin nhắn thành công",
        messages: messages,
        nextCursor: nextCursor,
      });
    } catch (error) {
      console.log(
        "getMessages: Lỗi hệ thống khi lấy Tin Nhắn của hộp thoại : ",
        error,
      );
      return res.status(500).json({
        success: false,
        message:
          "Lỗi hệ thống khi lấy Tin Nhắn của hộp thoại: " + error.message,
      });
    }
  }
}

export default new ConversationController();
