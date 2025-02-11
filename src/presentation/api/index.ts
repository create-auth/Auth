import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import product from './product';

function main() {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    return res.json({
      message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
    });
  });

  const apiRouter = express.Router();

  apiRouter.use('/products', product);

  app.use('/api/v1', apiRouter);

  // @ts-ignore
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  app.use((err, req, res, _next) => {
    res.status(err.status).json({ message: err.message });
  });

  app.listen(port, () => {
    console.log(`Listening: http://localhost:${port}`);
  });
}

export default main;

