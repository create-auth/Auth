import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import GoogleUseCase from './GoogleUsecase';
import UserRepository from "../../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository";

dotenv.config();

const userRepository = new UserRepository();
const googleUseCase = new GoogleUseCase(userRepository);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const user = await googleUseCase.GoogleSignIn(profile);
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id)
});
passport.deserializeUser(async (user: any, done) => {
  try {
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
export default passport;