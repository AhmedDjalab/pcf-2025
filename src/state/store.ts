import {
  combineReducers,
  configureStore,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";
import thunk from "redux-thunk"; // Import Redux Thunk middleware
import graphSlice, { GraphCreateType } from "./slices/graphSlice";

const rootReducer = combineReducers({
  graph: graphSlice,
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
