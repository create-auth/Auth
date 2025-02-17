import { NextFunction, Request, Response } from "express";
import UserRepository from "../../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository";
import { AuthProvider } from "@prisma/client";
import APIError from "../../../../../application/Errors/APIError";
import IUser from "../../../../../domain/model/IUser";
import JWTService from "../../../../../application/JWTUsecase";
import UserUseCase from "../../../../../application/UserUsecase";
import dotenv from 'dotenv';

dotenv.config();

class GitHubUseCase {
  constructor(private readonly userRepository: UserRepository, private readonly userUsecase: UserUseCase) { }
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
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const user = req.user as IUser;
      const { accessToken, refreshToken } = JWTService.generateTokens(user.id);
      this.userUsecase.saveRefreshToken(user.id, refreshToken);
      JWTService.setTokenCookies(res, accessToken, refreshToken);
      res.status(200).redirect(`${process.env.REDIRECT_URL_ON_SUCCESS!}gitHub/callback?token=${accessToken}&user=${JSON.stringify(user)}`);
    } catch (error: any) {
      next(error);
    }
  }
}
export default GitHubUseCase;