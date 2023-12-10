import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDib8fp8nEgFWfsSt252SozCxfXcn9hrEE",
  authDomain: "graph-d3-1bb44.firebaseapp.com",
  projectId: "graph-d3-1bb44",
  storageBucket: "graph-d3-1bb44.appspot.com",
  messagingSenderId: "246727270702",
  appId: "1:246727270702:web:6be267813ff46341079abf",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { app, auth };
