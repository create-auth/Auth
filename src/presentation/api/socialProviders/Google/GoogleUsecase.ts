import { NextFunction, Request, Response } from "express";
import UserRepository from "../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository";
import { AuthProvider } from "@prisma/client";
import APIError from "../../../../application/Errors/APIError";
import IUser from "../../../../domain/model/IUser";
import JWTService from "../../../../application/JWTUsecase";
import dotenv from 'dotenv';

dotenv.config();

class GoogleUseCase {
  constructor(private readonly userRepository: UserRepository) { }
  GoogleSignIn = async (profile: any) => {
    const { id, displayName, emails, photos } = profile;
    const email = emails[0].value;
    const photo = photos[0].value;

    let userByProvider = await this.userRepository.getByProviderId(id);
    if (userByProvider) {
      if (userByProvider && userByProvider?.provider !== AuthProvider.GOOGLE) throw new APIError(`this Email is Already Provided by ${userByProvider?.provider}`, 400);
      if (!userByProvider) {
        userByProvider = await this.userRepository.create({
          providerId: id,
          name: displayName,
          email,
          photo,
          password: null,
          refreshToken: null,
          provider: AuthProvider.GOOGLE,
          verified: true,
        });
      }
      return userByProvider;
    }else {
      let user = await this.userRepository.getByEmail(email);
      if (user && user?.provider !== AuthProvider.GOOGLE) throw new APIError(`this Email is Already Provided by ${user?.provider}`, 400);
      if (!user) {
        user = await this.userRepository.create({
          providerId: id,
          name: displayName,
          email,
          photo,
          password: null,
          refreshToken: null,
          provider: AuthProvider.GOOGLE,
          verified: true,
        });
      }
      return user;
    }
  };
  GoogleCallBack = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const user = req.user as IUser;
      const { accessToken, refreshToken } = JWTService.generateTokens(user.id);
      this.userRepository.saveRefreshToken(user.id, refreshToken);
      JWTService.setTokenCookies(res, accessToken, refreshToken);
      const { refreshToken: userRefreshToken, password, ...userWithoutRefreshToken } = user;
      res.status(200).json({userWithoutRefreshToken, accessToken})
    } catch (error: any) {
      next(error);
    }
  }
}
export default GoogleUseCase;