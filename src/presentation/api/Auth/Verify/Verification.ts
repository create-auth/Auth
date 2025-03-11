import { NextFunction, Request, Response } from "express";
import ValidationUseCase from "../../../../application/IVerificationStorage/validationUsecase";
import UserUseCase from "../../../../application/UserUsecase";
import JWTUsecase from "../../../../application/JWTUsecase";
class VerificationController {
    constructor(private readonly userUseCase: UserUseCase, private readonly validationUseCase: ValidationUseCase) { }

    sendCode = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.body);
            const { email } = req.body;
            const IsEmailVerified = await this.userUseCase.getUserByEmail(email);
            if (IsEmailVerified?.verified) return res.status(400).json({ error: 'Email already verified' });
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
            const IsEmailVerified = await this.userUseCase.getUserByEmail(email);
            if (IsEmailVerified?.verified) return res.status(400).json({ error: 'Email already verified' });
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
                accessToken,
                user
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export default VerificationController;