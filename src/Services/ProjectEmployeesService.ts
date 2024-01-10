import api from "src/utils/api";
import { ProjectEmployeesUrl } from "src/variables/Urls";

const apiEndpoint = ProjectEmployeesUrl;

export interface ProjectEmployeesType {
  employeesId: string[];
  projectId: string;
}

export async function saveProjectEmployees(
  projectEmployee: ProjectEmployeesType
) {
  const body = { ...projectEmployee };

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
