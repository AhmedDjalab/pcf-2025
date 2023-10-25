import { uniqueId } from "lodash";
import { MsProjectOption } from "src/components/ParmeterSelector";
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

export const getOptions = (
  udfSettingString: any[] | undefined,
  filetype: ProjectFileType
) => {
  if (filetype === ProjectFileType.XLSX) {
    return (udfSettingString as string[]).map((str, index) => ({
      name: str,
      id: (index + 1).toString(),
    }));
  }
  if (filetype === ProjectFileType.MicrosoftProject) {
    let udfs = (udfSettingString as MsProjectOption[]).map((ud, index) => ({
      name: ud.alias,
      id: ud.udfId,
    }));

    return [
      ...udfs,
      {
        name: "ID",
        id: uniqueId(),
      },
      {
        name: "Name",
        id: uniqueId(),
      },
      {
        name: "Start",
        id: uniqueId(),
      },
      {
        name: "Finish",
        id: uniqueId(),
      },
    ];
  }
  if (filetype === ProjectFileType.PrimaveraXML) {
    console.error(
      "🚀 ~ file: ParmeterSelector.tsx:172 ~ getOptions ~ filetype:",
      udfSettingString
    );

    let udfs = (udfSettingString as MsProjectOption[]).map((ud, index) => ({
      name: ud.alias,
      id: ud.udfId,
    }));

    return [
      ...udfs,
      {
        name: "ObjectId",
        id: uniqueId(),
      },
      {
        name: "Name",
        id: uniqueId(),
      },
      {
        name: "StartDate",
        id: uniqueId(),
      },
      {
        name: "FinishDate",
        id: uniqueId(),
      },
    ];
  }
};

export { ProjectFileType, ProjectFiletypeOptions };
