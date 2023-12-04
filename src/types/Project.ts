import { ProjectFileType } from "src/const/vars";

export interface Project {
  id?: string;
  title: string;
  logoUrl?: string;
  logoUrlId?: string | null;
  fileType?: ProjectFileType;
  companyId: string;
  employeesId?: string[];
  activities?: ActivityModel[];
  graphSettings?: GraphSettingModel;
  activityStyles?: ActivityStyleModel[];
  taskSlotsLevelOne?: TaskSlotModel[];
  taskSlotsLevelTwo?: TaskSlotModel[];
  UpdatedAt?: Date;
  CreatedAt?: Date;
  ModifierName?: string;
  CreatorName?: string;
  userId?: string;
}

export interface ActivityModel {
  id?: string;
  name: string;
  activityId: string;
  startDate: Date;
  endDate: Date;
  startPk: number;
  endPk: number;
  style: string;
  activityStyleId?: string;
  calendar?: string;
  duration?: string;
  graphSettingId?: string;
  projectId?: string;
}

export interface ActivityStyleModel {
  name: string;
  color: string;
  backgroundTextureType: string;
  lineStyleType: string;
  shapeType: "line" | "rect" | "triangle";
  activityId?: string | null;
}

export interface filterTypes {
  fromDate: Date;
  toDate: Date;
  fromDistance: number;
  toDistance: number;
  timeRange?: "Yearly" | "Monthly" | "Weekly" | "Daily";
  distanceRange?: number | null;
}
export interface GraphSettingModel {
  fromDate: Date;
  toDate: Date;
  fromDistance: number;
  toDistance: number;
  distanceRange?: number | null;
  graphActivities?: ActivityModel[] | null;
  timeRange: "Yearly" | "Monthly" | "Weekly" | "Daily";
}

export interface TaskSlotModel {
  start: number;
  end: number;
  name: string;
  level: number;
  projectId?: string | null;
  id?: string | null;
  idnew?: string | null;
}

// Assuming 'Image' is a custom type defined somewhere in your code.
export interface Image {
  // Define the properties of the Image type
}
