import {
  combineReducers,
  configureStore,
  EntityState,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import thunk from "redux-thunk"; // Import Redux Thunk middleware
import graphSlice, {
  GraphCreateType,
  GraphDataType,
} from "./slices/graphSlice";
import fileMetaReducer, { FileMeta } from "./fileMeta";
import stageDataReducer, { StageData } from "./currentStageData";
import stageDataListReducer, { StageDataListItem } from "./stageDataList";
import imageAssetListReducer, { ImageAssetListItem } from "./imageAssetList";
import { BimState } from "./slices/bimSlice";
import bimState from "./slices/bimSlice";

export type StoreState = {
  graph: GraphDataType;
  fileMeta: FileMeta;
  bim: BimState;
  currentStageData: EntityState<StageData["attrs"]>;
  stageDataList: EntityState<StageDataListItem>;
  imageAssetList: EntityState<ImageAssetListItem>;
};
const rootReducer = combineReducers({
  graph: graphSlice,
  bim: bimState,
  fileMeta: fileMetaReducer,
  currentStageData: stageDataReducer,
  stageDataList: stageDataListReducer,
  imageAssetList: imageAssetListReducer,

  // Add other reducers if you have them
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          /* Add actions to ignore if needed */
        ],
      },
    }).concat(thunk), // Add Redux Thunk middleware
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: { graph: GraphCreateType, ...otherReducerStates }
export type AppDispatch = typeof store.dispatch;
