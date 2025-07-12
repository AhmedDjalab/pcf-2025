import { uniqueId } from "lodash";
import { MsProjectOption } from "src/components/ParmeterSelector";
import { GraphDataType } from "src/state/slices/graphSlice";

const formatNumberForBackend = (number) => {
  return number.toLocaleString("en-US", { useGrouping: false });
};
export const BackToTopHeightSize = 900;
export var languages = [
  { code: "en", name: "English", countryCode: "GB" },
  { code: "es", name: "Spanish", countryCode: "ES" },
  // { code: 'ar', name: 'Arabic', countryCode: 'SA' },
  { code: "fr", name: "French", countryCode: "FR" },
  { code: "de", name: "German", countryCode: "DE" },
  { code: "it", name: "Italian", countryCode: "IT" },
  { code: "jp", name: "Japanese", countryCode: "JP" },
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
  { id: ProjectFileType.PrimaveraXML, name: "PrimaveraXML" },
  { id: ProjectFileType.MicrosoftProject, name: "MicrosoftProject" },
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
    name: "drawGraph.activityDetails.activityNameLabel",
    field: "activityName",
  },
  {
    id: 3,
    name: "drawGraph.activityDetails.startDateLabel",
    field: "startDate",
  },
  {
    id: 4,
    name: "drawGraph.activityDetails.finishDateLabel",
    field: "finishDate",
  },
  {
    id: 5,
    name: "drawGraph.activityDetails.startChainageLabel",
    field: "startChainage",
  },
  {
    id: 6,
    name: "drawGraph.activityDetails.finishChainageLabel",
    field: "finishChainage",
  },
  {
    id: 7,
    name: "drawGraph.activityDetails.styleLabel",
    field: "style",
  },
  {
    id: 8,
    name: "importFileForm.quantity",
    field: "quantity",
  },
  {
    id: 9,
    name: "importFileForm.ProductionRate",
    field: "productionRate",
  },
  {
    id: 10,
    name: "importFileForm.workShops",
    field: "workShops",
  },
  // {
  //   id: 8,
  //   name: "drawGraph.activityDetails.criticalLabel",
  //   field: "critical",
  // },
];
export const graphPrimaveraSettings: GraphStringsSetting[] = [
  // {
  //   id: 1,
  //   name: "ID",
  //   field: "id",
  // },
  // {
  //   id: 2,
  //   name: "drawGraph.activityDetails.activityNameLabel",
  //   field: "activityName",
  // },
  // {
  //   id: 3,
  //   name: "drawGraph.activityDetails.startDateLabel",
  //   field: "startDate",
  // },
  // {
  //   id: 4,
  //   name: "drawGraph.activityDetails.finishDateLabel",
  //   field: "finishDate",
  // },
  {
    id: 5,
    name: "drawGraph.activityDetails.startChainageLabel",
    field: "startChainage",
  },
  {
    id: 6,
    name: "drawGraph.activityDetails.finishChainageLabel",
    field: "finishChainage",
  },
  {
    id: 7,
    name: "drawGraph.activityDetails.styleLabel",
    field: "style",
  },
  {
    id: 8,
    name: "importFileForm.critical",
    field: "critical",
  },
  {
    id: 9,
    name: "importFileForm.quantity",
    field: "quantity",
  },
  {
    id: 10,
    name: "importFileForm.ProductionRate",
    field: "productionRate",
  },
  {
    id: 11,
    name: "importFileForm.workShops",
    field: "workShops",
  },
];
export const graphStringsMSProjectSettings: GraphStringsSetting[] = [
  // {
  //   id: 1,
  //   name: "ID",
  //   field: "id",
  // },
  // {
  //   id: 2,
  //   name: "drawGraph.activityDetails.activityNameLabel",
  //   field: "activityName",
  // },
  // {
  //   id: 3,
  //   name: "drawGraph.activityDetails.startDateLabel",
  //   field: "startDate",
  // },
  // {
  //   id: 4,
  //   name: "drawGraph.activityDetails.finishDateLabel",
  //   field: "finishDate",
  // },
  {
    id: 5,
    name: "drawGraph.activityDetails.startChainageLabel",
    field: "startChainage",
  },
  {
    id: 6,
    name: "drawGraph.activityDetails.finishChainageLabel",
    field: "finishChainage",
  },
  {
    id: 7,
    name: "drawGraph.activityDetails.styleLabel",
    field: "style",
  },
  // {
  //   id: 8,
  //   name: "importFileForm.critical",
  //   field: "critical",
  // },
  {
    id: 8,
    name: "importFileForm.quantity",
    field: "quantity",
  },
  {
    id: 9,
    name: "importFileForm.ProductionRate",
    field: "productionRate",
  },
  {
    id: 10,
    name: "importFileForm.workShops",
    field: "workShops",
  },
];

export const graphStringsXLSXSettings: GraphStringsSetting[] = [
  {
    id: 1,
    name: "ID",
    field: "id",
  },
  {
    id: 2,
    name: "drawGraph.activityDetails.activityNameLabel",
    field: "activityName",
  },
  {
    id: 3,
    name: "drawGraph.activityDetails.startDateLabel",
    field: "startDate",
  },
  {
    id: 4,
    name: "drawGraph.activityDetails.finishDateLabel",
    field: "finishDate",
  },
  {
    id: 5,
    name: "drawGraph.activityDetails.startChainageLabel",
    field: "startChainage",
  },
  {
    id: 6,
    name: "drawGraph.activityDetails.finishChainageLabel",
    field: "finishChainage",
  },
  {
    id: 7,
    name: "drawGraph.activityDetails.styleLabel",
    field: "style",
  },
  {
    id: 8,
    name: "drawGraph.activityDetails.calendar",
    field: "calendarName",
  },
  {
    id: 9,
    name: "drawGraph.activityDetails.duration",
    field: "duration",
  },
  // {
  //   id: 10,
  //   name: "importFileForm.critical",
  //   field: "critical",
  // },
  {
    id: 10,
    name: "importFileForm.quantity",
    field: "quantity",
  },
  {
    id: 11,
    name: "importFileForm.ProductionRate",
    field: "productionRate",
  },
  {
    id: 12,
    name: "importFileForm.workShops",
    field: "workShops",
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
