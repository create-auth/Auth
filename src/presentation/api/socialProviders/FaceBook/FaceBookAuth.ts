import passport from 'passport';
import { Strategy as  FacebookStrategy} from 'passport-facebook';
import UserRepository from '../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository';
import FaceBookUseCase from './FaceBookUsecase';
import dotenv from 'dotenv';

dotenv.config();

const userRepository = new UserRepository();
const faceBookUseCase = new FaceBookUseCase(userRepository);

passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
            profileFields: ['id', 'displayName', 'photos', 'email']
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
                const user = await faceBookUseCase.FaceBookSignIn(profile);
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