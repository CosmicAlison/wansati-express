import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/authController';
import { sendResponse } from '../utils/sendResponse';
import authenticateToken from '../middleware/authenticateToken';

const router = Router();

router.post('/signup', (req: Request, res: Response) => AuthController.signup(req, res));

router.post('/login', (req: Request, res: Response) => AuthController.login(req, res));

router.post('/logout', (req: Request, res: Response) => {

  sendResponse({ res, statusCode: 200, data: null, message: 'Logged out' });
});

router.get('/me', async (req: Request, res: Response) => {
  AuthController.me(req, res);
});

export default router;
