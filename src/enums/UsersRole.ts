// @ts-noCheck

export enum UserRoles {
  Admin = "Admin",
  SuperAdmin = "SuperAdmin",
  Employee = "Employee",
  TeamLeader = "TeamLeader",
  AdminGestionDesAbsences = "AdminGestionDesAbsences",
  AdminGestionNoteDeFrais = "AdminGestionNoteDeFrais",
  AdminGestionDeVisiteMedicale = "AdminGestionDeVisiteMedicale",
  AdminGestionEntretienAnnuel = "AdminGestionEntretienAnnuel",
  AdminGestionDesFormations = "AdminGestionDesFormations",
  AdminGestionDesFichesDePostesCV = "AdminGestionDesFichesDePostesCV",
  AdminGestionDesFournisseurs = "AdminGestionDesFournisseurs",
  AdminGestionDesST = "AdminGestionDesST",
  AdminGestionDesIntervenants = "AdminGestionDesIntervenants",
  AdminGestionDesPlannings = "AdminGestionDesPlannings",
  AdminGestionDesLivrables = "AdminGestionDesLivrables",
  AdminGestionEtudeDePrix = "AdminGestionEtudeDePrix",
  AdminGestionMethodes = "AdminGestionMethodes",
  AdminGestionQualite = "AdminGestionQualite",
  AdminGestionHSE = "AdminGestionHSE",
  AdminGestionDesEtudes = "AdminGestionDesEtudes",
  AdminGestionDesRisques = "AdminGestionDesRisques",
  AdminGestionDesReunions = "AdminGestionDesReunions",
  AdminGestionDesRapports = "AdminGestionDesRapports",
}

export enum UserRolesEnum {
  Employee = 2,
  AdminGestionDesAbsences = 4,
  AdminGestionNoteDeFrais = 5,
  AdminGestionDeVisiteMedicale = 6,
  AdminGestionEntretienAnnuel = 7,
  AdminGestionDesFormations = 8,
  AdminGestionDesFichesDePostesCV = 9,
  AdminGestionDesFournisseurs = 10,
  AdminGestionDesST = 11,
  AdminGestionDesIntervenants = 12,
  AdminGestionDesPlannings = 13,
  AdminGestionDesLivrables = 14,
  AdminGestionEtudeDePrix = 15,
  AdminGestionMethodes = 16,
  AdminGestionQualite = 17,
  AdminGestionHSE = 18,
  AdminGestionDesEtudes = 19,
  AdminGestionDesRisques = 20,
  AdminGestionDesReunions = 21,
  AdminGestionDesRapports = 22,
  Default,
}
export const userRolesArray = Object.entries(UserRoles)
  .filter(([key, value]) => typeof value === "string")
  .map(([key, value]) => ({
    id: value as string,
    label: UserRoles[key].toString(),
  }));

export const nonAdminUserRole = userRolesArray.filter(
  (x) =>
    x.id !== UserRoles.Admin &&
    x.id !== UserRoles.SuperAdmin &&
    x.id !== UserRoles.TeamLeader
);

export const UserRolesValues = Object.values(UserRoles);
