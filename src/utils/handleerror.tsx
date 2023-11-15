import { toast } from "react-hot-toast";
import { tokenKeys } from "src/variables/Urls";
import secureLocalStorage from "react-secure-storage";

const handleApiError = (error: any) => {
  if (!error.response) {
    // Network error
    toast.error("Please check your internet connection.");
  } else {
    const status = error.response.status;

    const errorData = error.response.data;
    const errorMessage =
      errorData?.message ||
      errorData?.error ||
      errorData ||
      "An error occurred";

    switch (status) {
      case 400:
        toast.error("Bad Request: " + errorMessage);
        break;
      case 401:
        toast.error("Unauthorized: " + errorMessage);
        secureLocalStorage.removeItem(tokenKeys);
        window.location.href = "/login";
        break;
      case 403:
        toast.error("Forbidden: " + errorMessage);
        break;
      case 404:
        toast.error("Not Found: " + errorMessage);
        break;
      case 500:
        toast.error("Internal Server Error: " + errorMessage);
        break;
      default:
        toast.error("An error occurred: " + errorMessage);
        break;
    }
  }

  return Promise.reject(error);
};

export default handleApiError;
