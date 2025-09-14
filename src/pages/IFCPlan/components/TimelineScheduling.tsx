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
}

const TimelineScheduling: React.FC<TimelineSchedulingProps> = ({
  activities,
  toggleVisibility,
  hideAllItems,
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

  // Incremental visibility: only show new activities when they start (one by one building effect)
  useEffect(() => {
    const newShownActivities = new Set(shownActivities);
    let hasChanges = false;

    // Find activities that should start showing (reached their start date)
    const activitiesToShow: string[] = [];

    activities.forEach((activity) => {
      const hasStarted = currentDate >= activity.startDate;
      const alreadyShown = shownActivities.has(activity.activityUID!);

      // Only show if it has started AND hasn't been shown yet AND has linked models
      if (
        hasStarted &&
        !alreadyShown &&
        (activity.linkedModelIds?.length ?? 0) > 0
      ) {
        newShownActivities.add(activity.activityUID!);
        activitiesToShow.push(...(activity.linkedModelIds ?? []));
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setShownActivities(newShownActivities);

      // Show the new activity elements
      if (activitiesToShow.length > 0) {
        toggleVisibility(activitiesToShow);
      }
    }
  }, [currentDate, activities, shownActivities, toggleVisibility]);

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

      {/* Active Activities Bar - Horizontal scrolling */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="flex-shrink-0 text-xs font-medium text-gray-700">
            Built:
          </span>
          {Array.from(shownActivities).length === 0 ? (
            <span className="flex-shrink-0 text-xs text-gray-500">
              No activities built yet
            </span>
          ) : (
            <div className="flex gap-2 overflow-x-auto">
              {Array.from(shownActivities).map((activityUID) => {
                const activity = activities.find(
                  (a) => a.activityUID === activityUID
                );
                return activity ? (
                  <span
                    key={activityUID}
                    className="flex-shrink-0 px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full"
                  >
                    {activity.name}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineScheduling;
