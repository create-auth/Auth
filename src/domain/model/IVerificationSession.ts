export interface IVerificationSession {
    email: string;
    code: string;
    expiresAt: Date;
    attempts?: number;
}