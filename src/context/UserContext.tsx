import { createContext, useContext, useState, useEffect } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../Helpers/firebase";

interface UserContextType {
  user: User | null;
  loginUser: (email: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Add a Firebase authentication state listener
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        // User is signed in.
        setUser(authUser);
      } else {
        // User is signed out.
        setUser(null);
      }
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  const loginUser = (email: string, password: string) => {
    // Sign in with Firebase authentication
    const value = signInWithEmailAndPassword(auth, email, password)
      .then(async (authUser) => {
        // User is signed in.
        setUser(authUser.user);
        const token = await authUser.user.getIdToken();
        localStorage.setItem("token", token); // .user is the user object
        return true;
      })
      .catch((error) => {
        // Handle login error

        throw error;
      });
    return value;
  };

  const logoutUser = () => {
    // Sign out with Firebase authentication
    signOut(auth)
      .then(() => {
        // User is signed out.
        setUser(null);
        localStorage.removeItem("token");
      })
      .catch((error) => {
        // Handle logout error
        console.error(error);
      });
  };

  return (
    <UserContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};
