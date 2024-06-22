import { EmployeesUrl } from "src/variables/Urls";
import api from "src/utils/api";
import { getCompanyId, getCurrentUser } from "./AuthService";

export interface Employee {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  canRead: boolean;
  canWrite: boolean;
  userId?: string;
  userAdminId: string;
  companyId?: string;
}

export interface EmployeesResponse {
  employees: Employee[];
  count: number;
}
const apiEndpoint = EmployeesUrl;

export interface PaginatingParmas {
  takevalue?: number;
  fromvalue?: number;
  search?: string;

  employeeId?: string;
  userAdminId?: string;
}
export async function getEmployees({
  fromvalue = 0,
  takevalue = 10,
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
    return data as EmployeesResponse;
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

export async function getEmployee(employeeId: string) {
  try {
    const { data } = await api.get<Employee>(apiEndpoint + "/GetById", {
      params: { Id: employeeId },
    });

    return data as Employee;
  } catch (error) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", error);
  }
}

export async function saveEmployee(employee: Employee) {
  console.warn("🚀🚀🚀🚀 ~ saveEmployee ~ employee:", employee);
  if (employee.id) {
    const body = { ...employee };

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
    const response_1 = await api.post(apiEndpoint + "/post", employee);
    return response_1;
  } catch (error_1: any) {
    console.log(error_1.response);
  }
}

export async function deleteEmployee(employeeId: string) {
  return api
    .delete(apiEndpoint + "/delete", { data: { id: employeeId } })
    .then((responce) => {
      return responce;
    })
    .catch((error) => {
      return error;
    });
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
