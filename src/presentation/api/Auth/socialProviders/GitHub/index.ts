import passport from "passport";
import express from "express";
import UserUseCase from '../../../../../application/UserUsecase';
import UserRepository from '../../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository';
import GitHubUseCase from '../GitHub/GitHubUsecase';

const router = express.Router();

const userRepository = new UserRepository();
const userUsecase = new UserUseCase(userRepository);
const gitHubUseCase = new GitHubUseCase(userRepository, userUsecase);

router.get('/', passport.authenticate('github', { scope: [ 'user:email' ] }));
router.get('/callback', passport.authenticate('github', { failureRedirect: process.env.GOOGLE_REDIRECT_URL_ON_FAIL! }),gitHubUseCase.GitHubCallBack);

export default router;
  