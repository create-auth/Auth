import { IVerificationSession } from "../../domain/model/IVerificationSession";
import { IVerificationStorage } from "../../domain/repository/IVerificationStorage ";

export class InMemoryVerificationStorage implements IVerificationStorage {
    private sessions: Map<string, { session: IVerificationSession, expiresAt: number }> = new Map();
  
    async isAvailable(): Promise<boolean> {
      return true;
    }
  
    async saveSession(sessionId: string, session: IVerificationSession, expirySeconds: number): Promise<void> {
      const expiresAt = Date.now() + expirySeconds * 1000;
      this.sessions.set(`verification:${sessionId}`, { session, expiresAt });
      
      setTimeout(() => {
        this.sessions.delete(`verification:${sessionId}`);
      }, expirySeconds * 1000);
    }
  
    async getSession(sessionId: string): Promise<IVerificationSession | null> {
      const data = this.sessions.get(`verification:${sessionId}`);
      if (!data) return null;
      
      if (data.expiresAt < Date.now()) {
        this.sessions.delete(`verification:${sessionId}`);
        return null;
      }
      
      return data.session;
    }
  
    async deleteSession(sessionId: string): Promise<void> {
      this.sessions.delete(`verification:${sessionId}`);
    }
  
    async findSessionsByEmail(email: string): Promise<{sessionId: string, session: IVerificationSession}[]> {
      const results: {sessionId: string, session: IVerificationSession}[] = [];
      const now = Date.now();
      
      this.sessions.forEach((data, key) => {
        if (data.expiresAt < now) {
          this.sessions.delete(key);
          return;
        }
        
        if (data.session.email === email) {
          const sessionId = key.replace('verification:', '');
          results.push({ sessionId, session: data.session });
        }
      });
      
      return results;
    }
  }
  
  