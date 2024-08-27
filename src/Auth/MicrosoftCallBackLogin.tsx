import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "src/context/UserContext";
import api from "src/utils/api";
import { getUserDataUrl } from "src/variables/Urls";
import { jwtDecode } from "jwt-decode";

function MicrosoftLoginCallback() {
  const [loading, setLoading] = useState(true);
  const { externalLogin, user } = useAuth();

  function getCookie(name: any) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts?.pop()?.split(";").shift();
    return null;
  }
  // useEffect(() => {
  //   api
  //     .get(getUserDataUrl, { withCredentials: true })

  //     .then(({ data }) => {
  //       const jwtToken = data.token;
  //       console.warn("JWT Token:", jwtToken);
  //       var userData = jwtDecode(jwtToken);
  //       console.warn("JWT Token decode", userData);

  //       localStorage.setItem("jwtToken", response.data.token);
  //       localStorage.setItem("role", userData.role);
  //       localStorage.setItem("canRead", userData.canRead);
  //       localStorage.setItem("canWrite", userData.canWrite);
  //       // // Redirect to the dashboard
  //       window.location.href = "/";
  //       // Store the token in localStorage or use it as needed
  //     })
  //     .catch((error) => {
  //       console.error("Authentication failed:", error);
  //       //window.location.href = "/login";
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // }, []);

  useEffect(() => {
    api
      .get(getUserDataUrl, { withCredentials: true })
      .then((response) => {
        console.log("🚀 ~ .then ~ response:", response);
        // // Store the user data and token
        // localStorage.setItem("jwtToken", response.data.token);
        // localStorage.setItem("role", response.data.role);
        // localStorage.setItem("canRead", response.data.canRead);
        // localStorage.setItem("canWrite", response.data.canWrite);
        // // Redirect to the dashboard
        // window.location.href = "/";
        //var userData = jwtDecode(response.data);

        externalLogin(response.data);
      })
      .catch((error) => {
        console.error("Authentication failed:", error);
        //window.location.href = "/login";
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return null;
}

export default MicrosoftLoginCallback;
