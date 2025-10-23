import { Router } from "express";
import SwipeController from "../controllers/swipeController";

const router = Router();

router.post("/swipe", SwipeController.createSwipe);

export default router;
