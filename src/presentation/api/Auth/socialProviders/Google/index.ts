import express from 'express';

import passport from 'passport';
import UserUseCase from '../../../../../application/UserUsecase';
import UserRepository from '../../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository';
import GoogleUseCase from './GoogleUsecase';
const router = express.Router();

const userRepository = new UserRepository();
const userUsecase = new UserUseCase(userRepository);
const googleUseCase = new GoogleUseCase(userRepository, userUsecase);

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/callback', passport.authenticate('google', { failureRedirect: process.env.REDIRECT_URL_ON_FAIL! }), googleUseCase.GoogleCallBack);

export default router;