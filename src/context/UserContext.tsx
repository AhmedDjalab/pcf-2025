import {
  AuthUserKey,
  CompanyKey,
  LicenseKey,
  loginUrl,
  tokenKeys,
} from "src/variables/Urls";
import { createContext, useState, useContext, useEffect } from "react";
import api from "src/utils/api";

// import { getLicense, getLicenseByUserId } from "@/services/LicenseService";
import secureLocalStorage from "react-secure-storage";
import { User } from "src/types/user";
import { UserRoles } from "src/enums/UsersRole";
import { getLicenseByUserId } from "src/Services/LicenseService";
import toast from "react-hot-toast";

// interface AuthContextType {
//   token: string | null;
//   login: (email: string, password: string) => void;
//   logout: () => void;
//   signed: boolean;
// }

export type LoginType = {
  email: string;
  password: string;
};
export interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  Login: ({}: LoginType) => Promise<boolean>;
  logout: () => void;
  isAdmin?: boolean;
  canRead?: boolean;
  canWrite?: boolean;
}
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStorageData() {
      const storageUser = secureLocalStorage.getItem(AuthUserKey);
      const storageToken = secureLocalStorage.getItem(tokenKeys);

      if (storageUser && storageToken) {
        setUser(JSON.parse(storageUser.toString()!));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  const Login = async ({ email, password }: any) => {
    try {
      const { data: userData } = await api.post(loginUrl, {
        email: email,
        password: password,
      });

      let roleName = userData.role;
      let userId = userData.id;
      const claims = userData.claims;
      //? we have two cases : emplyee , company
      if (roleName === UserRoles.Admin) {
        setUser(userData);
        //secureLocalStorage.setItem(refreshTokens, jwt.refreshToken);
        //hubOpenConnection(jwt.token);
      } else {
        if (roleName === UserRoles.Employee) {
        }
      }
      // check validity of license
      let licenses = await getLicenseByUserId(userId, roleName);
      if (!licenses || !licenses?.isValidLicense) {
        toast.error("your License has Been expired please call the support ");
        // window.location.href = '/auth/login';
      }

      // get the list of module types
      secureLocalStorage.setItem(tokenKeys, userData.token);
      secureLocalStorage.setItem(LicenseKey, licenses!.id);
      secureLocalStorage.setItem(CompanyKey, licenses!.companyId);
      secureLocalStorage.setItem(AuthUserKey, JSON.stringify(userData));

      setUser(userData);
      window.location.href = "/";

      return true;
      //return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    secureLocalStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        Login,
        logout,
        isAdmin: user?.role === UserRoles.Admin,
        canRead: user?.canRead,
        canWrite: user?.canWrite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
export const IsAuth = () => {
  const storageToken = secureLocalStorage.getItem(tokenKeys);

  if (storageToken) {
    return true;
  }
  return false;
};
