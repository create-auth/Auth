import { NextFunction, Request, Response } from "express";
import ValidationUseCase from "../../../application/validationUsecase";
import UserUseCase from "../../../application/UserUsecase";
import JWTUsecase from "../../../application/JWTUsecase";
class VerificationController {
    constructor(private readonly userUseCase: UserUseCase, private readonly validationUseCase: ValidationUseCase) { }

    sendCode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            await this.validationUseCase.sendVerificationEmail(email);

            res.status(200).json({ message: 'Verification code sent successfully' });
        } catch (error: any) {
            next(error);
        }
    }

    verifyCode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                return res.status(400).json({
                    error: 'Email and verification code are required'
                });
            }
            await this.validationUseCase.verifyCode(email, code);
            const user = await this.userUseCase.verifyEmail(email);
            if (!user) {
                return res.status(400).json({
                    error: 'Email not found'
                });
            }
            const { accessToken, refreshToken } = JWTUsecase.generateTokens(user.id);
            this.userUseCase.saveRefreshToken(user.id, refreshToken);
            JWTUsecase.setTokenCookies(res, accessToken, refreshToken);
            res.status(200).json({
                message: 'Code verified successfully and email is verified',
                verified: true,
                accessToken
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export default VerificationController;