import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserService } from '../services/userService';
import { sendResponse } from '../utils/sendResponse';

interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  [key: string]: any;
}

interface LoginBody {
  email: string;
  password: string;
  redirectTo: string;
}

interface UserExistsError extends Error {
  code: string;
  message: string;
}

import jwt from "jsonwebtoken";
import { User } from "../models/User";

export class AuthController {
  static async signup(req: Request<{}, {}, CreateUserBody>, res: Response) {
    try {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await UserService.createUser({ name, email, password: hashedPassword });

      const safeUser = { id: user.id, name: user.name, email: user.email, created_at: user.created_at, updated_at: user.updated_at };

      sendResponse({ res, statusCode: 201, data: safeUser, message: "User created successfully" });
    } catch (error) {
      const err = error as UserExistsError;
      if (err.code === "USER_EXISTS") {
        return sendResponse({ res, statusCode: 409, data: null, message: err.message });
      }
      sendResponse({ res, statusCode: 500, data: null, message: "Server error" });
    }
  }

  static async login(req: Request<{}, {}, LoginBody>, res: Response) {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for email:", req.body);
      const user = await UserService.getUserByEmail(email);

      if (!user) {
        return sendResponse({ res, statusCode: 401, data: null, message: "Invalid email" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return sendResponse({ res, statusCode: 401, data: null, message: "Invalid password" });
      }

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT_SECRET not set");

      const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: "1h" });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 60 * 60 * 1000, 
        path: "/",
      });

      sendResponse({ res, statusCode: 200, data: { user: safeUser }, message: "Login successful" });
    } catch (error) {
      console.error(error);
      sendResponse({ res, statusCode: 500, data: null, message: "Server error" });
    }
  }

  static async logout(req: Request, res: Response) {
    // ✅ Clear the cookie
    res.clearCookie("token", { path: "/" });
    sendResponse({ res, statusCode: 200, data: null, message: "Logged out" });
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return sendResponse({ res, statusCode: 200, data: { user: null }, message: "OK" });
      }

      const user = await UserService.getUserById(Number(userId));
      if (!user) {
        return sendResponse({ res, statusCode: 200, data: { user: null }, message: "OK" });
      }

      const { password, ...safeUser } = user as any;
      sendResponse({ res, statusCode: 200, data: { user: safeUser }, message: "OK" });
    } catch (err) {
      sendResponse({ res, statusCode: 500, data: null, message: "Server error" });
    }
  }
}
