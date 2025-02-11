import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import auth from './Auth';
import cookieParser from 'cookie-parser';
dotenv.config();

import product from './product';
import AuthToken from './Auth/Authorization';

function main() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  app.get('/', (req, res) => {
    return res.json({
      message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
    });
  });

  const apiRouter = express.Router();

  apiRouter.use('/products', AuthToken, product);
  apiRouter.use('/auth', auth);
  app.use('/api/v1', apiRouter);

  app.use((err: any, req: Request, res:Response, _next: NextFunction) => {
    res.status(err.status).json({ message: err.message });
  });

  app.listen(port, () => {
    console.log(`Listening: http://localhost:${port}`);
  });
}

export default main;

