import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../Helpers/firebase";
import { IsAuth, useAuth } from "../context/UserContext";
import { FirebaseError } from "firebase/app";
import logo from "../assets/Logo/logo.png";
import { useTranslation } from "react-i18next";
import { loginWithMicrosoft } from "src/Services/AuthService";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const { Login: LoginFn, user } = useAuth();
  const { t } = useTranslation();
  const isLogged = IsAuth();
  useEffect(() => {
    if (isLogged && user && !window.location.pathname.includes("/")) {
      navigate("/");
    }
  }, [isLogged, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoader(true);

    if (!validateEmail(email)) {
      setError(t("common.invalidEmail"));
      setLoader(false);
      return;
    }
    if (!validatePassword(password)) {
      setError(t("common.passwordRequirements"));
      setLoader(false);
      return;
    }
    try {
      const loginStatus = await LoginFn({
        email: email,
        password: password,
      });

      setLoader(false);
      if (loginStatus) navigate("/");
    } catch (err: any) {}
  };

  const handleGoogleLogin = async () => {
    setLoader(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);
      navigate("/");
      setLoader(false);
    } catch (error: any) {
      CommonError(error);
    }
  };
  const handleMicrsoftLogin = async () => {
    setLoader(true);

    try {
      const { request, data } = await loginWithMicrosoft();
      if (request) {
        window.location.href = request.responseURL;
      }
    } catch (error: any) {
      CommonError(error);
    }
  };

  const CommonError = (err: any) => {
    setError(err.message);
    setLoader(false);
  };

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    return re.test(password);
  };

  const handleFirebaseError = (error: FirebaseError) => {
    switch (error.code) {
      case "auth/invalid-email":
        setError(t("login.errorMessages.invalidEmail"));
        break;
      case "auth/user-not-found":
        setError(t("login.errorMessages.userNotFound"));
        break;
      case "auth/wrong-password":
        setError(t("login.errorMessages.wrongPassword"));
        break;
      case "auth/user-disabled":
        setError(t("login.errorMessages.userDisabled"));
        break;
      case "auth/invalid-login-credentials":
        setError(t("login.errorMessages.invalidLoginCredentials"));
        break;
      default:
        setError(t("login.errorMessages.defaultError"));
        break;
    }
    setLoader(false);
  };

  return (
    <>
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <img src={logo} alt="PCF" className="w-60 h-40 object-contain mb-4" />
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              {error && <span className="mt-10 text-red-600">{error}</span>}
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                {t("login.signInHeader")}
              </h1>
              <form className="space-y-4 md:space-y-6" action="#">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md dark:border-gray-700 focus:ring focus:ring-blue-200 dark:bg-gray-800 focus:outline-none focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    {t("login.passwordLabel")}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md dark:border-gray-700 focus:ring focus:ring-blue-200 dark:bg-gray-800 focus:outline-none focus:ring-opacity-50"
                  />
                </div>
                {/* <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="text-blue-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700 dark:text-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-white">
                      Se souvenir de moi
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/reset-password")}
                    className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring focus:ring-blue-200"
                  >
                    Mot de passe oublié ?
                  </button>
                </div> */}
                <div>
                  <button
                    onClick={handleLogin}
                    className="block w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
                  >
                    {loader ? (
                      <svg
                        className="w-5 h-5 mx-auto text-white animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 8.002 0 0112 4.536V0C6.477 0 2 4.477 2 10h4zm6 6.764A7.963 8.002 0 0110 19.464V24c5.523 0 10-4.477 10-10h-4zm-6 1.945a6.97 6.97 0 01-2.005-.291H4c0 4.418 3.582 8 8 8v-2.292z"
                        ></path>
                      </svg>
                    ) : (
                      t("login.loginButton")
                    )}
                  </button>
                </div>
              </form>

              {/* <button onClick={handleMicrsoftLogin}>
                Login With microsoft
              </button> */}
              <div className="flex items-center justify-center space-x-2 text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>{t("login.noAccount")}</p>
                  <p>
                    {t("login.contactUs")}{" "}
                    <span className="text-blue-700">
                      {t("login.adminEmail")}
                    </span>
                  </p>
                </div>
              </div>

              {/* <div className="flex justify-center space-x-2">
                <button
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-200"
                >
                  <span className="sr-only">Google</span>
                  <svg
                    className="w-5 h-5 text-white fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                    role="presentation"
                  >
                    <path d="M16 2.9C9.145 2.9 3.2 8.85 3.2 15.7c0 5.587 4.552 10.087 10.053 10.087 1.918 0 3.724-.53 5.287-1.537 1.493-1.365 2.63-3.34 3.237-5.55H16V9.9h8.48c-.99-2.51-2.85-4.61-5.28-6.01l.001-.001-.001-.001z"></path>
                    <path d="M26.07 9.29c.2.58.32 1.2.32 1.81 0 2.66-2.16 4.82-4.82 4.82H16v-8.19h5.49a6.88 6.88 0 0 1 1.61.19l3.02-3.02c-2.23-2.13-5.17-3.45-8.41-3.45-6.63 0-12.03 5.4-12.03 12.03 0 6.64 5.4 12.04 12.03 12.04 7.16 0 11.06-4.73 11.06-11.06 0-.7-.06-1.39-.16-2.07z"></path>
                  </svg>
                  <span>Google</span>
                </button>
              </div> */}
              {/* <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                Vous n'avez pas de compte ?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring focus:ring-blue-200"
                >
                  Inscrivez-vous
                </button>
              </p> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Login;
