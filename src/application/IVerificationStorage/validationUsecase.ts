import { IVerificationSession } from "../../domain/model/IVerificationSession";
import { IVerificationStorage } from "../../domain/repository/IVerificationStorage ";
import APIError from "../Errors/APIError";
import { StorageFactory } from "./StorageFactory";
import EmailTemplate from "../../../public/template/emailTemplate";
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

class ValidationUseCase {
  private static MAX_ATTEMPTS = 3;
  private storage: IVerificationStorage;

  constructor(storage?: IVerificationStorage) {
    this.storage = storage || StorageFactory.createStorage();
  }

  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async createVerificationSession(email: string): Promise<string> {
    const isAvailable = await this.storage.isAvailable();
    if (!isAvailable) {
      throw new APIError('Storage service is not available', 500);
    }

    const code = ValidationUseCase.generateVerificationCode();
    const sessionId = uuid();

    const session: IVerificationSession = {
      email,
      code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes
      attempts: 0
    };

    try {
      await this.storage.saveSession(sessionId, session, 300); // 5 minutes in seconds
      return code;
    } catch (error) {
      throw new APIError(`Failed to create verification session: ${error}`, 500);
    }
  }

  async sendVerificationEmail(email: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    try {
      const code = await this.createVerificationSession(email);
      await transporter.sendMail({
        from: `"Auth" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Login Verification Code',
        html: EmailTemplate(code, new Date()),
      });
    } catch (error) {
      throw new APIError(`Failed to send verification email: ${error}`, 400);
    }
  }

  async verifyCode(email: string, code: string): Promise<boolean> {
    try {
      const sessions = await this.storage.findSessionsByEmail(email);
      
      if (sessions.length === 0) {
        throw new APIError('No active verification session found', 404);
      }

      for (const { sessionId, session } of sessions) {
        if (new Date(session.expiresAt) < new Date()) {
          await this.storage.deleteSession(sessionId);
          continue;
        }

        const attempts = session.attempts || 0;
        if (attempts >= ValidationUseCase.MAX_ATTEMPTS) {
          await this.storage.deleteSession(sessionId);
          throw new APIError('Too many failed attempts. Please request a new code.', 401);
        }

        if (session.code !== code) {
          session.attempts = attempts + 1;
          await this.storage.saveSession(
            sessionId,
            session,
            Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000)
          );
          throw new APIError(`Invalid code. ${ValidationUseCase.MAX_ATTEMPTS - session.attempts} attempts remaining.`, 401);
        }

        await this.storage.deleteSession(sessionId);
        return true;
      }

      throw new APIError('No valid verification session found', 404);
    } catch (error) {
      if (error instanceof APIError) throw error;
      throw new APIError(`Verification failed: ${error}`, 500);
    }
  }
}

export default ValidationUseCase;
