import express from 'express';
import Google from './Google';
import GitHub from './GitHub';
import FaceBook from './FaceBook';
const router = express.Router();

router.use('/google', Google);
router.use('/github', GitHub);
router.use('/facebook', FaceBook);

export default router;