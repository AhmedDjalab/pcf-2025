import { PlansUrl } from "src/variables/Urls";
import api from "src/utils/api";
import { getCompanyId, getCurrentUser } from "./AuthService";
import { Project } from "src/types/Project";
import {
  Plan,
  ProjectOption,
  StageDataModel,
} from "src/state/slices/graphSlice";

export interface PlansResponse {
  plans: Plan[];
  count: number;
}
const apiEndpoint = PlansUrl;

export interface PaginatingParmas {
  takevalue?: number;
  fromvalue?: number;
  projectId: string;
}

export async function getPlans({
  fromvalue = 0,
  takevalue = 0,
  projectId,
}: PaginatingParmas) {
  try {
    let config = {
      params: {
        page: fromvalue,
        take: takevalue,
        projectId: projectId,
      },
    };
    const { data } = await api.get(apiEndpoint + "/get", config);
    return data as PlansResponse;
  } catch (ex: any) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}

export async function GetPlansDetailed({ projectId }: PaginatingParmas) {
  try {
    let config = {
      params: {
        projectId: projectId,
      },
    };
    const { data } = await api.get(
      apiEndpoint + "/GetPlansByProjectId",
      config
    );
    return data as PlansResponse;
  } catch (ex: any) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}

export async function getStagesDataByPlanId({
  planId,
  date,
}: {
  planId: string;
  date: Date;
}) {
  try {
    let config = {
      params: {
        planId: planId,
        date: date,
      },
    };
    const { data } = await api.get(
      apiEndpoint + "/GetStagesDataByPlanId",
      config
    );
    return data as StageDataModel[];
  } catch (ex: any) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}
