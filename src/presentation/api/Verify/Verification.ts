import { NextFunction, Request, Response } from "express";
import ValidationUseCase from "../../../application/validationUsecase";

class VerificationController {
    static async sendCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            const validationUseCase = new ValidationUseCase();
            await validationUseCase.sendVerificationEmail(email);

            res.status(200).json({ message: 'Verification code sent successfully' });
        } catch (error: any) {
            next(error);
        }
    }

    static async verifyCode(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                return res.status(400).json({
                    error: 'Email and verification code are required'
                });
            }
            await ValidationUseCase.verifyCode(email, code);

            res.status(200).json({
                message: 'Code verified successfully',
                verified: true
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export default VerificationController;