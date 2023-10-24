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

export { ProjectFileType, ProjectFiletypeOptions };
