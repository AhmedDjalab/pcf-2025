import { TaskSlotModel } from "src/types/Project";
import api from "src/utils/api";
import { TaskSlotsUrl } from "src/variables/Urls";

const apiEndpoint = TaskSlotsUrl;

export interface PaginatingParmas {
  level?: number;
  projectId?: string;
}
export async function getAllTaskSlot({ level, projectId }: PaginatingParmas) {
  try {
    let config = {
      params: {
        level: level,
        projectId: projectId,
      },
    };
    const { data } = await api.get(apiEndpoint + "/get", config);
    return data as TaskSlotModel[];
  } catch (ex: any) {
    // console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}
