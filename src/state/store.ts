import { configureStore } from "@reduxjs/toolkit";
import graphSlice from "./slices/graphSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
// ...
const persistConfig = {
  key: "root", // Key under which your store will be saved in storage
  storage,
};

const persistedReducer = persistReducer(persistConfig, graphSlice);

export const store = configureStore({
  reducer: persistedReducer,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
