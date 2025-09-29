//@ts-ignore
//@ts-noCheck

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Calendar } from "lucide-react";
import { ActivityModel } from "src/types/Project";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentActivityIds,
  setCurrentActivityId,
  setCurrentActivityIds,
} from "src/state/slices/bimSlice";

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
  toggleVisibility: (modelIds: string[], visible?: boolean) => Promise<void>;
  hideAllItems?: () => Promise<void>;
  showAllItems?: () => Promise<void>;
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
  const [visibleModelIds, setVisibleModelIds] = useState<Set<string>>(
    new Set()
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  const dispatch = useDispatch();
  const currentActivityIds = useSelector(selectCurrentActivityIds);

  const intervalRef = useRef<NodeJS.Timeout>();
  const timelineRef = useRef<HTMLDivElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const isUpdatingRef = useRef(false);

  const [currentActivityNames, setCurrentActivityNames] = useState<string[]>(
    []
  );

  // Calculate timeline bounds
  useEffect(() => {
    if (activities.length === 0) return;

    const startDates = activities.map((a) => a.startDate);
    const endDates = activities.map((a) => a.endDate);

    const earliestStart = new Date(
      Math.min(...startDates.map((d) => d.getTime()))
    );
    const latestEnd = new Date(Math.max(...endDates.map((d) => d.getTime())));

    const timelineStartDate = new Date(earliestStart);
    timelineStartDate.setMonth(timelineStartDate.getMonth() - 1);

    const timelineEndDate = new Date(latestEnd);
    timelineEndDate.setMonth(timelineEndDate.getMonth() + 1);

    setTimelineStart(timelineStartDate);
    setTimelineEnd(timelineEndDate);
    setCurrentDate(timelineStartDate);
  }, [activities]);

  // Initialize by hiding all items when playback starts
  useEffect(() => {
    if (isPlaying && hideAllItems) {
      hideAllItems();
      setVisibleModelIds(new Set());
    }
  }, [isPlaying, hideAllItems]);
  useEffect(() => {
    if (activities.length === 0 || !isPlaying) return;

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(async () => {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;

      try {
        // Start with persistent activities that should always be visible
        const shouldBeVisible = new Set<string>();
        const toHide = new Set<string>();

        activities.forEach((activity) => {
          const hasStarted = currentDate >= activity.startDate;
          const hasEnded = currentDate > activity.endDate;
          const hasLinkedModels = (activity.linkedModelIds?.length ?? 0) > 0;

          if (!hasLinkedModels || !activity.linkedModelIds) return;

          if (activity.persistAfterEnd === true && hasStarted) {
            // ⭐ PERSISTENT: Once started, always visible
            activity.linkedModelIds.forEach((id) => shouldBeVisible.add(id));
          } else if (hasStarted && !hasEnded) {
            // ⭐ ACTIVE NON-PERSISTENT: Show while within date range
            activity.linkedModelIds.forEach((id) => shouldBeVisible.add(id));
          } else if (hasEnded && !activity.persistAfterEnd) {
            console.warn(
              "this is issues ",
              activity.activityUID,
              activity.persistAfterEnd
            );
            // ⭐ ENDED NON-PERSISTENT: Hide after end date
            activity.linkedModelIds.forEach((id) => toHide.add(id));
          }
          // ⭐ PERSISTENT activities that haven't started yet are not added
        });

        // Calculate changes from current state
        const currentlyVisible = visibleModelIds;
        const toShow = Array.from(shouldBeVisible).filter(
          (id) => !currentlyVisible.has(id)
        );
        const toHideFinal = Array.from(toHide).filter((id) =>
          currentlyVisible.has(id)
        );

        // Remove any items from current visibility that shouldn't be visible
        currentlyVisible.forEach((id) => {
          if (!shouldBeVisible.has(id) && !toHide.has(id)) {
            toHideFinal.push(id);
          }
        });

        if (toShow.length === 0 && toHideFinal.length === 0) {
          isUpdatingRef.current = false;
          return;
        }

        console.log("Visibility update:", {
          date: formatDateShort(currentDate),
          toShow: toShow.length,
          toHide: toHideFinal.length,
          persistent: activities.filter(
            (a) => a.persistAfterEnd && currentDate >= a.startDate
          ).length,
        });

        // ⭐ CRITICAL: Apply changes in proper sequence
        const updatePromises = [];

        if (toHideFinal.length > 0) {
          updatePromises.push(toggleVisibility(toHideFinal, false));
        }

        if (toShow.length > 0) {
          updatePromises.push(toggleVisibility(toShow, true));
        }

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        // Update state with the final visibility set
        setVisibleModelIds(shouldBeVisible);
      } catch (error) {
        console.error("Visibility update error:", error);
      } finally {
        isUpdatingRef.current = false;
      }
    }, 100); // Increased debounce for stability

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [currentDate, activities, isPlaying, visibleModelIds, toggleVisibility]);
  // ⭐ Update current activity names
  useEffect(() => {
    if (activities.length === 0) return;

    const currentActivities = activities.filter(
      (activity) =>
        currentDate >= activity.startDate && currentDate <= activity.endDate
    );

    const newActivityIds = currentActivities.map((activity) => activity.id);
    const newActivityNames = currentActivities.map((activity) => activity.name);

    // Update Redux
    const idsChanged =
      JSON.stringify(newActivityIds) !== JSON.stringify(currentActivityIds);
    if (idsChanged) {
      dispatch(setCurrentActivityIds(newActivityIds));
    }

    // Update local names
    const namesChanged =
      JSON.stringify(newActivityNames) !== JSON.stringify(currentActivityNames);
    if (namesChanged) {
      setCurrentActivityNames(newActivityNames);
    }
  }, [
    currentDate,
    activities,
    dispatch,
    currentActivityIds,
    currentActivityNames,
  ]);

  // Auto-scroll to current position
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

  const resetTimeline = async () => {
    pausePlayback();

    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    setCurrentDate(timelineStart);
    setVisibleModelIds(new Set());
    setCurrentActivityNames([]);
    dispatch(setCurrentActivityIds([]));

    if (showAllItems) {
      await showAllItems();
    }

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

  const getTimelineWidth = () => {
    const totalMonths = Math.ceil(
      (timelineEnd.getTime() - timelineStart.getTime()) /
        (1000 * 60 * 60 * 24 * 30)
    );
    return Math.max(800, totalMonths * 120);
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
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

  return (
    <div className="w-full bg-white">
      {/* Timeline Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
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

          {/* Current Activities Display - Vertical Scroll */}
          {currentActivityNames.length > 0 && (
            <div className="flex items-center max-w-md gap-2 ml-3">
              <div className="flex items-center flex-shrink-0 gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-blue-700">
                  Current:
                </span>
              </div>
              <div className="flex flex-col gap-1 pr-2 overflow-y-auto max-h-16 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
                {currentActivityNames.map((name, index) => (
                  <div
                    key={currentActivityIds[index] || index}
                    className="flex-shrink-0 px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded shadow"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Date */}
        <div className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded">
          {formatDateFull(currentDate)}
        </div>

        {/* Right Info */}
        <div className="flex items-center gap-3">
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
              {visibleModelIds.size}
            </span>
            <span className="text-gray-400">/</span>
            <span>
              {activities.reduce(
                (sum, a) => sum + (a.linkedModelIds?.length || 0),
                0
              )}
            </span>
            <div className="text-xs text-gray-500">Visible</div>
          </div>
        </div>
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
        <div
          className="absolute w-2 h-4 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded pointer-events-none top-1/2"
          style={{ left: `${getSliderPosition()}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TimelineScheduling;
