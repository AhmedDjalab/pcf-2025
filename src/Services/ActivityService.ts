import { ActivitiesUrl } from "src/variables/Urls";
import api from "src/utils/api";
import {
  ActivityModel,
  GraphSettingModel,
  filterTypes,
} from "src/types/Project";
import { ActivityRelations } from "src/state/slices/graphSlice";

export interface ActivitesResponse {
  activities: ActivityModel[];
  count: number;
}
export interface ActivityRelationsResponse {
  activitiesRelations: ActivityRelations[];
  count: number;
}
const apiEndpoint = ActivitiesUrl;

export interface PaginatingParmas extends filterTypes {
  takevalue?: number;
  fromvalue?: number;
  search?: string;
  projectId?: string;
  orderAsc?: boolean;
  activityId?: string;
}
export async function getActivities({
  fromvalue = 0,
  takevalue = 10,
  search = "",
  projectId,
  fromDate,
  toDate,
  toDistance,
  fromDistance,
}: PaginatingParmas) {
  try {
    let config = {
      params: {
        from: fromvalue,
        take: takevalue,
        search: search,
        projectId: projectId,
        fromDate,
        toDate,
        toDistance,
        fromDistance,
      },
    };
    const { data } = await api.get(apiEndpoint + "/get", config);
    return data as ActivitesResponse;
  } catch (ex: any) {
    // console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}

export async function getActivitiesByActivityId({
  takevalue,
  projectId,
  activityId,
  orderAsc,
}: PaginatingParmas) {
  try {
    let config = {
      params: {
        take: takevalue,
        projectId: projectId,
        activityId: activityId,
        orderAsc: orderAsc,
      },
    };
    const { data } = await api.get(apiEndpoint + "/GetByActivityId", config);
    return data as ActivitesResponse;
  } catch (ex: any) {
    // console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}

export async function getSuccessorsByActivityUID(activityuid: string) {
  try {
    let config = {
      params: {
        activityuid,
      },
    };
    const { data } = await api.get(apiEndpoint + "/GetSuccessors", config);
    return data as ActivityRelationsResponse;
  } catch (ex: any) {
    // console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}
export async function getPredecessorsByActivityUID(activityUID: string) {
  try {
    let config = {
      params: {
        activityUID,
      },
    };
    const { data } = await api.get(apiEndpoint + "/GetPredecessors", config);
    return data as ActivityRelationsResponse;
  } catch (ex: any) {
    // console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}
