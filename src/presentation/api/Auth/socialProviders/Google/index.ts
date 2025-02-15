import express from 'express';

import passport from 'passport';
import JWTService from '../../../../../application/JWTUsecase';
import UserUseCase from '../../../../../application/UserUsecase';
import PrismaUserRepository from '../../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository';
import IUser from '../../../../../domain/model/IUser';
const router = express.Router();

const userRepository = new PrismaUserRepository();
const userUsecase = new UserUseCase(userRepository);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), 
(req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
      const user = req.user as IUser;
      const { accessToken, refreshToken } = JWTService.generateTokens(user.id);
      userUsecase.saveRefreshToken(user.id, refreshToken);
      JWTService.setTokenCookies(res, accessToken, refreshToken);
      res.status(200).json({ user, accessToken });
    } catch (error: any) {
      next(error);
    }
  });

export default router;