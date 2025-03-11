import { Response } from 'express';
import jwt from 'jsonwebtoken';

class JWTService {
    static generateTokens(id: string) {
        const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '5s' });
        const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '5m' });

        return { accessToken, refreshToken };
    }

    static setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        }); // 7 days
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60 * 1000
        }); // 5 minutes
    }
}

export default JWTService;
