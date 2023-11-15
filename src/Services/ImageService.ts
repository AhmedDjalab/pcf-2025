import { ImagesUrl } from "src/variables/Urls"; // Assuming you have an ImagesUrl variable defined
import api from "src/utils/api";
import { AxiosResponse } from "axios";

const apiEndpoint = ImagesUrl;

export interface Image {
  id: string;
  url: string;
  alt: string;
  companyId?: string;
  employeeId?: string;
}

export interface updateImageProps {
  userId: string;
  url: string;
  role: string;
}

export async function updateImage({ userId, url, role }: updateImageProps) {
  try {
    const { data } = await api.put(ImagesUrl + "/updateByUserId", {
      userId: userId,
      url: url,
      role: role,
    });
    return data;
  } catch (error) {
    console.log("Error getting image:", error);
  }
}

export async function getImagesForCompany(companyId: string) {
  try {
    const config = {
      params: {
        companyId: companyId,
      },
    };
    const { data } = await api.get(apiEndpoint + "/GetByCompanyId", config);

    return data as Image[];
  } catch (ex: any) {
    console.log("Error getting images:", ex);
  }
}

export async function getImageByUserId(userId: string, role: string) {
  try {
    const { data } = await api.get<string>(ImagesUrl + "/GetImageByUserId", {
      params: { userId, role },
    });

    return data;
  } catch (error) {
    console.log("Error getting image:", error);
  }
}

export async function saveImage(image: Image) {
  if (image.id) {
    const body = { ...image };
    try {
      const response = await api.put(ImagesUrl + "/put", body);
      return response;
    } catch (error) {
      console.log("Error updating image:", error);
    }
  }
  try {
    const response = await api.post(ImagesUrl + "/post", image);
    return response;
  } catch (error: any) {
    console.log("Error creating image:", error.response);
  }
}

export function deleteImage(imageId: string) {
  return api
    .delete(ImagesUrl + "/delete", { data: { id: imageId } })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.log("Error deleting image:", error.response);
      return error;
    });
}
