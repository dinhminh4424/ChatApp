import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// lời mời kết bạn ko bị trùng
friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

// Lời Nhận kết bạn
friendRequestSchema.index({ to: 1 });

// Lời Gửi kết bạn
friendRequestSchema.index({ from: 1 });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
