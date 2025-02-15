

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import APIError from '../../../application/Errors/APIError';
import UserUseCase from '../../../application/UserUsecase';

class AuthorizationController {
  constructor(private readonly userUseCase: UserUseCase) { }
  AuthToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies['accessToken'];

    
    try {
      if (!token) throw new APIError('Access token is required', 401);
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
      const user = await this.userUseCase.getUserById((decoded as any).id);
      if (!user) throw new APIError('User not found', 404);
      if (!user.verified) throw new APIError('Email is not verified', 403);

      (req as any).user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new APIError('Access token has expired', 401));
      }
  
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new APIError('Invalid access token', 403));
      }
  
      next(error);
    }
  }
}

export default AuthorizationController;
