import { AuthProvider } from "@prisma/client";
interface IUser {
  id: string;
  providerId: string | null;
  name: string;
  email: string | null;
  password: string | null;
  refreshToken: string | null;
  provider: AuthProvider;
  verified: Boolean;
}

export default IUser;