import { sendResponse } from "../utils/sendResponse";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: number; 
    }
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
  const cookieToken = req.cookies?.token;

  const token = bearerToken || cookieToken;
  if (!token) {
    return sendResponse({ res, statusCode: 401, data: null, message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    if (!decoded.id) {
      return sendResponse({ res, statusCode: 403, data: null, message: "Invalid token" });
    }
    req.userId = decoded.id;
    next();
  } catch (err) {
    return sendResponse({ res, statusCode: 403, data: null, message: "Invalid token" });
  }
};

export default authenticateToken;
