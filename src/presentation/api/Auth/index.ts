import express from 'express';
import UserAuthentication from './Authentication';
import UserUsecase from '../../../application/UserUsecase';
import UserRepository from '../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

const userRepository = new UserRepository();
const userUsecase = new UserUsecase(userRepository);
const userAuthentication = new UserAuthentication(userUsecase); 

router.post('/register', userAuthentication.registerUser);
router.post('/login', userAuthentication.loginUser);
router.get('/refresh', userAuthentication.generateNewAccessToken);
router.post('/logout', userAuthentication.logoutUser);
export default router;
