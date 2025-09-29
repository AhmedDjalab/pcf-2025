// types/bimTypes.ts
// slices/bimSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Activity {
  id: string;
  activityUID: string;
  name: string;
  startDate: Date;
  endDate: Date;
  linkedModelIds?: string[];
  persistAfterEnd?: boolean;
  startPk?: number;
  endPk?: number;
  activityId?: string;
}

export interface BimState {
  currentActivityId: string | null;
  currentActivityIds: string[] | null;
  activities: Activity[];
  isPlaying: boolean;
  currentDate: Date;
  timelineStart: Date;
  timelineEnd: Date;
  shownActivities: Set<string>;
  playbackSpeed: number;
  panelsVisible: boolean;
}

const initialState: BimState = {
  currentActivityId: "",
  currentActivityIds: [],
  activities: [],
  isPlaying: false,
  currentDate: new Date(),
  timelineStart: new Date(),
  timelineEnd: new Date(),
  shownActivities: new Set(),
  playbackSpeed: 1000,
  panelsVisible: true,
};

const bimSlice = createSlice({
  name: "bim",
  initialState,
  reducers: {
    // Current Activity Actions
    setCurrentActivityId: (state, action: PayloadAction<string | null>) => {
      state.currentActivityId = action.payload;
    },
    setCurrentActivityIds: (state, action: PayloadAction<string[] | null>) => {
      state.currentActivityIds = action.payload;
    },

    // Activities Management
    setActivities: (state, action: PayloadAction<Activity[]>) => {
      state.activities = action.payload;
    },
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.activities.push(action.payload);
    },
    updateActivity: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Activity> }>
    ) => {
      const index = state.activities.findIndex(
        (activity) => activity.id === action.payload.id
      );
      if (index !== -1) {
        state.activities[index] = {
          ...state.activities[index],
          ...action.payload.updates,
        };
      }
    },
    removeActivity: (state, action: PayloadAction<string>) => {
      state.activities = state.activities.filter(
        (activity) => activity.id !== action.payload
      );
      if (state.currentActivityId === action.payload) {
        state.currentActivityId = null;
      }
    },

    // Timeline Controls
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentDate: (state, action: PayloadAction<Date>) => {
      state.currentDate = action.payload;
    },
    setTimelineRange: (
      state,
      action: PayloadAction<{ start: Date; end: Date }>
    ) => {
      state.timelineStart = action.payload.start;
      state.timelineEnd = action.payload.end;
    },
    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackSpeed = action.payload;
    },

    // Visibility Management
    setShownActivities: (state, action: PayloadAction<Set<string>>) => {
      state.shownActivities = action.payload;
    },
    addShownActivity: (state, action: PayloadAction<string>) => {
      state.shownActivities.add(action.payload);
    },
    removeShownActivity: (state, action: PayloadAction<string>) => {
      state.shownActivities.delete(action.payload);
    },
    clearShownActivities: (state) => {
      state.shownActivities.clear();
    },

    // UI State
    setPanelsVisible: (state, action: PayloadAction<boolean>) => {
      state.panelsVisible = action.payload;
    },
    togglePanelsVisible: (state) => {
      state.panelsVisible = !state.panelsVisible;
    },

    // Reset
    resetBimState: (state) => {
      return { ...initialState, activities: state.activities };
    },
    resetTimeline: (state) => {
      state.currentDate = state.timelineStart;
      state.isPlaying = false;
      state.shownActivities.clear();
      state.currentActivityId = null;
    },
  },
});

export const {
  setCurrentActivityId,
  setCurrentActivityIds,
  setActivities,
  addActivity,
  updateActivity,
  removeActivity,
  setIsPlaying,
  setCurrentDate,
  setTimelineRange,
  setPlaybackSpeed,
  setShownActivities,
  addShownActivity,
  removeShownActivity,
  clearShownActivities,
  setPanelsVisible,
  togglePanelsVisible,
  resetBimState,
  resetTimeline,
} = bimSlice.actions;

// Selectors
export const selectCurrentActivity = (state: { bim: BimState }) =>
  state.bim.activities.find(
    (activity) => activity.id === state.bim.currentActivityId
  ) || null;

export const selectCurrentActivityId = (state: { bim: BimState }) =>
  state.bim.currentActivityId;

export const selectCurrentActivityIds = (state: { bim: BimState }) =>
  state.bim.currentActivityIds;

export const selectActivities = (state: { bim: BimState }) =>
  state.bim.activities;

export const selectIsPlaying = (state: { bim: BimState }) =>
  state.bim.isPlaying;

export const selectCurrentDate = (state: { bim: BimState }) =>
  state.bim.currentDate;

export const selectTimelineRange = (state: { bim: BimState }) => ({
  start: state.bim.timelineStart,
  end: state.bim.timelineEnd,
});

export const selectShownActivities = (state: { bim: BimState }) =>
  state.bim.shownActivities;

export const selectPlaybackSpeed = (state: { bim: BimState }) =>
  state.bim.playbackSpeed;

export const selectPanelsVisible = (state: { bim: BimState }) =>
  state.bim.panelsVisible;

export const selectLinkedActivities = (state: { bim: BimState }) =>
  state.bim.activities.filter(
    (activity) => (activity.linkedModelIds?.length ?? 0) > 0
  );

export const selectActiveActivities = (state: { bim: BimState }) =>
  state.bim.activities.filter(
    (activity) =>
      state.bim.currentDate >= activity.startDate &&
      state.bim.currentDate <= activity.endDate
  );

export default bimSlice.reducer;
