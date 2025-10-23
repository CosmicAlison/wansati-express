import { Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse";
import { SwipeService } from "../services/swipeService";

export default class SwipeController {
  static async createSwipe(req: Request, res: Response) {
    try {
      if (!req.user?.id) throw new Error("User not authenticated");

      const { targetId } = req.body;
      if (!targetId) {
        return sendResponse({ res, statusCode: 400, data: null, message: "targetId is required" });
      }

      const result = await SwipeService.createSwipe(req.user.id, targetId);
      const message = result.matched
        ? "It's a match!"
        : "Swipe recorded";

      sendResponse({ res, statusCode: 201, data: result, message });
    } catch (error: any) {
      console.error(error);
      sendResponse({ res, statusCode: 500, data: null, message: error.message || "Server error" });
    }
  }
}
