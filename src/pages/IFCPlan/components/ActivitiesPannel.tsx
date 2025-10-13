import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Eye,
  EyeOff,
  Focus,
  RotateCcw,
  Link,
  Calendar,
  Clock,
  Search,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import moment from "moment";
import { ActivityRelations, UdfSetting } from "src/state/slices/graphSlice";
import { getExtendPropertyData } from "src/Helpers/parsers";
import { ActivityModel } from "src/types/Project";
import { selectCurrentActivityId } from "src/state/slices/bimSlice";
import { useSelector } from "react-redux";
import { useAuth } from "src/context/UserContext";
import { useTranslation } from "react-i18next";

export const ACTIVI = [
  {
    uid: "8599",
    name: "DEL-27 : Délai Titulaire",
    activityId: "EPR2.508", // Added prefix
    startDate: new Date("2026-09-01T20:00:00"),
    endDate: new Date("2026-09-01T20:00:00"),
    startPk: 2393,
    endPk: 2443,
    linkedModelIds: [],
    style: "Délai Titulaire",
  },
  {
    uid: "8620",
    name: "JAL-2 Mise à disposition PDL eaux potable zone ouest",
    activityId: "EPR2.2403", // Added prefix
    startDate: new Date("2026-09-30T07:00:00"),
    endDate: new Date("2026-09-30T07:00:00"),
    startPk: 2500,
    endPk: 2520,
    linkedModelIds: [],
    style: "MAD",
  },
  {
    uid: "8622",
    name: "JAL-3 Mise à disposition PDL électricité zone est",
    activityId: "EPR2.2399", // Added prefix
    startDate: new Date("2026-09-30T07:00:00"),
    endDate: new Date("2026-09-30T07:00:00"),
    startPk: 1900,
    endPk: 1913,
    linkedModelIds: [],
    style: "MAD",
  },
  {
    uid: "8624",
    name: "JAL-4 Mise à disposition PDL électricité zone ouest",
    activityId: "EPR2.112", // Added prefix
    startDate: new Date("2026-09-30T07:00:00"),
    endDate: new Date("2026-09-30T07:00:00"),
    startPk: 1920,
    endPk: 1943,
    linkedModelIds: [],
    style: "MAD",
  },
  {
    uid: "8626",
    name: "JAL-5 Mise à disposition PDL eaux industrielles zone est",
    activityId: "EPR2.114", // Added prefix
    startDate: new Date("2026-11-02T07:00:00"),
    endDate: new Date("2026-11-02T07:00:00"),
    startPk: 2500,
    endPk: 2520,
    linkedModelIds: [],
    style: "MAD",
  },
  {
    uid: "8628",
    name: "JAL-6 Mise à disposition PDL eaux industrielles zone ouest",
    activityId: "EPR2.116", // Added prefix
    startDate: new Date("2026-11-02T07:00:00"),
    endDate: new Date("2026-11-02T07:00:00"),
    startPk: 1943,
    endPk: 1963,
    linkedModelIds: [],
    style: "MAD",
  },
  {
    uid: "8630",
    name: "JAL-7 Mise à disposition PDL eaux potable zone est",
    activityId: "EPR2.118", // Added prefix
    startDate: new Date("2026-11-02T07:00:00"),
    endDate: new Date("2026-11-02T07:00:00"),
    startPk: 2500,
    endPk: 2520,
    linkedModelIds: [],
    style: "MAD",
  },
  {
    uid: "8632",
    name: 'JAL-8 Mise a disposition de la zone dite "Flore 2" (Fin retrait des espèces zone flore 2)',
    activityId: "EPR2.120", // Added prefix
    startDate: new Date("2026-11-16T07:00:00"),
    endDate: new Date("2026-11-16T07:00:00"),
    startPk: 594,
    endPk: 1109,
    linkedModelIds: [],
    style: "MAD",
  },
  {
    uid: "8636",
    name: "JAL-10 Mise à disposition PDL eaux potable zone ouest sud bloc usine",
    activityId: "EPR2.124", // Added prefix
    startDate: new Date("2026-11-02T07:00:00"),
    endDate: new Date("2026-11-02T07:00:00"),
    startPk: 1920,
    endPk: 1943,
    linkedModelIds: [],
    style: "MAD",
  },
  {
    uid: "8640",
    name: "JAL-12 Mise à disposition PDL eaux industrielles zone ouest sud bloc usine",
    activityId: "EPR2.128", // Added prefix
    startDate: new Date("2026-11-02T07:00:00"),
    endDate: new Date("2026-11-02T07:00:00"),
    startPk: 1920,
    endPk: 1943,
    linkedModelIds: [],
    style: "MAD",
  },
  {
    uid: "8648",
    name: "JAL-16 Fin de travaux de dévoiement des réseaux du corridor technique (emprise grand colombier)",
    activityId: "EPR2.136", // Added prefix
    startDate: new Date("2026-09-30T09:00:00"),
    endDate: new Date("2026-09-30T09:00:00"),
    startPk: 1713,
    endPk: 1963,
    linkedModelIds: [],
    style: "MAD",
  },
  {
    uid: "8663",
    name: "Phase 2 : Balisage 1ère quinzaine d'octobre ",
    activityId: "EPR2.146", // Added prefix
    startDate: new Date("2026-10-01T07:00:00"),
    endDate: new Date("2026-10-16T20:00:00"),
    startPk: 594,
    endPk: 1109,
    linkedModelIds: [],
    style: "Contrainte Environnementale",
  },
  {
    uid: "8664",
    name: "Phase 2 : Prélèvement flore (zones bleues)",
    activityId: "EPR2.147", // Added prefix
    startDate: new Date("2026-11-16T07:00:00"),
    endDate: new Date("2027-01-01T20:00:00"),
    startPk: 594,
    endPk: 1109,
    linkedModelIds: [],
    style: "Contrainte Environnementale",
  },
  {
    uid: "8671",
    name: "Phase 2 : Zone de sanctuaire amphibien provisoire",
    activityId: "EPR2.148", // Added prefix
    startDate: new Date("2026-09-01T07:00:00"),
    endDate: new Date("2027-08-15T20:00:00"),
    startPk: 2540,
    endPk: 2550,
    linkedModelIds: [],
    style: "Contrainte Environnementale",
  },
  {
    uid: "572",
    name: "Retrait des espèces florales - orchidées (zone 2 rouge)",
    activityId: "EPR2.153", // Added prefix
    startDate: new Date("2026-09-30T07:00:00"),
    endDate: new Date("2026-11-15T20:00:00"),
    startPk: 594,
    endPk: 860,
    linkedModelIds: [],
    style: "Contrainte Environnementale",
  },
  {
    uid: "9628",
    name: "Zone EST : Réalisation de la plateforme & VRD",
    activityId: "EPR2.232", // Added prefix
    startDate: new Date("2026-10-19T07:00:00"),
    endDate: new Date("2026-10-23T20:00:00"),
    startPk: 2393,
    endPk: 2443,
    linkedModelIds: [],
    style: "Installation de chantier",
  },
  {
    uid: "8932",
    name: "Zone EST : Installation de la base vie pionnière",
    activityId: "EPR2.233", // Added prefix
    startDate: new Date("2026-10-26T07:00:00"),
    endDate: new Date("2026-11-06T20:00:00"),
    startPk: 2393,
    endPk: 2443,
    linkedModelIds: [],
    style: "Installation de chantier",
  },
  {
    uid: "8930",
    name: "Zone EST : Aménagement du parking Parking 400 places NG2003",
    activityId: "EPR2.235", // Added prefix
    startDate: new Date("2026-11-09T07:00:00"),
    endDate: new Date("2026-12-03T20:00:00"),
    startPk: 2393,
    endPk: 2443,
    linkedModelIds: [],
    style: "Parking",
  },
  {
    uid: "9629",
    name: "Zone EST : Réalisation de la plateforme & VRD",
    activityId: "EPR2.238", // Added prefix
    startDate: new Date("2026-12-04T07:00:00"),
    endDate: new Date("2026-12-15T20:00:00"),
    startPk: 2393,
    endPk: 2443,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "8906",
    name: "Zone EST : Installation Base Vie NG2003",
    activityId: "EPR2.239", // Added prefix
    startDate: new Date("2026-12-16T07:00:00"),
    endDate: new Date("2027-01-22T20:00:00"),
    startPk: 2393,
    endPk: 2443,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "9630",
    name: "Zone EST : Réalisation de la plateforme & VRD",
    activityId: "EPR2.243", // Added prefix
    startDate: new Date("2026-12-04T07:00:00"),
    endDate: new Date("2026-12-15T20:00:00"),
    startPk: 2343,
    endPk: 2393,
    linkedModelIds: [],
    style: "Centrale à Béton",
  },
  {
    uid: "8903",
    name: "Zone EST : Installation de la centrale à béton / stock / ateliers / labos",
    activityId: "EPR2.244", // Added prefix
    startDate: new Date("2026-12-16T07:00:00"),
    endDate: new Date("2027-03-09T20:00:00"),
    startPk: 2343,
    endPk: 2393,
    linkedModelIds: [],
    style: "Centrale à Béton",
  },
  {
    uid: "8669",
    name: "Zone OUEST : Phase 2 : Retrait des clôtures/voiries réseaux existants",
    activityId: "EPR2.271", // Added prefix
    startDate: new Date("2026-11-09T07:00:00"),
    endDate: new Date("2027-02-12T20:00:00"),
    startPk: 193,
    endPk: 1683,
    linkedModelIds: [],
    style: "VRD",
  },
  {
    uid: "8670",
    name: "Zone OUEST : Phase 2 : Débroussaillage/décapage de la zone Ex-TERF",
    activityId: "EPR2.272", // Added prefix
    startDate: new Date("2026-11-09T07:00:00"),
    endDate: new Date("2027-02-12T20:00:00"),
    startPk: 193,
    endPk: 1683,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "7803",
    name: "Zone OUEST : Décapage Plateformes installations",
    activityId: "EPR2.278", // Added prefix
    startDate: new Date("2026-11-16T07:00:00"),
    endDate: new Date("2027-02-16T20:00:00"),
    startPk: 529,
    endPk: 594,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "89",
    name: "Zone OUEST : Amenée matériel pour la réalisation des plots d’essais.",
    activityId: "EPR2.301", // Added prefix
    startDate: new Date("2026-12-04T07:00:00"),
    endDate: new Date("2027-02-12T20:00:00"),
    startPk: 1713,
    endPk: 1763,
    linkedModelIds: [],
    style: "Installation de chantier",
  },
  {
    uid: "8676",
    name: "Phase 2 : Débroussaillage/décapage and viabilisation de la zone Sud OVH",
    activityId: "EPR2.316", // Added prefix
    startDate: new Date("2026-12-14T07:00:00"),
    endDate: new Date("2027-01-22T20:00:00"),
    startPk: 2343,
    endPk: 2443,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "7239",
    name: "Phase 2 : Construction du pont OVH",
    activityId: "EPR2.320", // Added prefix
    startDate: new Date("2026-12-03T20:00:00"),
    endDate: new Date("2027-04-20T20:00:00"),
    startPk: 2443,
    endPk: 2500,
    linkedModelIds: [],
    style: "GC",
  },
  {
    uid: "9443",
    name: "Pont provisoire OVH 1 travée",
    activityId: "EPR2.476", // Added prefix
    startDate: new Date("2026-09-30T07:00:00"),
    endDate: new Date("2027-05-26T20:00:00"),
    startPk: 2443,
    endPk: 2500,
    linkedModelIds: [],
    style: "GC",
  },
  {
    uid: "7812",
    name: "Déblai/remblai, régalge et compactage PF de la  Zone Est secteur B",
    activityId: "EPR2.589", // Added prefix
    startDate: new Date("2026-12-14T07:00:00"),
    endDate: new Date("2027-01-18T20:00:00"),
    startPk: 2343,
    endPk: 2550,
    linkedModelIds: [],
    style: "Plateforme",
  },
  {
    uid: "7837",
    name: " Déblai/remblai, régalge et compactage PF installations",
    activityId: "EPR2.594", // Added prefix
    startDate: new Date("2026-12-24T07:00:00"),
    endDate: new Date("2027-02-10T20:00:00"),
    startPk: 1763,
    endPk: 1813,
    linkedModelIds: [],
    style: "Plateforme",
  },
  {
    uid: "312",
    name: "Réalisation des voiries PST Zone Est secteur A",
    activityId: "EPR2.600", // Added prefix
    startDate: new Date("2026-11-16T07:00:00"),
    endDate: new Date("2027-01-27T20:00:00"),
    startPk: 1713,
    endPk: 1763,
    linkedModelIds: [],
    style: "VRD",
  },
  {
    uid: "2226",
    name: "Décapage Côté Est – Mise en dépôt provisoire",
    activityId: "EPR2.646", // Added prefix
    startDate: new Date("2026-11-16T07:00:00"),
    endDate: new Date("2027-03-03T20:00:00"),
    startPk: 1993,
    endPk: 2243,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "2380",
    name: "Déblais mis en remblai PF à +11m NGF",
    activityId: "EPR2.649", // Added prefix
    startDate: new Date("2026-12-24T07:00:00"),
    endDate: new Date("2027-04-19T20:00:00"),
    startPk: 1993,
    endPk: 2243,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "8665",
    name: "Phase 2 : Déviation du wateringue et de la route des enrochements",
    activityId: "EPR2.666", // Added prefix
    startDate: new Date("2026-09-30T07:00:00"),
    endDate: new Date("2027-01-12T20:00:00"),
    startPk: 2193,
    endPk: 2243,
    linkedModelIds: [],
    style: "VRD",
  },
  {
    uid: "8667",
    name: "Phase 2 : Débroussaillage/décapage de la zone CUD",
    activityId: "EPR2.667", // Added prefix
    startDate: new Date("2026-12-14T07:00:00"),
    endDate: new Date("2027-02-12T20:00:00"),
    startPk: 2243,
    endPk: 2293,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "8666",
    name: 'Phase 2 : Débroussaillage/décapage de la zone "New Odysselec"',
    activityId: "EPR2.670", // Added prefix
    startDate: new Date("2026-12-04T09:00:00"),
    endDate: new Date("2026-12-29T10:00:00"),
    startPk: 2093,
    endPk: 2193,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "8683",
    name: "Phase 3 : Remblaiement de plateforme Sud BU à +11,00mNGF de",
    activityId: "EPR2.671", // Added prefix
    startDate: new Date("2026-12-01T07:00:00"),
    endDate: new Date("2027-03-30T20:00:00"),
    startPk: 1683,
    endPk: 1713,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "9074",
    name: "BU : Reconnaissance et caractérisation des sols",
    activityId: "EPR2.700", // Added prefix
    startDate: new Date("2026-11-27T20:00:00"),
    endDate: new Date("2026-11-27T20:00:00"),
    startPk: 193,
    endPk: 1683,
    linkedModelIds: [],
    style: "Pyrotechnique",
  },
  {
    uid: "9280",
    name: "BU : Retrait des clôtures / voiries et réseaux existants",
    activityId: "EPR2.703", // Added prefix
    startDate: new Date("2026-11-30T07:00:00"),
    endDate: new Date("2026-12-17T20:00:00"),
    startPk: 193,
    endPk: 1683,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "9279",
    name: "BU : Débroussaillage / Décapage du site sur 20cm (+5.3m NGF)",
    activityId: "EPR2.704", // Added prefix
    startDate: new Date("2026-12-22T07:00:00"),
    endDate: new Date("2027-02-10T20:00:00"),
    startPk: 193,
    endPk: 1683,
    linkedModelIds: [],
    style: "Terrassement",
  },
  {
    uid: "9671",
    name: "BOP 2 : Création PF pour PM 10, 11 et 12 et PM 14, 15 et 16 du BOP 2",
    activityId: "EPR2.972", // Added prefix
    startDate: new Date("2025-09-30T07:00:00"),
    endDate: new Date("2025-10-02T20:00:00"),
    startPk: 193,
    endPk: 361,
    linkedModelIds: [],
    style: "Plateforme",
  },
  {
    uid: "9406",
    name: "BOP 2 : Réalisation des tirants par passes de terrassements zones BOP Tr 2 à -7,00 NGF ",
    activityId: "EPR2.986", // Added prefix
    startDate: new Date("2025-09-30T07:00:00"),
    endDate: new Date("2025-10-02T20:00:00"),
    startPk: 361,
    endPk: 529,
    linkedModelIds: [],
    style: "Tirants",
  },
  {
    uid: "9358",
    name: "BOP 2 : Réalisation des tirants par passes de terrassements zones BOP Tr 2 à -6,50 NGF",
    activityId: "EPR2.992", // Added prefix
    startDate: new Date("2025-09-30T07:00:00"),
    endDate: new Date("2025-10-02T20:00:00"),
    startPk: 361,
    endPk: 529,
    linkedModelIds: [],
    style: "Tirants",
  },
  {
    uid: "9399",
    name: "BOP 2 : Réalisation des tirants par passes de terrassements zones BOP Tr 2 à -12,00 NGF",
    activityId: "EPR2.994", // Added prefix
    startDate: new Date("2025-09-30T07:00:00"),
    endDate: new Date("2025-10-15T20:00:00"),
    startPk: 361,
    endPk: 529,
    linkedModelIds: [],
    style: "Tirants",
  },
  {
    uid: "9257",
    name: "Canal Secteur 1 : Diagnostics pyrotechniques pour forages",
    activityId: "EPR2.1018", // Added prefix
    startDate: new Date("2026-11-09T07:00:00"),
    endDate: new Date("2027-01-14T20:00:00"),
    startPk: 25,
    endPk: 193,
    linkedModelIds: [],
    style: "Pyrotechnique",
  },
  {
    uid: "9067",
    name: "Canal Secteur 1 : Réalisation de la vibro Canal Secteur 1 côté Rive Gauche",
    activityId: "EPR2.1019", // Added prefix
    startDate: new Date("2026-12-22T07:00:00"),
    endDate: new Date("2027-04-27T20:00:00"),
    startPk: 25,
    endPk: 193,
    linkedModelIds: [],
    style: "Vibro",
  },
  {
    uid: "338",
    name: "Inspection",
    activityId: "EPR2.1329", // Added prefix
    startDate: new Date("2025-10-01T07:00:00"),
    endDate: new Date("2025-10-01T20:00:00"),
    startPk: 1109,
    endPk: 1170,
    linkedModelIds: [],
    style: "Réception",
  },
  {
    uid: "339",
    name: "levée de réserves",
    activityId: "EPR2.1330", // Added prefix
    startDate: new Date("2025-10-02T07:00:00"),
    endDate: new Date("2025-11-04T20:00:00"),
    startPk: 1109,
    endPk: 1170,
    linkedModelIds: [],
    style: "Réception",
  },
  {
    uid: "340",
    name: "Inspection finale",
    activityId: "EPR2.1331", // Added prefix
    startDate: new Date("2025-11-05T07:00:00"),
    endDate: new Date("2025-11-05T20:00:00"),
    startPk: 1109,
    endPk: 1170,
    linkedModelIds: [],
    style: "Réception",
  },
  {
    uid: "341",
    name: "Réception",
    activityId: "EPR2.1332", // Added prefix
    startDate: new Date("2025-11-05T20:00:00"),
    endDate: new Date("2025-11-05T20:00:00"),
    startPk: 1109,
    endPk: 1170,
    linkedModelIds: [],
    style: "Réception",
  },
];
interface ActivitiesPanelProps {
  setActivities: Function;
  activities: ActivityModel[];
  toggleVisibilty: (modelIds: string[]) => void;
  isolateItem: (modelIds: string[]) => void;
  resetIsolated: (modelIds: string[]) => void;
  onLink: (activityUid: string, modelIds: string[]) => void;
  getSelectedModelIds: () => string[];
}

