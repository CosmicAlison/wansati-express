import { Request, Response } from 'express';
import { User } from '../models/User';
import { UserService } from '../services/userService';
import { sendResponse } from '../utils/sendResponse';

interface CreateUserRequest extends Express.Request {
    body: {
        name: string;
        email: string;
        password: string;
        [key: string]: any;
    };
}

interface CreateUserResponse extends Express.Response {
    sendResponse: (status: number, data: any, message: string) => void;
}

interface GetUserByIdRequest extends Express.Request {
    body: {
        email: string;
    };
}

interface GetUserByIdResponse extends Express.Response {
    sendResponse: (user: User) => void;
}

interface CreateUserResponse extends Express.Response {
    sendResponse: (status: number, data: any, message: string) => void;
}

interface UserExistsError extends Error {
    code: string;
    message: string;
}

class UserController {
    static async createUser(
        req: CreateUserRequest,
        res: CreateUserResponse
    ): Promise<void> {
        try {
            const userData = req.body;
            const user: User = await UserService.createUser(userData);

            res.sendResponse(201, user, 'User created successfully');
        } catch (error) {
            if ((error as UserExistsError).code === 'USER_EXISTS') {
                return res.sendResponse(409, null, (error as UserExistsError).message);
            }
            throw error;
        }
    }

    static async getUsers(
        req: Request, 
        res: Response) {
        const { page = 1, limit = 10 } = req.query;
        const users = await UserService.getUsers(page, limit);

        res.sendResponse(200, users, 'Users retrieved successfully');
    }

    static async getUserById(
        req: GetUserByIdRequest, 
        res: GetUserByIdResponse
    ): Promise<void> {
        const user = await UserService.getUserById(req.params.id);

        if (!user) {
            return res.sendResponse(404, null, 'User not found');
        }

        res.sendResponse(200, user, 'User retrieved successfully');
    }
}