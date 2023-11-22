//@ts-nocheck
// eslint-disable-next-line no-unused-vars
const localmainApiUrl = "https://localhost:44366/api";
//const mainApiUrl = "http://techlead-002-site3.ftempurl.com/api";
// eslint-disable-next-line no-unused-vars

export const tokenKeys = "@Auth:access_token";
export const LicenseKey = "@Auth:License_key";
export const CompanyKey = "@Auth:Company_Key";
export const AuthUserKey = "@Auth:user";
export const refreshTokens = "refreshToken";
export const languageKey = "language";
const env = process.env.REACT_APP_URL;
export const usedUrl = env;
//const usedUrl = mainApiUrl;
//usedUrl = localmainApiUrl;
export const AppName = "Enterprise";
export const siteName = usedUrl.replace("/api", "");
// export const siteName = usedUrl.substring(0, usedUrl.length - 4);
export const refreshTokenUrl = usedUrl + "/token/refresh";
// const usedUrl = localmainApiUrl;
export const googleApiKey = "AIzaSyAZsmDxm0r2Sgzko6tgiavKpkrGxOXqG3Y";

export const loginUrl = usedUrl + "/Accounts/Login";
export const ExternalLoginUrl = usedUrl + "/Accounts/ExternalLogin";
export const userUrl = usedUrl + "/Accounts/GetByJwt";
export const usersUrl = usedUrl + "/users";

export const putUserserUrl = usedUrl + "/Accounts";
export const RapportsURL = usedUrl + "/Rapports";
export const notificationURL = usedUrl + "/Notifications";
export const CompaniesUrl = usedUrl + "/Companies";
export const DeparetmentsUrl = usedUrl + "/Departements";
export const BranchesUrl = usedUrl + "/Branches";
export const EmployeesUrl = usedUrl + "/Employees";
export const ContractsUrl = usedUrl + "/Contracts";
export const CountriesUrl = usedUrl + "/Countries";
export const ImagesUrl = usedUrl + "/Images";
export const LicensesUrl = usedUrl + "/Licenses";
export const WorkCalendarsUrl = usedUrl + "/WorkCalendars";
export const VacationsUrl = usedUrl + "/Vacations";
export const VacationBalancesUrl = usedUrl + "/VacationBalances";
export const VacationBalanceTransferRequestUrl =
  usedUrl + "/VacationBalanceTransferRequests";
export const TeamsUrl = usedUrl + "/Teams";
export const RequestLeavesUrl = usedUrl + "/RequestLeaves";
export const AppointmentsUrl = usedUrl + "/Appointments";
export const TrainingRequestsUrl = usedUrl + "/TrainingRequests";
export const TrainingProvidersUrl = usedUrl + "/TrainingProviders";
export const TrainingSatisfactionFormsUrl =
  usedUrl + "/TrainingSatisfactionForms";
export const jobdescriptionsUrl = usedUrl + "/jobdescriptions";
export const AnnualInterviewsUrl = usedUrl + "/AnnualInterviews";
export const ProjectsUrl = usedUrl + "/Projects";
export const ActivitiesUrl = usedUrl + "/Activities";

export const UploadImagesUrl = ImagesUrl + "/UploadImage";
export const HubUrl = siteName + "/notificationHub";
