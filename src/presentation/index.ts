import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import apiRouter from './api';
import session from 'express-session';
import https from 'https';
import fs from 'fs';
import path from 'path';
import passport from 'passport';

import './api/socialProviders/Google/GoogleAuth';
import './api/socialProviders/GitHub/GitHubAuth';
import './api/socialProviders/FaceBook/FaceBookAuth';
dotenv.config();


function main() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: true, httpOnly: true, sameSite: 'strict' },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/', (req, res) => {
    res.send(`
      <a href="/api/v1/social/google">Google</a>
      <a href="/api/v1/social/github">GitHub</a>
      <a href="/api/v1/social/facebook">Facebook</a>
    `);
  });

  app.use('/api/v1', apiRouter);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({ error: err.message || 'Internal Server Error' });
    next();
  });

  let sslOptions;
  try {
    sslOptions = {
      key: fs.readFileSync(path.join(__dirname, '../../server.key')),
      cert: fs.readFileSync(path.join(__dirname, '../../server.cert')),
    };
  } catch (error) {
    console.error('Error loading SSL certificates:', error);
    process.exit(1);
  }

  const port = process.env.PORT || 3000;
  https.createServer(sslOptions, app).listen(port, () => {
    console.log(`Server is running at https://localhost:${port}`);
  });
}

export default main;

