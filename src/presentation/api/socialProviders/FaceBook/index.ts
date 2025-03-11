import passport from "passport";
import express from "express";
import UserRepository from '../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository';
import FaceBookUseCase from './FaceBookUsecase';

const router = express.Router();

const userRepository = new UserRepository();
const faceBookUseCase = new FaceBookUseCase(userRepository);

router.get('/', passport.authenticate('facebook'));
router.get('/callback', passport.authenticate('facebook', { failureRedirect: process.env.REDIRECT_URL_ON_FAIL!}),faceBookUseCase.FaceBookCallBack);

export default router;