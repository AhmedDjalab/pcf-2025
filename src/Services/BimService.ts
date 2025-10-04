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

export interface BimDataModel {
  activityId: string;
  linkedModelIds?: string[];
}

export interface SavedBimDataModel {
  activityBimLinkeds: BimDataModel[];
  projectId: string;
}

export async function saveBimData(bimData: SavedBimDataModel) {
  try {
    const body = { ...bimData };
    const response = await api.post(BimUrl + "/post", body);
    return response;
  } catch (error) {
    // console.log(
    //   "🚀 ~ file: CompanyService.ts:83 ~ saveCompany ~ error:",
    //   error
    // );
  }
}
