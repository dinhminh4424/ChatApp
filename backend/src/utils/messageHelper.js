export const updateConversationAfterCreateMessage = (conversation, message) => {
  conversation.set({
    seenBy: [],
    lastMessageAt: message.createdAt,
    lastMessage: {
      _id: message._id,
      content: message.content || "Đã gửi hình ảnh/file",
      senderId: message.senderId,
      createAt: message.createdAt,
    },
  });

  // Khi có tin nhắn mới, tất cả thành viên trừ người gửi sẽ tăng số tin chưa đọc lên +1.
  // Người gửi thì reset về 0 (vì họ đã đọc tin của chính họ).

  // Tổng quan :
  // participants = [A, B, C]
  // sender = A
  // unReadCount trước = { A:0, B:2, C:5 }
  conversation.participants.forEach((member) => {
    const memberId = member.userId.toString(); // Lấy ra id của thằng member này
    const isSender = memberId === message.senderId.toString(); // kiểm tra xem có phải người gửi ko

    //Lấy số tin chưa đọc trước đó của người này trong Map unReadCount.
    const prevCount = conversation.unReadCount.get(memberId) || 0; // lấy ra giá trị [value] của key [memberId]
    conversation.unReadCount.set(memberId, isSender ? 0 : prevCount + 1); // cập nhật unReadCount với {memberId, value}
  });
};

export const emitNewMessage = (io, conversation, message) => {
  // tạo thông báo cho id phòng: [conversation._id] với [new-message] có giá trị là [{..........}]
  io.to(conversation._id.toString()).emit("new-message", {
    message,
    conversation: {
      _id: conversation._id,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
    },
    unReadCounts: conversation.unReadCount,
  });
};
