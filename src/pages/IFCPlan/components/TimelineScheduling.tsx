//@ts-ignore
//@ts-noCheck

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Calendar } from "lucide-react";
import { ActivityModel } from "src/types/Project";

// interface Activity {
//   activityUID: string;
//   name: string;
//   activityId: string;
//   startDate: Date;
//   endDate: Date;
//   startPk: number;
//   endPk: number;
//   linkedModelIds: string[];
// }

interface TimelineSchedulingProps {
  activities: ActivityModel[];
  toggleVisibility: (modelIds: string[]) => void;
  hideAllItems?: () => void;
  showAllItems?: () => void;
}

const TimelineScheduling: React.FC<TimelineSchedulingProps> = ({
  activities,
  toggleVisibility,
  hideAllItems,
  showAllItems,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [timelineStart, setTimelineStart] = useState<Date>(new Date());
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());
  const [shownActivities, setShownActivities] = useState<Set<string>>(
    new Set()
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // milliseconds per day
  const intervalRef = useRef<NodeJS.Timeout>();
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate timeline bounds (1 month before earliest, 1 month after latest)
  useEffect(() => {
    if (activities.length === 0) return;

    const startDates = activities.map((a) => a.startDate);
    const endDates = activities.map((a) => a.endDate);

    const earliestStart = new Date(
      Math.min(...startDates.map((d) => d.getTime()))
    );
    const latestEnd = new Date(Math.max(...endDates.map((d) => d.getTime())));

    // Add 1 month buffer before and after
    const timelineStartDate = new Date(earliestStart);
    timelineStartDate.setMonth(timelineStartDate.getMonth() - 1);

    const timelineEndDate = new Date(latestEnd);
    timelineEndDate.setMonth(timelineEndDate.getMonth() + 1);

    setTimelineStart(timelineStartDate);
    setTimelineEnd(timelineEndDate);
    setCurrentDate(timelineStartDate);
  }, [activities]);

  // Initialize by hiding all items
  useEffect(() => {
    if (isPlaying) {
      if (hideAllItems) {
        hideAllItems();
      }
      setShownActivities(new Set());
    }
  }, [hideAllItems, isPlaying]);

  useEffect(() => {
    if (activities.length === 0) return;

    // Calculate what should be visible at current date
    const activitiesToShow = activities.filter((activity) => {
      const hasStarted = currentDate >= activity.startDate;
      const hasEnded = currentDate >= activity.endDate;
      const hasLinkedModels = (activity.linkedModelIds?.length ?? 0) > 0;
      const isPersistent = activity.persistAfterEnd === true;

      return hasStarted && hasLinkedModels && (isPersistent || !hasEnded);
    });

    // Get all model IDs that should be visible
    const modelIdsToShow = new Set<string>();
    activitiesToShow.forEach((activity) => {
      activity.linkedModelIds?.forEach((id) => modelIdsToShow.add(id));
    });

    // Check if we've reached the end
    const lastActivityEnded =
      currentDate >= Math.max(...activities.map((a) => a.endDate.getTime()));

    // Handle end state - show everything
    if (lastActivityEnded) {
      showAllItems();
      setShownActivities(
        new Set(activities.map((a) => a.activityUID!).filter(Boolean))
      );
      return;
    }

    // Calculate what's currently shown
    const currentlyShownModelIds = new Set<string>();
    activities.forEach((activity) => {
      if (
        shownActivities.has(activity.activityUID!) &&
        activity.linkedModelIds
      ) {
        activity.linkedModelIds.forEach((id) => currentlyShownModelIds.add(id));
      }
    });

    // Find differences
    const toShow: string[] = [];
    const toHide: string[] = [];

    // What should be shown but isn't
    modelIdsToShow.forEach((modelId) => {
      if (!currentlyShownModelIds.has(modelId)) {
        toShow.push(modelId);
      }
    });

    // What is shown but shouldn't be
    currentlyShownModelIds.forEach((modelId) => {
      if (!modelIdsToShow.has(modelId)) {
        toHide.push(modelId);
      }
    });

    // Apply changes
    if (toShow.length > 0 || toHide.length > 0) {
      console.log("Visibility update:", {
        toShow: toShow.length,
        toHide: toHide.length,
        currentDate: formatDateShort(currentDate),
      });

      // Apply changes in batch
      const updatePromises = [];
      if (toHide.length > 0) {
        updatePromises.push(toggleVisibility(toHide, false));
      }
      if (toShow.length > 0) {
        updatePromises.push(toggleVisibility(toShow, true));
      }

      // Wait for all visibility updates to complete
      Promise.all(updatePromises).then(() => {
        // Update state only after visibility changes are applied
        const newShownActivities = new Set(
          activitiesToShow.map((a) => a.activityUID!).filter(Boolean)
        );
        setShownActivities(newShownActivities);
      });
    }
  }, [
    currentDate,
    activities,
    shownActivities,
    toggleVisibility,
    showAllItems,
  ]);
  // Auto-scroll to current date position
  useEffect(() => {
    if (timelineRef.current && isPlaying) {
      const sliderPosition = getSliderPosition();
      const timelineWidth = timelineRef.current.scrollWidth;
      const containerWidth = timelineRef.current.clientWidth;
      const scrollPosition =
        (sliderPosition / 100) * (timelineWidth - containerWidth);

      timelineRef.current.scrollTo({
        left: Math.max(0, scrollPosition - containerWidth / 2),
        behavior: "smooth",
      });
    }
  }, [currentDate, isPlaying]);

  const startPlayback = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentDate((prevDate) => {
        const nextDate = new Date(prevDate);
        nextDate.setDate(nextDate.getDate() + 1);

        if (nextDate > timelineEnd) {
          setIsPlaying(false);
          return prevDate;
        }

        return nextDate;
      });
    }, playbackSpeed);
  };

  const pausePlayback = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
  };

  const resetTimeline = () => {
    pausePlayback();
    setCurrentDate(timelineStart);
    if (hideAllItems) {
      hideAllItems();
    }
    setShownActivities(new Set());
    if (showAllItems) {
      showAllItems();
    }
    // Scroll to beginning
    if (timelineRef.current) {
      timelineRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseFloat(e.target.value);
    const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
    const newDate = new Date(
      timelineStart.getTime() + (totalDuration * percentage) / 100
    );
    setCurrentDate(newDate);
  };

  const getSliderPosition = () => {
    const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
    const currentPosition = currentDate.getTime() - timelineStart.getTime();
    return (currentPosition / totalDuration) * 100;
  };

  // Calculate minimum width based on timeline duration
  const getTimelineWidth = () => {
    const totalMonths = Math.ceil(
      (timelineEnd.getTime() - timelineStart.getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );
    return Math.max(800, totalMonths * 120); // Minimum 120px per month
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getMonthMarkers = () => {
    const markers = [];
    const current = new Date(timelineStart);
    current.setDate(1); // Start at first of month

    while (current <= timelineEnd) {
      const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
      const position =
        ((current.getTime() - timelineStart.getTime()) / totalDuration) * 100;

      markers.push({
        date: new Date(current),
        position: Math.max(0, Math.min(100, position)),
      });

      current.setMonth(current.getMonth() + 1);
    }

    return markers;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (activities.length === 0) {
    return (
      <div className="w-full p-4 bg-gray-100 border border-gray-300 rounded">
        <p className="text-center text-gray-500">
          No activities available for timeline
        </p>
      </div>
    );
  }

  const timelineWidth = getTimelineWidth();

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Horizontal Layout Container */}
      <div className="flex items-center gap-4 p-3">
        {/* Left Controls */}
        <div className="flex items-center flex-shrink-0 gap-2">
          <Calendar className="w-4 h-4 text-gray-600" />
          <button
            onClick={resetTimeline}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-700 transition-colors bg-gray-200 rounded hover:bg-gray-300"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>

          <button
            onClick={isPlaying ? pausePlayback : startPlayback}
            className={`flex items-center gap-1 px-3 py-1 text-xs text-white rounded transition-colors ${
              isPlaying
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>

        {/* Timeline Container - Takes remaining space with horizontal scroll */}
        <div className="relative flex-1 overflow-x-auto" ref={timelineRef}>
          <div style={{ minWidth: `${timelineWidth}px` }}>
            {/* Month markers */}
            <div className="relative h-20 mb-1">
              {getMonthMarkers().map((marker, index) => (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${marker.position}%` }}
                >
                  <div className="w-px h-3 bg-gray-400"></div>
                  <div className="text-xs text-gray-600 mt-0.5 transform -translate-x-1/2 whitespace-nowrap">
                    {marker.date.toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Activity bars - Stacked horizontally */}
            <div className="relative h-8 mb-2 bg-gray-100 rounded">
              {activities.map((activity, index) => {
                const totalDuration =
                  timelineEnd.getTime() - timelineStart.getTime();
                const activityStart =
                  ((activity.startDate.getTime() - timelineStart.getTime()) /
                    totalDuration) *
                  100;
                const activityDuration =
                  ((activity.endDate.getTime() - activity.startDate.getTime()) /
                    totalDuration) *
                  100;
                const hasStarted = currentDate >= activity.startDate;
                const isShown = shownActivities.has(activity.activityUID!);

                return (
                  <div
                    key={activity.activityUID}
                    className={`absolute h-1.5 rounded transition-all duration-300 ${
                      isShown
                        ? "bg-green-500 shadow-sm"
                        : hasStarted
                        ? "bg-orange-400"
                        : "bg-gray-300"
                    }`}
                    style={{
                      left: `${Math.max(0, activityStart)}%`,
                      width: `${Math.min(
                        100 - Math.max(0, activityStart),
                        activityDuration
                      )}%`,
                      top: `${2 + index * 4}px`,
                    }}
                    title={`${activity.name}: ${formatDate(
                      activity.startDate
                    )} - ${formatDate(activity.endDate)} ${
                      isShown ? "(Built)" : hasStarted ? "(Ready)" : "(Pending)"
                    }`}
                  />
                );
              })}
            </div>

            {/* Timeline Slider */}
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={getSliderPosition()}
                onChange={handleSliderChange}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              {/* Current position indicator */}
              <div
                className="absolute w-2 h-4 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded pointer-events-none top-1/2"
                style={{ left: `${getSliderPosition()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Info */}
        <div className="flex items-center flex-shrink-0 gap-3">
          {/* Current Date */}
          <div className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded">
            {formatDateShort(currentDate)}
          </div>

          {/* Speed Control */}
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value={100}>Fast</option>
            <option value={500}>Medium</option>
            <option value={1000}>Normal</option>
            <option value={2000}>Slow</option>
          </select>

          {/* Progress Indicator */}
          <div className="text-xs text-gray-600">
            <span className="font-medium text-green-600">
              {shownActivities.size}
            </span>
            <span className="text-gray-400">/</span>
            <span>{activities.length}</span>
            <div className="text-xs text-gray-500">Built</div>
          </div>
        </div>
      </div>
      {/* Active Activities Bar - Compact Vertical Design */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-start gap-4">
          <span className="flex-shrink-0 pt-2 text-sm font-semibold text-gray-700">
            Construction Sequence:
          </span>

          {Array.from(shownActivities).length === 0 ? (
            <span className="py-2 text-sm text-gray-500">
              No activities built yet
            </span>
          ) : (
            <div className="flex-1">
              {/* Current Activity - Always Visible */}
              {(() => {
                const currentActivity = activities
                  .filter((activity) =>
                    shownActivities.has(activity.activityUID!)
                  )
                  .find(
                    (activity) =>
                      currentDate >= activity.startDate &&
                      currentDate <= activity.endDate
                  );

                return currentActivity ? (
                  <div className="p-3 mb-3 border border-blue-200 rounded-lg shadow-sm bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-blue-600">
                            CURRENT
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-blue-900">
                          {currentActivity.name}
                        </span>
                      </div>
                      <div className="text-xs text-blue-700">
                        {formatDateShort(currentActivity.startDate)} -{" "}
                        {formatDateShort(currentActivity.endDate)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 mb-3 bg-gray-100 border border-gray-300 rounded-lg">
                    <div className="text-sm text-center text-gray-600">
                      No active construction - All activities completed or
                      pending
                    </div>
                  </div>
                );
              })()}

              {/* Upcoming & Completed Activities - Vertical Scroll */}
              <div className="bg-white border border-gray-300 rounded-lg">
                <div className="overflow-y-auto max-h-40">
                  {activities
                    .filter((activity) =>
                      shownActivities.has(activity.activityUID!)
                    )
                    .sort(
                      (a, b) => a.startDate.getTime() - b.startDate.getTime()
                    )
                    .map((activity, index, sortedActivities) => {
                      const isCurrent =
                        currentDate >= activity.startDate &&
                        currentDate <= activity.endDate;
                      const isCompleted = currentDate > activity.endDate;
                      const isUpcoming = currentDate < activity.startDate;

                      // Skip current activity since it's shown above
                      if (isCurrent) return null;

                      return (
                        <div
                          key={activity.activityUID}
                          className={`
                      flex items-center gap-3 p-2 border-b border-gray-200 last:border-b-0
                      ${
                        isCompleted
                          ? "bg-green-50"
                          : isUpcoming
                          ? "bg-orange-50"
                          : "bg-white"
                      }
                      hover:bg-gray-50 transition-colors
                    `}
                        >
                          {/* Status Indicator */}
                          <div
                            className={`
                      w-2 h-2 rounded-full flex-shrink-0
                      ${
                        isCompleted
                          ? "bg-green-500"
                          : isUpcoming
                          ? "bg-orange-400"
                          : "bg-gray-400"
                      }
                    `}
                          ></div>

                          {/* Activity Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={`
                          text-sm font-medium truncate
                          ${
                            isCompleted
                              ? "text-green-800"
                              : isUpcoming
                              ? "text-orange-800"
                              : "text-gray-700"
                          }
                        `}
                              >
                                {activity.name}
                              </span>
                              <span className="flex-shrink-0 ml-2 text-xs text-gray-500">
                                {formatDateShort(activity.startDate)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span
                                className={`
                          text-xs
                          ${
                            isCompleted
                              ? "text-green-600"
                              : isUpcoming
                              ? "text-orange-600"
                              : "text-gray-500"
                          }
                        `}
                              >
                                {isCompleted
                                  ? "Completed"
                                  : isUpcoming
                                  ? "Upcoming"
                                  : "In Progress"}
                              </span>
                              <span className="flex-shrink-0 text-xs text-gray-400">
                                {formatDateShort(activity.endDate)}
                              </span>
                            </div>
                          </div>

                          {/* Status Icon */}
                          {isCompleted && (
                            <svg
                              className="flex-shrink-0 w-4 h-4 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {isUpcoming && (
                            <svg
                              className="flex-shrink-0 w-4 h-4 text-orange-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}
                        </div>
                      );
                    })}

                  {/* Empty state for scroll area */}
                  {activities.filter(
                    (activity) =>
                      shownActivities.has(activity.activityUID!) &&
                      !(
                        currentDate >= activity.startDate &&
                        currentDate <= activity.endDate
                      )
                  ).length === 0 && (
                    <div className="p-4 text-sm text-center text-gray-500">
                      No other activities to show
                    </div>
                  )}
                </div>

                {/* Scroll indicator */}
                <div className="px-3 py-2 bg-gray-100 border-t border-gray-300 rounded-b-lg">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>
                          Completed:{" "}
                          {
                            activities.filter(
                              (a) =>
                                shownActivities.has(a.activityUID!) &&
                                currentDate > a.endDate
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>
                          Upcoming:{" "}
                          {
                            activities.filter(
                              (a) =>
                                shownActivities.has(a.activityUID!) &&
                                currentDate < a.startDate
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-400">Scroll to see more ↓</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineScheduling;
