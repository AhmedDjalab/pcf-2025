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
  setCurrentActivityId?: any;
}

const TimelineScheduling: React.FC<TimelineSchedulingProps> = ({
  activities,
  toggleVisibility,
  hideAllItems,
  showAllItems,
  setCurrentActivityId,
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
  const [currentActivityName, setCurrentActivityName] = useState<string | null>(
    null
  );

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
    const currentActivity = activities.find(
      (activity) =>
        currentDate >= activity.startDate && currentDate <= activity.endDate
    );

    if (currentActivity) {
      //setCurrentActivityId?.(currentActivity.id);
      setCurrentActivityName(currentActivity.name);
    } else {
      setCurrentActivityName(null);
    }
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
  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const timelineWidth = getTimelineWidth();

  return (
    <div className="w-full bg-white">
      {/* Compact Timeline Header */}
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

          {/* Current Activity */}
          {currentActivityName && (
            <div className="px-3 py-1 ml-3 text-xs font-medium text-white bg-blue-500 rounded shadow">
              {currentActivityName}
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
              {shownActivities.size}
            </span>
            <span className="text-gray-400">/</span>
            <span>{activities.length}</span>
            <div className="text-xs text-gray-500">Built</div>
          </div>
        </div>
      </div>
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
  );
};

export default TimelineScheduling;
