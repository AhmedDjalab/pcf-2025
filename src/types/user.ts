export interface User {
  id: string;
  email: string;
  fullName?: string;
  token: string;
  role: string;
  userName?: string;
  phoneNumber?: string;
  canRead?: boolean;
  canWrite?: boolean;
  // Replace firstName and lastName with userName
}
