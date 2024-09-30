import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Epic, ofType } from "redux-observable";
import { take, tap } from "rxjs";

import { OverrideItemData } from "src/hooks/useItem";
import { StoreState } from "./store";

export const STAGE_PREFIX = "STAGE";

export type StageActivity = {
  name: string;
  activityUID: string;
  id: string;
  isPassed: boolean;
};
export type StageData = {
  id: string;
  attrs: OverrideItemData<any>;
  className: string;
  children?: StageData[];
  activities?: StageActivity[];
};

export const stageDataEpic: Epic = (action$, state$) =>
  action$.pipe(
    ofType(stageDataAction.addItem.type),
    take(1),
    tap((action$) => console.log(""))
  );

export const stageDataEntity = createEntityAdapter<StageData>();

export const stageDataSlice = createSlice({
  name: STAGE_PREFIX,
  initialState: stageDataEntity.setAll(stageDataEntity.getInitialState(), []),
  reducers: {
    addItem(state, action) {
      if (Array.isArray(action.payload)) {
        stageDataEntity.addMany(state, action.payload);
        return;
      }
      stageDataEntity.addOne(state, action.payload);
    },
    updateItem(state, action: PayloadAction<StageData | StageData[]>) {
      if (Array.isArray(action.payload)) {
        // Handling array updates with `updateMany`
        stageDataEntity.updateMany(
          state,
          action.payload.map((item) => ({
            id: item.id,
            changes: {
              attrs: {
                ...state.entities[item.id]?.attrs, // Preserve existing attrs
                ...item.attrs, // Overwrite with new attributes
              },
            },
          }))
        );
        return;
      }
      console.log("🚀 ~ updateItem ~ state iiiiidd:", state, action.payload.id);
      // For single update
      const existingItem = state.entities[action.payload.id];
      if (!existingItem) {
        console.error(`No entity found with id: ${action.payload.id}`);
        return;
      }

      // Deep merge for nested properties
      stageDataEntity.updateOne(state, {
        id: action.payload.id,
        changes: {
          attrs: {
            ...existingItem.attrs, // Keep previous attributes intact
            ...action.payload.attrs, // Overwrite only updated attributes
            scaleX: action.payload.attrs.scaleX, // Ensure scaleX is updated
            scaleY: action.payload.attrs.scaleY, // Ensure scaleY is updated
          },
        },
      });

      console.log("🚀 ~ updateItem ~ state after update:", state);
    },
    removeItem(state, action) {
      if (Array.isArray(action.payload)) {
        stageDataEntity.removeMany(state, action.payload);
        return;
      }
      stageDataEntity.removeOne(state, action.payload.id);
    },
    clearItems(state, action) {
      stageDataEntity.removeAll(state);
    },
  },
});

const stageDataReducer = stageDataSlice.reducer;

export const stageDataSelector = stageDataEntity.getSelectors(
  (state: StoreState) => state.currentStageData
);
export const stageDataAction = stageDataSlice.actions;
export default stageDataReducer;
