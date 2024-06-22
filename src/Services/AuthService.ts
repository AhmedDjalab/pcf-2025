import { jwtDecode } from "jwt-decode";
import secureLocalStorage from "react-secure-storage";

import {
  CompanyKey,
  ExternalLoginUrl,
  LicenseKey,
  loginUrl,
  putUserserUrl,
  refreshTokens,
  tokenKeys,
} from "src/variables/Urls";
import RoleException from "src/utils/RoleException";
import axios from "axios";
import api from "src/utils/api";
const apiEndpoint = loginUrl;

export interface CheckForgetPasswordCodeCommand {
  password: string;
  confirmPassword: string;
  email: string;
  token: string;
}
//// why you set jwt here ???!!!!!

// http.setJwt(getJwt());
export function saveJwtToken(jwt: string) {
  secureLocalStorage.setItem(tokenKeys, jwt);
}
export async function login(email: string, password: string) {
  const { data: user } = await axios
    .post(loginUrl, {
      email: email,
      password: password,
    })
    .then((responce) => {
      return responce;
    })
    .catch((error) => {
      return error;
    });

  let roleName = user.role;

  if (roleName === "SuperAdmin") {
    secureLocalStorage.setItem(tokenKeys, user.token);

    //secureLocalStorage.setItem(refreshTokens, jwt.refreshToken);
    //hubOpenConnection(jwt.token);
  } else {
    // console.log("role errror ");
    throw new RoleException("your not authrized to login to this page ");
  }
}

export async function loginWithMicrosoft() {
  const provider = "Microsoft";
  const returnUrl = "/";
  try {
    const response = await api.post(ExternalLoginUrl, { provider, returnUrl });
    if (response.data && response.data.Url) {
      window.location.href = response.data.Url;
    } else {
      console.error("No redirect URL found in the response.");
    }
  } catch (error) {
    console.error("Error initiating login:", error);
  }
}
// export function sendSms(number) {
//   return http.post(apiEndpoint + '/sendSmsCode', {
//     countryCode: 213,
//     phoneNumber: number,
//   });
// }

export function saveJwt(jwt: string) {
  secureLocalStorage.setItem(tokenKeys, jwt);
}

export function logout() {
  CleanJwt();
}
export function getRefreshToken() {
  return secureLocalStorage.getItem(refreshTokens);
}

// export function saveRefreshToken(refreshToken) {
//   secureLocalStorage.setItem(refreshTokens, refreshToken);
// }

export function getCurrentUser() {
  try {
    const jwt = secureLocalStorage.getItem(tokenKeys);
    if (jwt) {
      return jwtDecode(jwt.toString());
    }
  } catch (ex) {
    return null;
  }
}

export function getJwt() {
  return secureLocalStorage.getItem(tokenKeys);
}

export function getCompanyId() {
  return secureLocalStorage.getItem(CompanyKey);
}
export function CleanJwt() {
  secureLocalStorage.removeItem(tokenKeys);
  secureLocalStorage.removeItem(CompanyKey);
  secureLocalStorage.removeItem(refreshTokens);
  secureLocalStorage.removeItem(LicenseKey);
}

export const isLogged = () => {
  return getJwt() !== null;
};

export const forgetPassword = async ({
  email,
  callback,
}: {
  email: string;
  callback: string;
}) => {
  const data = await api.post(putUserserUrl + "/ForgetPassword", {
    email: email,
    callback: callback,
  });
  return data;
};
export const resetPassword = async ({
  email,
  token,
  password,
  confirmPassword,
}: CheckForgetPasswordCodeCommand) => {
  const data = await api.post(putUserserUrl + "/ResetPassword", {
    email,
    token,
    password,
    confirmPassword,
  });
  return data;
};

export default {
  login,

  logout,
  getCurrentUser,
  getJwt,
  CleanJwt,
};
