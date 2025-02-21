import passport from "passport";
import express from "express";
import UserUseCase from '../../../../../application/UserUsecase';
import UserRepository from '../../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository';
import FaceBookUseCase from '../FaceBook/FaceBookUsecase';

const router = express.Router();

const userRepository = new UserRepository();
const userUsecase = new UserUseCase(userRepository);
const faceBookUseCase = new FaceBookUseCase(userRepository, userUsecase);

router.get('/', passport.authenticate('facebook'));
router.get('/callback', passport.authenticate('facebook', { failureRedirect: process.env.REDIRECT_URL_ON_FAIL!}),faceBookUseCase.FaceBookCallBack);

export default router;
  