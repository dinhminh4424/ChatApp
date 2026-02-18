import express from "express";
import conversationController from "../controllers/conversationController.js";
import { checkFriendship } from "../middlewares/friendMiddleware.js";

const router = express.Router();

router.get(
  "/:conversationId/messages",
  // checkFriendship,
  conversationController.getMessages,
);
router.get("/", conversationController.getConversation);

router.post("/", checkFriendship, conversationController.createConversation);

export default router;
