import Friend from "../models/Friend";
import FriendRequest from "../models/FriendRequest";

class FriendController {
  async addFriend(req, res) {
    try {
      const userCurrent = req.user._id;

      const { userTo, message } = req.body;

      const checkFriendRequest = await FriendRequest.findOne({
        from: userTo,
        to: userCurrent,
      });
      if (checkFriendRequest) {
        console.log("Bạn đã gửi lời mời kết bạn trước đó rồi");
        return res.status(400).json({
          success: false,
          message: "Bạn đã gửi lời mời kết bạn trước đó rồi",
        });
      }
      const friendRequest = new FriendRequest({
        from: userCurrent,
        to: userTo,
        message: message,
      });

      friendRequest.save();

      return res.status(201).json({
        success: true,
        message: "Thêm bạn bè thành công",
      });
    } catch (error) {
      console.error("Lỗi khi thêm bạn bè:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi gửi lời mời kết bạn: " + error.message,
      });
    }
  }

  async accessFriendRequest(req, res) {
    try {
      const userCurrent = req.user._id;

      const { friendRequestId } = req.body;

      const friendRequest = await FriendRequest.findById(friendRequestId);

      if (!friendRequest) {
        console.log("Không tìm thấy lời mời kết bạn");
        return res.status(401).json({
          success: false,
          message: "Không tìm thấy lời mời kết bạn",
        });
      }

      if (userCurrent.toString() !== friendRequest.to.toString()) {
        console.log(
          "Không trùng với người nhận thông báo kết bạn: ",
          userCurrent,
          " - ",
          friendRequest.to,
        );
        return res.status(402).json({
          success: false,
          message: "Bạn không phải là người nhận thông báo kết bạn",
        });
      }

      const checkFriend = await Friend.findOne({
        $or: [
          { userA: friendRequest.from, userB: friendRequest.to },
          { userA: friendRequest.to, userB: friendRequest.from },
        ],
      });

      if (checkFriend) {
        console.log("Cả Hai đã là bạn bè");
        return res.status(403).json({
          success: false,
          message: "Cả Hai đã là bạn bè",
        });
      }

      const friend = new Friend({
        userA: friendRequest.from,
        userB: friendRequest.to,
      });

      friend.save();

      await FriendRequest.findByIdAndDelete(friendRequestId);

      return res.status(200).json({
        success: true,
        message: "Xác nhận kết bạn thành công",
      });
    } catch (error) {
      console.error("Lỗi khi thêm bạn bè:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi thêm bạn bè: " + error.message,
      });
    }
  }
}

export default new FriendController();
