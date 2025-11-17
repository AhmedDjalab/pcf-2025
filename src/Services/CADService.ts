import { ActivityModel } from "src/types/Project";
import api from "src/utils/api";
import { CADUrl } from "src/variables/Urls";

const apiEndpoint = CADUrl;

// async function getAccessToken(callback) {
//     try {
//         const resp = await fetch('/api/auth/token');
//         if (!resp.ok) {
//             throw new Error(await resp.text());
//         }
//         const { access_token, expires_in } = await resp.json();
//         callback(access_token, expires_in);
//     } catch (err) {
//         alert('Could not obtain access token. See the console for more details.');
//         console.error(err);
//     }
// }

export interface CADResponse {
  activities: ActivityModel[];
  count: number;
  cadFileUrl: string;
  cadFileURN: string;
}
export interface PaginatingParmas {
  projectId: string;
  search?: string;
}

export async function getCADInfo({ projectId, search }: PaginatingParmas) {
  try {
    let config = {
      params: {
        search: search,
        projectId: projectId,
      },
    };
    const { data } = await api.get(apiEndpoint + "/GetCAD", config);
    return data as CADResponse;
  } catch (ex: any) {
    // console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}

export interface CADDataModel {
  activityId: string;
  cadLinkedModelIds?: string[];
}

export interface CadAccessToken {
  access_token: string;
  expires_in: string;
}

export async function getAccessToken() {
  try {
    const { data } = await api.get(apiEndpoint + "/GetAccessToken");
    return data as CadAccessToken;
  } catch (ex: any) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}
export interface SavedCADDataModel {
  activityCadLinkeds: CADDataModel[];
  projectId: string;
}

export async function saveCADData(bimData: SavedCADDataModel) {
  try {
    const body = { ...bimData };
    const response = await api.post(CADUrl + "/post", body);
    return response;
  } catch (error) {
    // console.log(
    //   "🚀 ~ file: CompanyService.ts:83 ~ saveCompany ~ error:",
    //   error
    // );
  }
}

export type TranslationStatus = {
  status: string;
  progress: string;
  messages: string[];
};

export async function getCADStatus({ urn }: { urn: string }) {
  try {
    let config = {
      params: {
        urn: urn,
      },
    };
    const { data } = await api.get(apiEndpoint + "/GetModelStatus", config);
    return data as TranslationStatus;
  } catch (ex: any) {
    throw ex;
    // console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}