const ActivitiesPanel: React.FC<ActivitiesPanelProps> = ({
  toggleVisibilty,
  isolateItem,
  resetIsolated,
  onLink,
  getSelectedModelIds,
  activities,
  setActivities,
}) => {
  const { canWrite, isAdmin } = useAuth();
  const { t } = useTranslation();
  console.log("🚀 ~ ActivitiesPanel ~ activities:", activities);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activitiesListRef = useRef(null);
  const [visibilityState, setVisibilityState] = useState<{
    [key: string]: boolean;
  }>({});
  const [isolatedActivity, setIsolatedActivity] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    activityId: "",
    activityUID: "",
  });

  const currentActivityId = useSelector(selectCurrentActivityId);

  useEffect(() => {
    if (currentActivityId && activitiesListRef.current) {
      const currentActivityElement = activitiesListRef.current.querySelector(
        `[data-activity-id="${currentActivityId}"]`
      );
      if (currentActivityElement) {
        currentActivityElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Add highlight effect
        currentActivityElement.classList.add("bg-blue-50", "border-blue-200");
        setTimeout(() => {
          currentActivityElement.classList.remove(
            "bg-blue-50",
            "border-blue-200"
          );
        }, 2000);
      }
    }
  }, [currentActivityId]);

  // Filter activities based on search criteria
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesId =
        searchFilters.activityId === "" ||
        activity.activityId
          .toLowerCase()
          .includes(searchFilters.activityId.toLowerCase());

      const matchesUID =
        searchFilters.activityUID === "" ||
        (activity.activityUID &&
          activity.activityUID
            .toLowerCase()
            .includes(searchFilters.activityUID.toLowerCase()));

      return matchesId && matchesUID;
    });
  }, [activities, searchFilters]);

  const formatDate = (date: string | Date): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDuration = (startDate: Date, endDate: Date) => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const handleSearchFilterChange = (
    filterType: "activityId" | "activityUID",
    value: string
  ) => {
    setSearchFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Toggle timeline visibility for an activity
  const handleToggleTimelineVisibility = (activityUID: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.activityUID === activityUID
          ? {
              ...activity,
              persistAfterEnd: !activity.persistAfterEnd,
            }
          : activity
      )
    );
  };

  const handleLink = (uid: string) => {
    // Find the current activity to check its current linked state
    const currentActivity = activities.find((a) => a.activityUID === uid);
    const hasExistingLinks = (currentActivity?.linkedModelIds ?? []).length > 0;

    // If there are existing links, we can clear them without needing selected elements
    if (hasExistingLinks) {
      setActivities((prev) =>
        prev.map((activity) =>
          activity.activityUID === uid
            ? {
                ...activity,
                linkedModelIds: [],
              }
            : activity
        )
      );
      return; // Exit early, no need to call onLink
    }

    // Only check for selected elements when we want to add new links
    const selectedIds = getSelectedModelIds();
    if (selectedIds.length === 0) {
      alert("Please select model elements first in the 3D viewer.");
      return;
    }

    // Add new links
    setActivities((prev) =>
      prev.map((activity) =>
        activity.activityUID === uid
          ? {
              ...activity,
              linkedModelIds: [...selectedIds],
            }
          : activity
      )
    );

    onLink(uid, selectedIds);
  };

  const handleToggleVisibility = (activity: ActivityModel) => {
    if (activity.linkedModelIds?.length === 0) {
      alert("No linked model elements to toggle visibility.");
      return;
    }

    toggleVisibilty(activity.linkedModelIds ?? []);
    setVisibilityState((prev) => ({
      ...prev,
      [activity.activityUID!]: !prev[activity.activityUID!],
    }));
  };

  const handleIsolateItem = (activity: ActivityModel) => {
    if (activity.linkedModelIds?.length === 0) {
      alert("No linked model elements to isolate.");
      return;
    }

    isolateItem(activity.linkedModelIds ?? []);
    setIsolatedActivity(activity.activityUID!);
  };

  const handleResetIsolation = () => {
    if (isolatedActivity) {
      const activity = activities.find(
        (a) => a.activityUID === isolatedActivity
      );
      if (activity) {
        resetIsolated(activity.linkedModelIds ?? []);
      }
    }
    setIsolatedActivity(null);
  };

  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-96"
      }`}
    >
      {/* Header - Collapsible */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        {!isCollapsed && (
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Calendar className="w-5 h-5" />
            {t("activitiesPanel.title")}
          </h2>
        )}
        <div className="flex items-center gap-2">
          {!isCollapsed && isolatedActivity && (
            <button
              onClick={handleResetIsolation}
              className="flex items-center gap-1 px-3 py-1 text-sm text-white transition-colors bg-orange-500 rounded hover:bg-orange-600"
              title={t("activitiesPanel.actions.resetIsolation")}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-gray-500 transition-colors rounded hover:bg-gray-200 hover:text-gray-700"
            title={
              isCollapsed
                ? t("activitiesPanel.expand")
                : t("activitiesPanel.collapse")
            }
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Search Filters - Hidden when collapsed */}
      {!isCollapsed && (
        <div className="p-4 space-y-3 border-b border-gray-200 bg-gray-50">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("activitiesPanel.search.activityId")}
            </label>
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder={t("activitiesPanel.search.activityIdPlaceholder")}
                value={searchFilters.activityId}
                onChange={(e) =>
                  handleSearchFilterChange("activityId", e.target.value)
                }
                className="w-full py-2 pl-10 pr-3 transition-colors border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("activitiesPanel.search.activityUID")}
            </label>
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder={t("activitiesPanel.search.activityUIDPlaceholder")}
                value={searchFilters.activityUID}
                onChange={(e) =>
                  handleSearchFilterChange("activityUID", e.target.value)
                }
                className="w-full py-2 pl-10 pr-3 transition-colors border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Activities List */}
      <div ref={activitiesListRef} className="flex-1 p-4 overflow-auto">
        {isCollapsed ? (
          // Collapsed View - Icons Only
          <div className="space-y-2">
            {filteredActivities.map((activity) => (
              <button
                key={activity.activityUID}
                onClick={() => {
                  // Quick actions in collapsed mode
                  if (activity.linkedModelIds?.length > 0) {
                    handleToggleVisibility(activity);
                  }
                }}
                className={`w-full p-2 rounded-lg transition-all ${
                  currentActivityId === activity.id
                    ? "bg-blue-100 border border-blue-300"
                    : activity.linkedModelIds?.length > 0
                    ? "bg-green-100 hover:bg-green-200"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                title={`${activity.name}\n${
                  activity.linkedModelIds?.length || 0
                } ${t("activitiesPanel.activity.linkedElements")}`}
              >
                <div className="flex flex-col items-center gap-1">
                  <Calendar
                    className={`w-4 h-4 ${
                      currentActivityId === activity.id
                        ? "text-blue-600"
                        : activity.linkedModelIds?.length > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span className="max-w-full text-xs font-medium truncate">
                    {activity.activityId}
                  </span>
                  {activity.linkedModelIds?.length > 0 && (
                    <div className="text-xs font-bold text-green-600">
                      {activity.linkedModelIds.length}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Expanded View - Full Details
          <>
            {filteredActivities.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>{t("activitiesPanel.noActivities")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.activityUID}
                    data-activity-id={activity.id}
                    className={`border rounded-lg p-4 transition-all duration-200 ${
                      currentActivityId === activity.id
                        ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100"
                        : isolatedActivity === activity.activityUID
                        ? "border-orange-300 bg-orange-50"
                        : isolatedActivity &&
                          isolatedActivity !== activity.activityUID
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Activity Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-800 max-w-30 text-md">
                            {activity.name}
                          </h3>
                          {currentActivityId === activity.id && (
                            <div className="px-2 py-1 text-xs font-bold text-white bg-blue-500 rounded-full">
                              {t("activitiesPanel.activity.current")}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div>
                            {t("activitiesPanel.activity.id")}:{" "}
                            {activity.activityId}
                          </div>
                          <div>
                            {t("activitiesPanel.activity.uid")}:{" "}
                            {activity.activityUID}
                          </div>
                        </div>
                      </div>

                      {/* Timeline Visibility Toggle */}
                      <div className="flex flex-col items-end gap-2">
                        {(canWrite || isAdmin) && (
                          <button
                            onClick={() =>
                              handleToggleTimelineVisibility(
                                activity.activityUID!
                              )
                            }
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                              activity.persistAfterEnd
                                ? "text-green-600 bg-green-50 hover:bg-green-100"
                                : "text-gray-500 bg-gray-50 hover:bg-gray-100"
                            }`}
                            title={
                              activity.persistAfterEnd
                                ? t(
                                    "activitiesPanel.visibility.persistAfterEnd"
                                  )
                                : t("activitiesPanel.visibility.hideAfterEnd")
                            }
                          >
                            {activity.persistAfterEnd ? (
                              <ToggleRight className="w-4 h-4 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-400" />
                            )}
                            {t("activitiesPanel.actions.persist")}
                          </button>
                        )}
                        {/* Timeline Status Badge */}
                        <div
                          className={`text-xs px-2 py-1 rounded ${
                            activity.persistAfterEnd
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {activity.persistAfterEnd
                            ? t("activitiesPanel.visibility.visible")
                            : t("activitiesPanel.visibility.hidden")}
                        </div>
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="p-2 mb-3 text-sm rounded bg-gray-50">
                      <div className="flex items-center gap-2 mb-1 text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">
                          {t("activitiesPanel.actions.persist")}
                        </span>
                      </div>
                      <div className="text-gray-700">
                        {formatDate(activity.startDate)} →{" "}
                        {formatDate(activity.endDate)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {t("activitiesPanel.activity.duration")}: PK:{" "}
                        {activity.startPk}-{activity.endPk}
                      </div>
                    </div>

                    {/* Linked Models Status */}
                    <div className="mb-3">
                      {(activity?.linkedModelIds?.length ?? 0) > 0 ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {t("activitiesPanel.activity.linkedTo")}{" "}
                          {activity.linkedModelIds?.length}{" "}
                          {t("activitiesPanel.activity.modelElements")}
                          {activity.linkedModelIds?.length !== 1 ? "s" : ""}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          {t("activitiesPanel.activity.noLinkedElements")}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {(canWrite || isAdmin) && (
                      <div className="flex flex-wrap gap-2">
                        {/* Link Button */}
                        <button
                          onClick={() => handleLink(activity.activityUID!)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                          title={t("activitiesPanel.actions.linkSelected")}
                        >
                          <Link className="w-3 h-3" />
                          {t("activitiesPanel.actions.link")}
                        </button>

                        {/* Toggle Visibility Button */}
                        <button
                          onClick={() => handleToggleVisibility(activity)}
                          disabled={activity.linkedModelIds?.length === 0}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${
                            activity.linkedModelIds?.length === 0
                              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                              : visibilityState[activity.activityUID!]
                              ? "text-white bg-gray-600 hover:bg-gray-700"
                              : "text-white bg-green-500 hover:bg-green-600"
                          }`}
                          title={
                            visibilityState[activity.activityUID!]
                              ? t("activitiesPanel.actions.showElements")
                              : t("activitiesPanel.actions.hideElements")
                          }
                        >
                          {visibilityState[activity.activityUID!] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                          {visibilityState[activity.activityUID!]
                            ? t("activitiesPanel.visibility.show")
                            : t("activitiesPanel.visibility.hide")}
                        </button>

                        {/* Isolate Button */}
                        <button
                          onClick={() => handleIsolateItem(activity)}
                          disabled={
                            activity.linkedModelIds?.length === 0 ||
                            isolatedActivity === activity.activityUID
                          }
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${
                            activity.linkedModelIds?.length === 0 ||
                            isolatedActivity === activity.activityUID
                              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                              : "text-white bg-purple-500 hover:bg-purple-600"
                          }`}
                          title={t("activitiesPanel.actions.isolateElements")}
                        >
                          <Focus className="w-3 h-3" />
                          {t("activitiesPanel.actions.isolate")}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info - Hidden when collapsed */}
      {!isCollapsed && (
        <div className="p-4 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
          <div>
            {t("activitiesPanel.footer.totalActivities")}: {activities.length}
          </div>
          <div>
            {t("activitiesPanel.footer.filteredActivities")}:{" "}
            {filteredActivities.length}
          </div>
          <div>
            {t("activitiesPanel.footer.linkedActivities")}:{" "}
            {
              activities.filter((a) => (a.linkedModelIds?.length ?? 0) > 0)
                .length
            }
          </div>
          <div>
            {t("activitiesPanel.footer.notPersistedActivities")}:
            {activities.filter((a) => !a.persistAfterEnd).length}
          </div>
          {isolatedActivity && (
            <div className="mt-1 text-orange-600">
              {t("activitiesPanel.footer.isolated")}:{" "}
              {activities.find((a) => a.activityUID === isolatedActivity)?.name}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivitiesPanel;
