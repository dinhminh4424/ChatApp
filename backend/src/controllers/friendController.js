import Friend from "../models/Friend.js";
import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

class FriendController {
  async sendFriendRequest(req, res) {
    try {
      const from = req.user._id;

      const { userTo, message } = req.body;

      // kiểm tra có gửi cho chính mình
      if (from.toString() === userTo.toString()) {
        console.log(
          "FriendController : Không thể gửi lời mời kết bạn cho chính mình",
        );
        return res.status(400).json({
          success: false,
          message: "Không thể gửi lời mời kết bạn cho chính mình",
        });
      }

      // kiểm tra người cần kết bạn có tồn tại
      const userExits = await User.findById(userTo);
      if (!userExits) {
        console.log("FriendController : Không tìm thấy người nhận");
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người nhận",
        });
      }

      let userA = from.toString();
      let userB = userTo.toString();

      if (userA > userB) {
        [userA, userB] = [userB, userA];
      }

      const [alreadyRequest, alreadyFriends] = await Promise.all([
        // Kiểm tra có lời mời trc đó chưa
        FriendRequest.findOne({
          $or: [
            {
              from: from,
              to: userTo,
            },
            {
              from: userTo,
              to: from,
            },
          ],
        }),

        // Kiểm Tra có là bạn chưa
        Friend.findOne({ userA: userA, userB: userB }),
      ]);

      if (alreadyFriends) {
        console.log("FriendController : Cả hai đã là bạn bè");
        return res.status(400).json({
          success: false,
          message: "Cả hai đã là bạn bè",
        });
      }

      if (alreadyRequest) {
        console.log("FriendController : Đã có lời mời kết bạn trước đó");
        return res.status(400).json({
          success: false,
          message: "Đã có lời mời kết bạn trước đó",
        });
      }
      const request = await FriendRequest.create({
        from: from,
        to: userTo,
        message: message,
      });

      return res.status(201).json({
        success: true,
        message: "Gửi lời mời kết bạn thành công",
        request: request,
      });
    } catch (error) {
      console.error("FriendController: Lỗi khi gửi lời mời kết bạn: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi gửi lời mời kết bạn: " + error.message,
      });
    }
  }

  async accessFriendRequest(req, res) {
    try {
      const userCurrent = req.user._id;

      const { requestId } = req.params;

      const friendRequest = await FriendRequest.findById(requestId);

      if (!friendRequest) {
        console.log("FriendController: Không tìm thấy lời mời kết bạn");
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lời mời kết bạn",
        });
      }

      if (userCurrent.toString() !== friendRequest.to.toString()) {
        console.log(
          "FriendController: Không trùng với người nhận thông báo kết bạn: ",
          userCurrent,
          " - ",
          friendRequest.to,
        );
        return res.status(403).json({
          success: false,
          message:
            "Bạn không phải là người nhận thông báo kết bạn hoặc bạn không có quyền xác nhận lời mời kết bạn này",
        });
      }

      const checkFriend = await Friend.findOne({
        $or: [
          { userA: friendRequest.from, userB: friendRequest.to },
          { userA: friendRequest.to, userB: friendRequest.from },
        ],
      });

      if (checkFriend) {
        console.log("FriendController: Cả Hai đã là bạn bè");
        return res.status(403).json({
          success: false,
          message: "Cả Hai đã là bạn bè",
        });
      }

      const friend = await Friend.create({
        userA: friendRequest.from,
        userB: friendRequest.to,
      });

      await FriendRequest.findByIdAndDelete(requestId);

      const from = await User.findById(friendRequest.from)
        .select("-password")
        .lean();

      return res.status(200).json({
        success: true,
        message: "Xác nhận kết bạn thành công",
        friend: friend,
        newFriend: from,
      });
    } catch (error) {
      console.error("FriendController: Lỗi khi thêm bạn bè:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi thêm bạn bè: " + error.message,
      });
    }
  }

  async declineFriendRequest(req, res) {
    try {
      const userCurrent = req.user._id;

      const { requestId } = req.params;

      const friendRequest = await FriendRequest.findById(requestId);

      if (!friendRequest) {
        console.log("FriendController: Không tìm thấy lời mời kết bạn");
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy lời mời kết bạn",
        });
      }

      if (userCurrent.toString() !== friendRequest.to.toString()) {
        console.log(
          "FriendController: Không trùng với người nhận thông báo kết bạn: ",
          userCurrent,
          " - ",
          friendRequest.to,
        );
        return res.status(403).json({
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
        console.log("FriendController: Cả Hai đã là bạn bè");
        return res.status(403).json({
          success: false,
          message: "Cả Hai đã là bạn bè",
        });
      }

      await FriendRequest.findByIdAndDelete(requestId);

      return res.status(200).json({
        success: true,
        message: "Xác nhận từ chối kết bạn thành công",
      });
    } catch (error) {
      console.log("FriendController: Lỗi khi từ chối kết bạn: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi từ chối kết bạn: " + error.message,
      });
    }
  }

  async getAllFriends(req, res) {
    try {
      const userCurrent = req.user._id;

      const fiends = await Friend.find({
        $or: [{ userA: userCurrent }, { userB: userCurrent }],
      })
        .populate("userA", "-password")
        .populate("userB", "-password")
        .lean();

      if (!fiends) {
        return res.status(200).json({
          success: true,
          message: "Lấy danh sách bạn bè thành công",
          friends: [],
        });
      }

      const friendShip = fiends.map((f) => {
        if (f.userA._id.toString() === userCurrent.toString()) {
          return f.userB;
        } else {
          return f.userA;
        }
      });

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách bạn bè thành công",
        friends: friendShip,
      });
    } catch (error) {
      console.log("FriendController: Lỗi khi lấy danh sách bạn bè: ", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách bạn bè: " + error.message,
      });
    }
  }

  async getFriendRequests(req, res) {
    try {
      const userCurrent = req.user._id;

      const populateFriend = "_id userName displayName avatarUrl";

      const [send, received] = await Promise.all([
        // lấy các user mà mình đã gửi lời mời
        FriendRequest.find({
          from: userCurrent,
        }).populate("to", populateFriend),
        // lấy các user mà người ta gửi cho mình
        FriendRequest.find({
          to: userCurrent,
        }).populate("from", populateFriend),
      ]);

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách lời mời kết bạn thành công",
        send: send,
        received: received,
      });
    } catch (error) {
      console.log(
        "FriendController: Lỗi khi lấy danh sách lời mời kết bạn: ",
        error,
      );
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách lời mời kết bạn: " + error.message,
      });
    }
  }
}

export default new FriendController();
