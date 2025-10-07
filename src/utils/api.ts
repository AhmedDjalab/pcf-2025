import axios from "axios";
import { toast } from "react-hot-toast";
import handleApiError from "./handleerror";
import { usedUrl } from "src/variables/Urls";
import { getJwt } from "src/Services/AuthService";
import { storedLanguage } from "src/i18n/config";

const api = axios.create({
  baseURL: usedUrl,
  // Replace this with your API base URL
});

// ✅ Add request interceptor to include Authorization header and disable Range caching
api.interceptors.request.use((config) => {
  const token = getJwt();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (storedLanguage) {
    config.headers["Accept-Language"] = storedLanguage;
  }

  // ✅ Disable any cached/partial responses
  config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
  config.headers["Pragma"] = "no-cache";
  config.headers["Expires"] = "0";
  config.headers["Range"] = ""; // clears Range header to avoid 206 Partial Content
  config.headers["Accept-Ranges"] = "none";

  // ✅ Optional: Add random version to bust any browser/CDN cache
  config.params = {
    ...config.params,
    culture: storedLanguage,
    v: Date.now(), // ensures a fresh call every time
  };

  return config;
});

// ✅ Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error)
);

export default api;
