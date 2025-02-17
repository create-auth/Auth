import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import UserRepository from '../../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository';
import UserUseCase from '../../../../../application/UserUsecase';
import GitHubUseCase from './GitHubUsecase';
import dotenv from 'dotenv';

dotenv.config();

const userRepository = new UserRepository();
const userUsecase = new UserUseCase(userRepository);
const gitHubUseCase = new GitHubUseCase(userRepository, userUsecase);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            callbackURL: process.env.GITHUB_CALLBACK_URL!,
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
                const user = await gitHubUseCase.GitHubSignIn(profile);
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    ));

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