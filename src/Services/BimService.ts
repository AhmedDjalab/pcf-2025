import { ActivitiesUrl, BimUrl } from "src/variables/Urls";
import api from "src/utils/api";
import {
  ActivityModel,
  GraphSettingModel,
  filterTypes,
} from "src/types/Project";
import { ActivityRelations } from "src/state/slices/graphSlice";

export interface BimResponse {
  activities: ActivityModel[];
  count: number;
  ifcFileUrl: string;
}

const apiEndpoint = BimUrl;

export interface PaginatingParmas {
  takevalue?: number;
  fromvalue?: number;
  search?: string;
  projectId?: string;
  orderAsc?: boolean;
  activityId?: string;
}
export async function getBim({
  fromvalue = 0,
  takevalue = 10,
  search = "",
  projectId,
}: PaginatingParmas) {
  try {
    let config = {
      params: {
        from: fromvalue,
        take: takevalue,
        search: search,
        projectId: projectId,
      },
    };
    const { data } = await api.get(apiEndpoint + "/GetBim", config);
    return data as BimResponse;
  } catch (ex: any) {
    // console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}
