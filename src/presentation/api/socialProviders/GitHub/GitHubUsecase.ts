import { NextFunction, Request, Response } from "express";
import UserRepository from "../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository";
import { AuthProvider } from "@prisma/client";
import APIError from "../../../../application/Errors/APIError";
import IUser from "../../../../domain/model/IUser";
import JWTService from "../../../../application/JWTUsecase";
import dotenv from 'dotenv';

dotenv.config();

class GitHubUseCase {
  constructor(private readonly userRepository: UserRepository) { }
  GitHubSignIn = async (profile: any) => {
    const { id, displayName, photos, username } = profile;
    const photo = photos[0].value;
    let user = await this.userRepository.getByProviderId(id);

    if (user && user?.provider !== AuthProvider.GITHUB) throw new APIError(`this Email is Already Provided by ${user?.provider}`, 400);
    if (!user) {
      user = await this.userRepository.create({
        providerId: id,
        name: displayName,
        email: username,
        photo,
        password: null,
        refreshToken: null,
        provider: AuthProvider.GITHUB,
        verified: true,
      });
    }
    return user;
  };
  GitHubCallBack = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.user)      
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const user = req.user as IUser;
      const { accessToken, refreshToken } = JWTService.generateTokens(user.id);
      this.userRepository.saveRefreshToken(user.id, refreshToken);
      JWTService.setTokenCookies(res, accessToken, refreshToken);
      const { refreshToken: userRefreshToken, password, ...userWithoutRefreshToken } = user;
      res.json({userWithoutRefreshToken, accessToken})
    } catch (error: any) {
      next(error);
    }
  }
}
export default GitHubUseCase;