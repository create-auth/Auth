import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import apiRouter from './api';
import Googlepassport from '../presentation/api/Auth/socialProviders/Google/GoogleAuth';
import GitHubpassport from '../presentation/api/Auth/socialProviders/GitHub/GitHubAuth';
import FaceBookAuth from '../presentation/api/Auth/socialProviders/FaceBook/FaceBookAuth';
import session from 'express-session';
import https from 'https';
import fs from 'fs';
import path from 'path';
dotenv.config();


function main() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  }));
  
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, '../../server.key')),
    cert: fs.readFileSync(path.join(__dirname, '../../server.cert')),
  };

  app.use(express.json());
  app.use(cookieParser());
  app.use(session({ secret: process.env.SESSION_SECRET!, resave: false, saveUninitialized: false }));
  app.use(Googlepassport.initialize());
  app.use(GitHubpassport.initialize());
  app.use(FaceBookAuth.initialize());
  app.use(Googlepassport.session());
  app.use(GitHubpassport.session());
  app.use(FaceBookAuth.session());

  
  app.get('/', (req, res) => {
    return res.send('<a href="/api/v1/social/google">Google</a><a href="/api/v1/social/github"> GitHub</a><a href="/api/v1/social/facebook"> FaceBook</a>');
  });

  // const apiRouter = express.Router();

  // apiRouter.use('/products', AuthorizationController.AuthToken, product);
  // apiRouter.use('/verify', verify);
  // apiRouter.use('/auth', auth);
    
  app.use('/api/v1', apiRouter);

  app.use((err: any, req: Request, res:Response, _next: NextFunction) => {
    res.status(err.status).json({ message: err.message });
  });

  https.createServer(sslOptions, app).listen(port, () => {
    console.log(`Listening: https://localhost:${port}`);
  });
}

export default main;

