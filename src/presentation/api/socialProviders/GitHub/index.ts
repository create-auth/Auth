import passport from "passport";
import express from "express";
import UserRepository from '../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository';
import GitHubUseCase from './GitHubUsecase';

const router = express.Router();

const userRepository = new UserRepository();
const gitHubUseCase = new GitHubUseCase(userRepository);

router.get('/', passport.authenticate('github', { scope: [ 'user:email' ] }));
router.get('/callback', passport.authenticate('github', { failureRedirect: process.env.REDIRECT_URL_ON_FAIL! }),gitHubUseCase.GitHubCallBack);

export default router;