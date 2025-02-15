import { NextFunction, Request, Response } from "express";
import UserRepository from "../../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository";
import { AuthProvider } from "@prisma/client";
import APIError from "../../../../../application/Errors/APIError";

class GoogleUseCase {
  constructor(private readonly userRepository: UserRepository) { }
  GoogleSignIn = async (profile: any) => {
    const { id, displayName, emails, photos } = profile;
    const email = emails[0].value;
    const photo = photos[0].value;

    let user = await this.userRepository.getByEmail(email);
    if (user?.provider !== AuthProvider.GOOGLE) throw new APIError(`this Email is Already Provided by ${user?.provider}`, 400);
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
  };
}
export default GoogleUseCase;