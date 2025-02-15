import express from 'express';
import AuthorizationController from './Auth/Authorization';
import auth from './Auth';
import verify from './Verify';
import product from './product';
import social from './Auth/socialProviders/Google';
import UserUseCase from '../../application/UserUsecase';
import UserRepository from '../../infrastructure/prisma/prismaRepositories/PrismaUserRepository';

const apiRouter = express.Router();

const userRepository = new UserRepository();
const userUsecase = new UserUseCase(userRepository);
const authorizationController = new AuthorizationController(userUsecase);
apiRouter.use('/products', authorizationController.AuthToken, product);
apiRouter.use('/verify', verify);
apiRouter.use('/auth', auth);
apiRouter.use('/social', social);

export default apiRouter;