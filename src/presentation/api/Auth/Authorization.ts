

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import APIError from '../../../application/Errors/APIError';
import { verify } from 'crypto';
function AuthToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['accessToken'];

  if (!token) {
    throw new APIError('Access token is required', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new APIError('Access token has expired', 401);
    }
    throw new APIError('Invalid access token', 403);
  }
}

export default AuthToken;
