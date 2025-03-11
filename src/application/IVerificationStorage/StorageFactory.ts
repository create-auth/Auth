import { IVerificationStorage } from "../../domain/repository/IVerificationStorage ";
import { InMemoryVerificationStorage } from "./InMemoryVerificationStorage";
import { RedisVerificationStorage } from "./RedisVerificationStorage";
import dotenv from 'dotenv';

dotenv.config();

export class StorageFactory {
    static createStorage(): IVerificationStorage {
      if (process.env.REDIS_URL) {
        try {
          const redisStorage = new RedisVerificationStorage(process.env.REDIS_URL);
          return redisStorage;
        } catch (error) {
          console.warn(`Failed to initialize Redis storage: ${error}. Falling back to in-memory storage.`);
        }
      }
      return new InMemoryVerificationStorage();
    }
  }
  