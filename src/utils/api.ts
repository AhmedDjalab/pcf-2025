// api.js

import axios from "axios";
import { toast } from "react-hot-toast";
import handleApiError from "./handleerror";
import { usedUrl } from "src/variables/Urls";
import { getJwt } from "src/Services/AuthService";

const api = axios.create({
  baseURL: usedUrl, // Replace this with your API base URL
});

// Add request interceptor to include the Authorization header if the token is available
api.interceptors.request.use((config) => {
  const token = getJwt(); // Replace 'accessToken' with your token key

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.params = {
    ...config.params,
  };
  return config;
});

// Add response interceptor to handle response statuses and token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return handleApiError(error);
  }
);

export default api;
