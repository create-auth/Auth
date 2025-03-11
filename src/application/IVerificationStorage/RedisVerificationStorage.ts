import Redis from "ioredis";
import { IVerificationStorage } from "../../domain/repository/IVerificationStorage ";
import { IVerificationSession } from "../../domain/model/IVerificationSession";
import APIError from "../../application/Errors/APIError";

export class RedisVerificationStorage implements IVerificationStorage {
    private redis: Redis;
  
    constructor(redisUrl: string) {
      this.redis = new Redis(redisUrl, { keepAlive: 10000 });
    }
  
    async isAvailable(): Promise<boolean> {
      try {
        await this.redis.ping();
        return true;
      } catch (error) {
        return false;
      }
    }
  
    async saveSession(sessionId: string, session: IVerificationSession, expirySeconds: number): Promise<void> {
      try {
        await this.redis.setex(
          `verification:${sessionId}`,
          expirySeconds,
          JSON.stringify(session),
        );
      } catch (error) {
        throw new APIError(`Failed to save session: ${error}`, 500);
      }
    }
  
    async getSession(sessionId: string): Promise<IVerificationSession | null> {
      try {
        const data = await this.redis.get(`verification:${sessionId}`);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        throw new APIError(`Failed to get session: ${error}`, 500);
      }
    }
  
    async deleteSession(sessionId: string): Promise<void> {
      try {
        await this.redis.del(`verification:${sessionId}`);
      } catch (error) {
        throw new APIError(`Failed to delete session: ${error}`, 500);
      }
    }
  
    async findSessionsByEmail(email: string): Promise<{sessionId: string, session: IVerificationSession}[]> {
      try {
        const keys = await this.redis.keys('verification:*');
        const results: {sessionId: string, session: IVerificationSession}[] = [];
  
        for (const key of keys) {
          const data = await this.redis.get(key);
          if (!data) continue;
  
          const session = JSON.parse(data) as IVerificationSession;
          if (session.email === email) {
            const sessionId = key.replace('verification:', '');
            results.push({ sessionId, session });
          }
        }
  
        return results;
      } catch (error) {
        throw new APIError(`Failed to find sessions: ${error}`, 500);
      }
    }
  }
  