import { GraphDataType } from "src/state/slices/graphSlice";

export const BackToTopHeightSize = 900;
export var languages = [
  { code: "en", name: "English", countryCode: "GB" },
  { code: "es", name: "Spanish", countryCode: "ES" },
  // { code: 'ar', name: 'Arabic', countryCode: 'SA' },
  { code: "fr", name: "French", countryCode: "FR" },
  { code: "de", name: "German", countryCode: "DE" },
];

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

enum ProjectFileType {
  XLSX = 1,
  PrimaveraXML = 2,
  MicrosoftProject = 3,
}

const ProjectFiletypeOptions = [
  { id: ProjectFileType.XLSX, name: "XLSX" },
  { id: ProjectFileType.PrimaveraXML, name: "Primavera XML" },
  { id: ProjectFileType.MicrosoftProject, name: "Microsoft Project" },
];

export type GraphStringsSetting = {
  id: number;
  name: string;
  field: keyof GraphDataType;
};

export const graphStringsSettings: GraphStringsSetting[] = [
  {
    id: 1,
    name: "ID",
    field: "id",
  },
  {
    id: 2,
    name: "Activity Name",
    field: "activityName",
  },
  {
    id: 3,
    name: "Start Date",
    field: "startDate",
  },
  {
    id: 4,
    name: "Finish Date",
    field: "finishDate",
  },
  {
    id: 5,
    name: "Start chainage",
    field: "startChainage",
  },
  {
    id: 6,
    name: "Finish chainage",
    field: "finishChainage",
  },
  {
    id: 7,
    name: "Style",
    field: "style",
  },
];

export { ProjectFileType, ProjectFiletypeOptions };
