import UserUseCase from '../../../application/UserUsecase';
import { NextFunction, Request, Response } from 'express';
import APIError from '../../../application/Errors/APIError';
import JWTUsecase from '../../../application/JWTUsecase';
class UserAuthentication {
  constructor(private readonly userUseCase: UserUseCase) { }

  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.body;
      const newUser = await this.userUseCase.createUser(user);
      // const { accessToken, refreshToken } = JWTUsecase.generateTokens(newUser.id);
      // this.userUseCase.saveRefreshToken(newUser.id, refreshToken);
      // JWTUsecase.setTokenCookies(res, accessToken, refreshToken);
      res.status(201).json({ user: newUser });
    } catch (error: any) {
      next(error);
    }
  };

  loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userUseCase.loginUser(req.body);
      const { accessToken, refreshToken } = JWTUsecase.generateTokens(user.id);
      this.userUseCase.saveRefreshToken(user.id, refreshToken);
      JWTUsecase.setTokenCookies(res, accessToken, refreshToken);
      res.status(200).json({ user, accessToken });
    } catch (error: any) {
      next(error);
    }
  };

  generateNewAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cookies = req.cookies
      const { accessToken, refreshToken } = await this.userUseCase.generateNewAccessToken(cookies);
      JWTUsecase.setTokenCookies(res, accessToken, refreshToken);
      res.status(200).json({ accessToken });
    } catch (error: any) {
      next(error);
    }
  }

  logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies['refreshToken'];

      if (!refreshToken) throw new APIError('No content', 204);
      await this.userUseCase.invalidateRefreshToken(refreshToken);
      res.clearCookie('accessToken', { secure: true });
      res.clearCookie('refreshToken', { secure: true });
      console.log('Logged out successfully');
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
      next(error);
    }
  };
}

export default UserAuthentication;
