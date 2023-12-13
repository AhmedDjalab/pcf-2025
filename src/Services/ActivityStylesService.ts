import { ActivityStyleModel, TaskSlotModel } from "src/types/Project";
import api from "src/utils/api";
import { ActivityStylesUrl } from "src/variables/Urls";

const apiEndpoint = ActivityStylesUrl;

export interface PaginatingParmas {
  projectId?: string;
}
export async function getAllActivityStyles({ projectId }: PaginatingParmas) {
  console.error(
    "🚀 ~ file: ActivityStylesService.ts:11 ~ getAllActivityStyles ~ projectId:",
    projectId
  );

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
