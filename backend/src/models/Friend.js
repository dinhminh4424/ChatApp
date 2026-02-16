import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    userA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// TH1 nếu a:Nam - b:Hoàng
// TH2 nếu a:Hoàng - b:Nam
// 2 TH này như nhau

// => Trước khi lưu so sánh 2 ID với nhau nào bé hơn thì cho là 1, nào lớn hơn thì cho là 2 => sẽ ko bị trùng
friendSchema.pre("save", function (next) {
  if (!this.userA || !this.userB) {
    return;
  }
  const userA = this.userA.toString();
  const userB = this.userB.toString();

  if (userA > userB) {
    this.userA = new mongoose.Types.ObjectId(userB);
    this.userB = new mongoose.Types.ObjectId(userA);
  }
});

// Đảm bảo ko bị trùng truy vấn
friendSchema.index({ userA: 1, UserB: 1 }, { unique: true });

const Friend = mongoose.model("Friend", friendSchema);

export default Friend;
