import { ActivityStyleModel, TaskSlotModel } from "src/types/Project";
import api from "src/utils/api";
import { ActivityStylesUrl } from "src/variables/Urls";

const apiEndpoint = ActivityStylesUrl;

export interface PaginatingParmas {
  projectId?: string;
}
export async function getAllActivityStyles({ projectId }: PaginatingParmas) {
  

  try {
    let config = {
      params: {
        projectId: projectId,
      },
    };
    const { data } = await api.get(apiEndpoint + "/get", config);
    return data as ActivityStyleModel[];
  } catch (ex: any) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}

export async function saveActivityStyle(activityStyle: ActivityStyleModel) {
  if (activityStyle.id) {
    const body = { ...activityStyle };

    try {
      const response = await api.put(apiEndpoint + "/put", body);
      return response;
    } catch (error) {
      console.log(
        "🚀 ~ file: CompanyService.ts:83 ~ saveCompany ~ error:",
        error
      );
    }
  }
  try {
    const response_1 = await api.post(apiEndpoint + "/post", activityStyle);
    return response_1;
  } catch (error_1: any) {
    console.log(error_1.response);
  }
}
