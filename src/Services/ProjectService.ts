import { ProjectsUrl } from "src/variables/Urls";
import api from "src/utils/api";
import { getCompanyId, getCurrentUser } from "./AuthService";
import { Project } from "src/types/Project";
import { ProjectOption } from "src/state/slices/graphSlice";

export interface ProjectsResponse {
  projects: Project[];
  count: number;
}
const apiEndpoint = ProjectsUrl;

export interface PaginatingParmas {
  takevalue?: number;
  fromvalue?: number;
  search?: string;

  employeeId?: string;
  userAdminId?: string;
}

export async function getBriefProjects() {
  try {
    let config = {
      params: {
        companyId: getCompanyId(),
      },
    };
    const { data } = await api.get(apiEndpoint + "/GetAllBrief", config);
    return data as ProjectOption[];
  } catch (ex: any) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}

export async function getProjects({
  fromvalue = 0,
  takevalue = 0,
  search = "",
  userAdminId,
}: PaginatingParmas) {
  try {
    let config = {
      params: {
        page: fromvalue,
        take: takevalue,
        search: search,
        userAdminId: userAdminId,
        companyId: getCompanyId(),
      },
    };
    const { data } = await api.get(apiEndpoint + "/get", config);
    return data as ProjectsResponse;
  } catch (ex: any) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}

export async function getProjectsByEmployeeId({
  fromvalue = 0,
  takevalue = 0,
  search = "",
  employeeId,
}: PaginatingParmas) {
  try {
    let config = {
      params: {
        page: fromvalue,
        take: takevalue,
        search: search,
        employeeId: employeeId,
      },
    };
    const { data } = await api.get(apiEndpoint + "/getByEmployeeId", config);
    return data as ProjectsResponse;
  } catch (ex: any) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
  }
}
// export async function getEmployeeTeamMemebers({
//   fromvalue = 0,
//   takevalue = 10,
//   search = "",
//   notTeamMember = undefined,
//   departmentId,
//   branchId,
//   teamId,
//   employeeId,
// }: PaginatingParmas) {
//   try {
//     const companyId = getCompanyId();
//     let config = {
//       params: {
//         page: fromvalue,
//         take: takevalue,
//         search: search,
//         employeeId: employeeId,
//       },
//     };
//     const { data } = await api.get(apiEndpoint + "/GetTeamMemebers", config);
//     return data as EmployeesResponse;
//   } catch (ex: any) {
//     console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
//   }
// }

export async function getProject(projectId: string) {
  try {
    const { data } = await api.get<Project>(apiEndpoint + "/GetById", {
      params: { Id: projectId },
    });

    return data as Project;
  } catch (error) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", error);
  }
}

export async function saveProject(project: Project) {
  const headers = {
    "Content-Encoding": "gzip", // Set the Content-Encoding header to indicate gzip compression
    "Content-Type": "application/json", // Set the Content-Type header
  };

  if (project.id) {
    const body = { ...project };

    try {
      const response = await api.put(apiEndpoint + "/put", body, { headers });
      return response;
    } catch (error) {
      console.log(
        "🚀 ~ file: CompanyService.ts:83 ~ saveCompany ~ error:",
        error
      );
    }
  }
  try {
    
    const response_1 = await api.post(apiEndpoint + "/post", project, {
      headers,
    });
    return response_1;
  } catch (error_1: any) {
    console.log(error_1.response);
  }
}

export function deleteProject(projectId: string) {
  return api
    .delete(apiEndpoint + "/delete", { data: { id: projectId } })
    .then((responce) => {
      return responce;
    })
    .catch((error) => {
      return error;
    });
}

export async function getGraph(projectId: string) {
  try {
    const { data } = await api.get<Project>(apiEndpoint + "/GetGraphById", {
      params: { Id: projectId },
    });

    return data as Project;
  } catch (error) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", error);
  }
}

// export async function getEmployeesByTeamId({
//   fromvalue = 0,
//   takevalue = 0,
//   search = "",
//   teamId,
// }: PaginatingParmas) {
//   try {
//     const companyId = getCompanyId();
//     let config = {
//       params: {
//         page: fromvalue,
//         take: takevalue,
//         search: search,
//         teamId: teamId,
//       },
//     };
//     const { data } = await api.get(apiEndpoint + "/getByTeamId", config);
//     return data as EmployeesResponse;
//   } catch (ex: any) {
//     console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
//   }
// }
// export async function getEmployeesByTeamLeaderId({
//   fromvalue = 0,
//   takevalue = 0,
//   search = "",
//   teamLeaderId,
// }: PaginatingParmas) {
//   try {
//     const companyId = getCompanyId();
//     let config = {
//       params: {
//         page: fromvalue,
//         take: takevalue,
//         search: search,
//         teamLeaderId: teamLeaderId,
//       },
//     };
//     const { data } = await api.get(apiEndpoint + "/GetByTeamLeader", config);
//     return data as EmployeesResponse;
//   } catch (ex: any) {
//     console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
//   }
// }
// export async function updateEmployeeTeam(teamId: string, employeeId: string) {
//   try {
//     const body = {
//       employeeId: employeeId,
//       teamId: teamId,
//     };

//     const response_1 = await api.post(apiEndpoint + "/updateTeam", body);
//     return response_1;
//   } catch (ex: any) {
//     console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", ex);
//   }
// }
