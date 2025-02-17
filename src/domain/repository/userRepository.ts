import IUser from "../model/IUser";

interface IUserRepository {
  create(data: any): Promise<any>;
  get(id: string): Promise<any>;
  getByEmail(email: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<any>;
  getrefreshToken(userId: string, refreshToken: string): Promise<any>;
  deleteRefreshToken(userId: string): Promise<void>;
  saveRefreshToken(userId: string, refreshToken: string): Promise<void>;
  verifyEmail(email: string): Promise<IUser | void>;
  getByProviderId(id: string): Promise<IUser | null>;
}

export default IUserRepository;
