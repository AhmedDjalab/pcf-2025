import api from "src/utils/api";
import { LicenseKey, LicensesUrl } from "src/variables/Urls";
import secureLocalStorage from "react-secure-storage";

export interface LicenseModel {
  companyName: string | null;
  licenseId: string;
  issueDate: Date;
  expirationDate: Date;
  moduleTypes: string;
  isValidLicense: boolean;
  companyId: string;
  id: string;
}
const apiEndpoint = LicensesUrl;

export async function getLicenseByUserId(userId: string, role: string) {
  try {
    const { data } = await api.get<LicenseModel>(apiEndpoint + "/GetByUserId", {
      params: { userId: userId, role: role },
    });

    return data as LicenseModel;
  } catch (error) {
    console.log("🚀 ~ file: CompanyService.ts:43 ~ getCompanies ~ ex:", error);
  }
}
export async function getLicense(licenseId: string) {
  try {
    let { data } = await api.get<LicenseModel>(apiEndpoint + "/GetById", {
      params: { id: licenseId },
    });
    return data;
  } catch (error) {
    console.log("Error:", error);
  }
}

export function getLicenseId() {
  return secureLocalStorage.getItem(LicenseKey);
}
