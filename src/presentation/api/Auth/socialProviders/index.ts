import express from 'express';
import Google from './Google';
import GitHub from './GitHub';
const router = express.Router();

router.use('/google', Google);
router.use('/github', GitHub);

export default router;