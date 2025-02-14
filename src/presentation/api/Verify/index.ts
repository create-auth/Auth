import express from 'express';
import dotenv from 'dotenv';
import VerificationController from './Verification';
dotenv.config();
const router = express.Router();

router.post('/send-code', VerificationController.sendCode);
router.post('/verify-code', VerificationController.verifyCode);


export default router;
