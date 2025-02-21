import { NextFunction, Request, Response } from "express";
import UserRepository from "../../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository";
import { AuthProvider } from "@prisma/client";
import APIError from "../../../../../application/Errors/APIError";
import IUser from "../../../../../domain/model/IUser";
import JWTService from "../../../../../application/JWTUsecase";
import UserUseCase from "../../../../../application/UserUsecase";
import dotenv from 'dotenv';

dotenv.config();

class FaceBookUseCase {
  constructor(private readonly userRepository: UserRepository, private readonly userUsecase: UserUseCase) { }
  FaceBookSignIn = async (profile: any) => {
    const { id, displayName, photos } = profile;
    const photo = photos[0].value;
    let user = await this.userRepository.getByProviderId(id);

    if (user && user?.provider !== AuthProvider.FACEBOOK) throw new APIError(`this Email is Already Provided by ${user?.provider}`, 400);
    if (!user) {
      user = await this.userRepository.create({
        providerId: id,
        name: displayName,
        email: displayName,
        photo,
        password: null,
        refreshToken: null,
        provider: AuthProvider.FACEBOOK,
        verified: true,
      });
    }
    return user;
  };
  FaceBookCallBack = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const user = req.user as IUser;
      const { accessToken, refreshToken } = JWTService.generateTokens(user.id);
      this.userUsecase.saveRefreshToken(user.id, refreshToken);
      JWTService.setTokenCookies(res, accessToken, refreshToken);
      console.log(user, accessToken)
      const { refreshToken: userRefreshToken, password, ...userWithoutRefreshToken } = user;
      res.status(200).json({userWithoutRefreshToken, accessToken})/* .redirect(`${process.env.REDIRECT_URL_ON_SUCCESS}facebook/callback?token=${accessToken}&user=${JSON.stringify(userWithoutRefreshToken)}`); */
    } catch (error: any) {
      next(error);
    }
  }
}
export default FaceBookUseCase;