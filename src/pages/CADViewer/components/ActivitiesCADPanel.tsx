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
import { Spinner } from "react-bootstrap";
import { Circle } from "react-konva";
import Accordion from "src/components/shared/Accordian";

interface ActivitiesCADPanelProps {
  setActivities: Function;
  activities: ActivityModel[];
  toggleVisibilty: (modelIds: string[]) => void;
  handleVisibilty: (modelIds: string[], visible: boolean) => void;
  isolateItem: (modelIds: string[]) => void;
  resetIsolated: (modelIds: string[]) => void;
  onLink: (activityUid: string, modelIds: string[]) => void;
  getSelectedModelIds: () => string[];
  AutomaticLinkingLogic: JSX.Element;
  handleSaveBimData: any;
  isSubmitting: boolean;
}

const ActivitiesCADPanel: React.FC<ActivitiesCADPanelProps> = ({
  toggleVisibilty,
  isolateItem,
  resetIsolated,
  onLink,
  getSelectedModelIds,
  activities,
  setActivities,
  AutomaticLinkingLogic,
  handleSaveBimData,
  isSubmitting,
  handleVisibilty,
}) => {
  const { canWrite, isAdmin } = useAuth();
  const { t } = useTranslation();
  console.log("🚀 ~ ActivitiesPanel ~ activities:", activities);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const activitiesListRef = useRef(null);
  const [visibilityState, setVisibilityState] = useState<{
    [key: string]: boolean;
  }>({});
  const [isolatedActivity, setIsolatedActivity] = useState<string[] | null>(
    null
  );
  const [searchFilters, setSearchFilters] = useState({
    activityId: "",
    activityUID: "",
    name: "",
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
      const matchesName =
        searchFilters.name === "" ||
        (activity.name &&
          activity.name
            .toLowerCase()
            .includes(searchFilters.name.toLowerCase()));

      return matchesId && matchesUID && matchesName;
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
              persistCADAfterEnd: !activity.persistCADAfterEnd,
            }
          : activity
      )
    );
  };

  const handleLink = (uid: string) => {
    // Find the current activity to check its current linked state
    const currentActivity = activities.find((a) => a.activityUID === uid);
    console.log("🚀 ~ handleLink ~ currentActivity:", currentActivity);
    const hasExistingLinks =
      (currentActivity?.cadLinkedModelIds ?? []).length > 0;

    // If there are existing links, we can clear them without needing selected elements
    // if (hasExistingLinks) {
    //   setActivities((prev) =>
    //     prev.map((activity) =>
    //       activity.activityUID === uid
    //         ? {
    //             ...activity,
    //             cadLinkedModelIds: [],
    //           }
    //         : activity
    //     )
    //   );
    //   return; // Exit early, no need to call onLink
    // }

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
              cadLinkedModelIds: [...selectedIds],
            }
          : activity
      )
    );

    onLink(uid, selectedIds);
  };
  const resetLinking = (uid: string) => {
    // Find the current activity to check its current linked state
    const currentActivity = activities.find((a) => a.activityUID === uid);
    const hasExistingLinks =
      (currentActivity?.cadLinkedModelIds ?? []).length > 0;

    setActivities((prev) =>
      prev.map((activity) =>
        activity.activityUID === uid
          ? {
              ...activity,
              cadLinkedModelIds: [],
            }
          : activity
      )
    );
  };

  const handleToggleVisibility = (activity: ActivityModel) => {
    if (activity.cadLinkedModelIds?.length === 0) {
      alert("No linked model elements to toggle visibility.");
      return;
    }

    toggleVisibilty(activity.cadLinkedModelIds ?? []);
    setVisibilityState((prev) => ({
      ...prev,
      [activity.activityUID!]: !prev[activity.activityUID!],
    }));
  };

  const handleIsolateItem = (activity: ActivityModel) => {
    if (activity.cadLinkedModelIds?.length === 0) {
      alert("No linked model elements to isolate.");
      return;
    }
    isolateItem(activity.cadLinkedModelIds ?? []);
    console.log(
      "🚀 ~ handleIsolateItem ~ activity.cadLinkedModelIds:",
      activity.cadLinkedModelIds
    );

    setIsolatedActivity([activity.activityUID!]);
  };

  const handleResetIsolation = () => {
    console.log(
      "🚀 ~ handleResetIsolation ~ isolatedActivity:",
      isolatedActivity
    );

    if (isolatedActivity?.length) {
      // Find all matching activities
      const matchedActivities = activities.filter((a) =>
        isolatedActivity.includes(a.activityUID!)
      );

      // Collect all linked model IDs from those activities
      const linkedIds = matchedActivities.flatMap(
        (a) => a.cadLinkedModelIds ?? []
      );

      // Reset isolation for all found model IDs
      if (linkedIds.length) {
        resetIsolated(linkedIds);
      }
    }

    // Clear isolation state
    setIsolatedActivity(null);
  };
  const showLinkedShapeActivities = () => {
    const linkedActiives = activities.filter(
      (x) => (x.cadLinkedModelIds?.length ?? 0) > 0
    );
    const localIds = linkedActiives.flatMap((x) => x.cadLinkedModelIds);
    const activityUIDs = linkedActiives.flatMap((x) => x.activityUID!);
    console.log("🚀 ~ showLinkedShapeActivities ~ localIds:", localIds);
    setIsolatedActivity(activityUIDs);
    handleVisibilty(localIds, true);
  };

  return (
    <div
      className={`flex flex-col h-full  bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-96"
      }`}
    >
      {/* Header - Collapsible */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 max-h-20 bg-gray-50">
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
      {/* buttons */}
      <div className="flex items-center justify-center gap-2 p-2 ">
        {AutomaticLinkingLogic}
        <button
          onClick={handleSaveBimData}
          disabled={isSubmitting}
          className="w-20 px-2 py-2 font-medium text-white transition-all duration-200 transform rounded-lg shadow-md bg-primary hover:bg-primary-600 active:bg-primary-700 hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : (
            t("ifcPlan.save")
          )}
        </button>
        <button
          onClick={showLinkedShapeActivities}
          className="w-20 px-2 py-2 font-medium text-white transition-all duration-200 transform bg-orange-300 rounded-lg shadow-md hover:bg-orange-600 active:bg-orange-700 hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {t("ifcPlan.showObject")}
        </button>
      </div>
      {/* Search Filters - Hidden when collapsed */}
      {!isCollapsed && (
        <Accordion title="filters">
          <div className="p-4 space-y-3 border-b border-gray-200 bg-gray-50">
            {/*//! add  activity linking and sae button */}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("activitiesPanel.search.activityId")}
              </label>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder={t(
                    "activitiesPanel.search.activityIdPlaceholder"
                  )}
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
                  placeholder={t(
                    "activitiesPanel.search.activityUIDPlaceholder"
                  )}
                  value={searchFilters.activityUID}
                  onChange={(e) =>
                    handleSearchFilterChange("activityUID", e.target.value)
                  }
                  className="w-full py-2 pl-10 pr-3 transition-colors border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("activitiesPanel.search.name")}
              </label>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder={t("activitiesPanel.search.namePlaceholder")}
                  value={searchFilters.name}
                  onChange={(e) =>
                    handleSearchFilterChange("name", e.target.value)
                  }
                  className="w-full py-2 pl-10 pr-3 transition-colors border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </Accordion>
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
                  if (activity.cadLinkedModelIds?.length > 0) {
                    handleToggleVisibility(activity);
                  }
                }}
                className={`w-full p-2 rounded-lg transition-all ${
                  currentActivityId === activity.id
                    ? "bg-blue-100 border border-blue-300"
                    : activity.cadLinkedModelIds?.length > 0
                    ? "bg-green-100 hover:bg-green-200"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                title={`${activity.name}\n${
                  activity.cadLinkedModelIds?.length || 0
                } ${t("activitiesPanel.activity.linkedElements")}`}
              >
                <div className="flex flex-col items-center gap-1">
                  <Calendar
                    className={`w-4 h-4 ${
                      currentActivityId === activity.id
                        ? "text-blue-600"
                        : activity.cadLinkedModelIds?.length > 0
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  />
                  <span className="max-w-full text-xs font-medium truncate">
                    {activity.activityId}
                  </span>
                  {activity.cadLinkedModelIds?.length > 0 && (
                    <div className="text-xs font-bold text-green-600">
                      {activity.cadLinkedModelIds?.length}
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
                              activity.persistCADAfterEnd
                                ? "text-green-600 bg-green-50 hover:bg-green-100"
                                : "text-gray-500 bg-gray-50 hover:bg-gray-100"
                            }`}
                            title={
                              activity.persistCADAfterEnd
                                ? t(
                                    "activitiesPanel.visibility.persistCADAfterEnd"
                                  )
                                : t("activitiesPanel.visibility.hideAfterEnd")
                            }
                          >
                            {activity.persistCADAfterEnd ? (
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
                            activity.persistCADAfterEnd
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {activity.persistCADAfterEnd
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
                        {t("activitiesPanel.activity.duration")}:{" "}
                        {activity.duration} | PK: {activity.startPk}-
                        {activity.endPk}
                      </div>
                    </div>

                    {/* Linked Models Status */}
                    <div className="mb-3">
                      {(activity?.cadLinkedModelIds?.length ?? 0) > 0 ? (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          {t("activitiesPanel.activity.linkedTo")}{" "}
                          {activity.cadLinkedModelIds?.length}{" "}
                          {t("activitiesPanel.activity.modelElements")}
                          {activity.cadLinkedModelIds?.length !== 1 ? "s" : ""}
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
                        <button
                          onClick={() => resetLinking(activity.activityUID!)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                          title={t("activitiesPanel.actions.reset")}
                        >
                          <RotateCcw className="w-3 h-3" />
                          {t("activitiesPanel.actions.reset")}
                        </button>

                        {/* Toggle Visibility Button */}
                        <button
                          onClick={() => handleToggleVisibility(activity)}
                          disabled={activity.cadLinkedModelIds?.length === 0}
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${
                            activity.cadLinkedModelIds?.length === 0
                              ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                              : visibilityState[activity.activityUID!]
                              ? "text-white bg-gray-600 hover:bg-gray-700"
                              : "text-white bg-green-500 hover:bg-green-600"
                          }`}
                          title={
                            !visibilityState[activity.activityUID!]
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
                            activity.cadLinkedModelIds?.length === 0 ||
                            isolatedActivity?.includes(activity.activityUID!)
                          }
                          className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${
                            activity.cadLinkedModelIds?.length === 0 ||
                            isolatedActivity?.includes(activity.activityUID!)
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
              activities.filter((a) => (a.cadLinkedModelIds?.length ?? 0) > 0)
                .length
            }
          </div>
          <div>
            {t("activitiesPanel.footer.notPersistedActivities")}:
            {activities.filter((a) => !a.persistCADAfterEnd).length}
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

export default ActivitiesCADPanel;
