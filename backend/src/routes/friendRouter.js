import express from "express";
import friendController from "../controllers/friendController.js";

const router = express.Router();

router.get("/requests", friendController.getFriendRequests);
router.get("/", friendController.getAllFriends);

router.post("/request/:requestId/accept", friendController.accessFriendRequest);
router.post(
  "/request/:requestId/decline",
  friendController.declineFriendRequest,
);
router.post("/request", friendController.sendFriendRequest);

export default router;
