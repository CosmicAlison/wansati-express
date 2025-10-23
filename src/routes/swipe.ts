import { Router } from "express";
import SwipeController from "../controllers/swipeController";
import authenticateToken from "../middleware/authenticateToken";

const router = Router();

router.post("/swipe", authenticateToken, SwipeController.createSwipe);

export default router;
