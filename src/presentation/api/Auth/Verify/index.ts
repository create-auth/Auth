import express from 'express';
import dotenv from 'dotenv';
import VerificationController from './Verification';
import UserUsecase from '../../../../application/UserUsecase';
import UserRepository from '../../../../infrastructure/prisma/prismaRepositories/PrismaUserRepository';
import ValidationUseCase from '../../../../application/IVerificationStorage/validationUsecase';
dotenv.config();
const router = express.Router();
const userRepository = new UserRepository();
const userUsecase = new UserUsecase(userRepository);
const validationUseCase = new ValidationUseCase();
const verificationController = new VerificationController(userUsecase, validationUseCase);


router.post('/send-code', verificationController.sendCode);
router.post('/verify-code', verificationController.verifyCode);


export default router;
