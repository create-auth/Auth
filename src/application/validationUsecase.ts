import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import APIError from './Errors/APIError';
import EmailTemplate from '../../public/template/emailTemplate';
dotenv.config();

interface IVerificationSession {
  email: string;
  code: string;
  expiresAt: Date;
  attempts?: number;
}

class ValidationUseCase {
  private static redis: Redis;
  private static MAX_ATTEMPTS = 3;
  // Initialize Redis connection
  private static async getRedisConnection(): Promise<Redis> {
    if (!this.redis) {
      try {
        this.redis = new Redis(process.env.REDIS_URL!);
        await this.redis.ping(); // Test connection
      } catch (error) {
        throw new APIError(`Redis connection failed: ${error}`, 500);
      }
    }
    return this.redis;
  }

  private static async createVerificationSession(email: string): Promise<string> {
    const redis = await this.getRedisConnection();
    const code = this.generateVerificationCode();
    const sessionId = uuid();

    const session: IVerificationSession = {
      email,
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 5) // 5 minutes
    };

    try {
      await redis.setex(
        `verification:${sessionId}`,
        300, // 5 minutes in seconds
        JSON.stringify(session)
      );
      return code;
    } catch (error) {
      throw new APIError(`Failed to create verification session: ${error}`, 500);
    }
  }

  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationEmail(email: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    try {
      const code = await ValidationUseCase.createVerificationSession(email);
      await transporter.sendMail({
        from: `"Auth" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Login Verification Code',
        html: EmailTemplate(code, new Date())
      });
    } catch (error) {
      throw new APIError(`Failed to send verification email: ${error}`, 400);
    }
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    const redis = await ValidationUseCase.getRedisConnection();

    try {
      // Get all keys matching the email pattern
      const keys = await redis.keys(`verification:*`);

      for (const key of keys) {
        const sessionData = await redis.get(key);
        if (!sessionData) continue;

        const session: IVerificationSession = JSON.parse(sessionData);

        // Check if this session belongs to the email
        if (session.email !== email) continue;

        // Check if session has expired
        if (new Date(session.expiresAt) < new Date()) {
          await redis.del(key);
          throw new APIError('Verification code has expired', 401);
        }

        // Check attempts
        const attempts = session.attempts || 0;
        if (attempts >= ValidationUseCase.MAX_ATTEMPTS) {
          await redis.del(key);
          throw new APIError('Too many failed attempts. Please request a new code.', 401);
        }

        // Verify code
        if (session.code !== code) {
          // Increment attempts
          session.attempts = attempts + 1;
          await redis.setex(
            key,
            300, // 5 minutes
            JSON.stringify(session)
          );
          throw new APIError(`Invalid code. ${ValidationUseCase.MAX_ATTEMPTS - session.attempts} attempts remaining.`, 401);
        }

        // Code is correct - clean up the session
        await redis.del(key);
        return true;
      }

      throw new APIError('No active verification session found', 404);
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(`Verification failed: ${error}`, 500);
    }
  }

}

export default ValidationUseCase;