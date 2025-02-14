import { AuthProvider } from "@prisma/client";
interface IUser {
  id: string;
  providerId: string | null;
  name: string;
  email: string;
  password: string | null;
  refreshToken: string | null;
  provider: AuthProvider;
  active: Boolean;
  code: string | null;
}

export default IUser;
