import { Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse";
import {MatchService} from "../services/matchService";



declare module 'express-serve-static-core' {
  interface Request {
    user?: any; // Or define a specific type for your user object
  }
}

export default class MatchController {
  // Get all matches for the logged-in user
  static async getUserMatches(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not authenticated");

      const matches = await MatchService.getUserMatches(req, res);
      sendResponse({ res, statusCode: 200, data: matches, message: "User matches retrieved" });
    } catch (error: any) {
      console.error(error);
      sendResponse({ res, statusCode: 500, data: null, message: error.message || "Server error" });
    }
  }

  // Create a match between logged-in user and another user
  static async createMatch(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not authenticated");

      const { matchedUserId } = req.body;
      if (!matchedUserId) {
        return sendResponse({ res, statusCode: 400, data: null, message: "matchedUserId is required" });
      }

      const match = await MatchService.createMatch(req.user.id, matchedUserId);
      sendResponse({ res, statusCode: 201, data: match, message: "Match created successfully" });
    } catch (error: any) {
      console.error(error);
      sendResponse({ res, statusCode: 500, data: null, message: error.message || "Server error" });
    }
  }

  static async deleteMatch(req: Request, res: Response) {
    try {
      if (!req.user) throw new Error("User not authenticated");

      const { matchedUserId } = req.params;
      if (!matchedUserId) {
        return sendResponse({ res, statusCode: 400, data: null, message: "matchedUserId is required" });
      }

      await MatchService.deleteMatch(req.user.id, Number(matchedUserId));
      sendResponse({ res, statusCode: 200, data: null, message: "Match deleted successfully" });
    } catch (error: any) {
      console.error(error);
      sendResponse({ res, statusCode: 500, data: null, message: error.message || "Server error" });
    }
  }

  static async getPotentialMatches(req: Request, res: Response) {
  try {
    if (!req.user?.id) throw new Error("User not authenticated");

    const potentialMatches = await MatchService.getPotentialMatches(req.user?.id);
    sendResponse({ 
      res, 
      statusCode: 200, 
      data: potentialMatches, 
      message: "Potential matches retrieved" 
    });
  } catch (error: any) {
    console.error(error);
    sendResponse({ 
      res, 
      statusCode: 500, 
      data: null, 
      message: error.message || "Server error" 
    });
  }}
}
