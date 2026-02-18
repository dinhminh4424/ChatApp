import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";

const pair = (a, b) => {
  if (a > b) {
    return [b, a];
  } else {
    return [a, b];
  }
};
export const checkFriendship = async (req, res, next) => {
  try {
    const me = req.user._id;
    const recipientId = req.body.recipientId ?? null;
    const memberIds = req.body.memberIds ?? [];

    if (!recipientId && memberIds.length === 0) {
      console.log(
        "friendMiddleware: Không tìm thấy người nhận, cần cung cấp recipientId hoặc memberIds",
      );
      return res.status(400).json({
        success: false,
        message:
          "Không tìm thấy người nhận, cần cung cấp recipientId hoặc memberIds",
      });
    }

    // ===== DIRECT CHAT =====
    if (recipientId) {
      // C1: so sánh 2 chiều
      // const friend = await Friend.findOne({
      //   $or: [
      //     { userA: me, userB: recipientId },
      //     { userA: recipientId, userB: me },
      //   ],
      // });
      //C2 so sánh từ trước giống với trong model
      const [userA, userB] = pair(me, recipientId);
      const friend = await Friend.findOne({
        userA: userA,
        userB: userB,
      });

      if (!friend) {
        console.log(
          "friendMiddleware: Bạn chưa kết bạn với user này, Cả 2 chưa là bạn bè",
        );
        return res.status(403).json({
          success: false,
          message: "Bạn chưa kết bạn với user này, Cả 2 chưa là bạn bè",
        });
      }

      return next();
    }

    // ===== GROUP CHAT =====

    // Kiểm tra các người cần thêm vào nhóm có là bạn của mình hay không
    const friendCheck = memberIds.map(async (memberId) => {
      const [userA, userB] = pair(me, memberId);
      const friend = await Friend.findOne({
        userA: userA,
        userB: userB,
      });
      return friend ? null : memberId;
    });

    const result = await Promise.all(friendCheck);
    const notFriend = result.filter((item) => item !== null);

    if (notFriend.length > 0) {
      console.log(
        "friendMiddleware: Có thành viên trong memberIds chưa là bạn của bạn :",
        notFriend,
      );
      return res.status(403).json({
        success: false,
        message: "Có thành viên trong danh sách chưa là bạn của bạn: ",
        notFriend,
      });
    }

    return next();
  } catch (error) {
    console.log(
      "friendMiddleware: Lỗi kiểm tra bạn bè trong friendMiddleware:",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra bạn bè :" + error.message,
    });
  }
};

export const checkGroupMembership = async (req, res, next) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      console.log("friendMiddleware: Không tìm thấy hộp thoại này");
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hộp thoại này",
      });
    }

    const isMember = conversation.participants.some((member) => {
      // some kiểm tra có thằng nào trùng với đk trả về true false
      return member.userId.toString() === userId.toString();
    });

    if (!isMember) {
      console.log("friendMiddleware: Bạn không là thành viên trong nhóm này");
      return res.status(404).json({
        success: false,
        message: "Bạn không là thành viên trong nhóm này",
      });
    }

    req.conversation = conversation;
    return next();
  } catch (error) {
    console.log(
      "friendMiddleware: Lỗi kiểm tra có là thành viên trong nhóm:",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Lỗi kiểm tra có là thành viên trong nhóm :" + error.message,
    });
  }
};
