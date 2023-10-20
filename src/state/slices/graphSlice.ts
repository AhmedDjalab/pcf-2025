import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import texturesData from "../../const/texturesArray";
import { lineStyles } from "../../const/linesArray";
import { REHYDRATE } from "redux-persist";
import { store } from "../store";
import ShapesForm from "../../components/ShapesForm";
import { uniqueId } from "lodash";

export interface GraphDataType {
  id: string;
  activityName: string;
  startDate: string;
  finishDate: string;
  startChainage: number;
  finishChainage: number;
  style: string;
}
export interface ShapeType {
  type: "line" | "rect" | "triangle";
  backgroundTexture: string;
  lineType: string;
  color: string;
  name: string;
  id: string;
  activityId?: string[];
}

export interface TaskSlot {
  start: number;
  end: number;
  name: string;
  id: string;
}

export interface ProjectSettings {
  title: string;
  logoImg: string;
}
export interface GraphSetting {
  graphData: GraphDataType[];
  fromDate: string;
  toDate: string;
  fromDistance: number;
  toDistance: number;
  distanceRange?: number;
  rawExcelData?: GraphDataType[];
  timeRange: "Yearly" | "Monthly" | "Weekly" | "Daily";
}
export interface ShapesSettings {
  shapesData: ShapeType[];
}

export interface GraphCreateType {
  projectSettings: ProjectSettings;
  settings: GraphSetting;
  shapes: ShapesSettings;
  taskSlots: TaskSlot[];
  taskSlotsLevelTwo: TaskSlot[];
  loading: boolean;
  rawGraphDataFromFile?: GraphDataType[];
}

const initialState: GraphCreateType = {
  projectSettings: {
    title: "",
    logoImg: "",
  },
  settings: {
    graphData: [],
    fromDate: new Date().toISOString(),
    toDate: new Date().toISOString(),
    fromDistance: 10000,
    toDistance: 20000,
    timeRange: "Yearly",
    distanceRange: 200,
  },
  shapes: {
    shapesData: [],
  },
  taskSlots: [],
  taskSlotsLevelTwo: [],
  loading: false,
  rawGraphDataFromFile: [],
};

const GraphSlice = createSlice({
  name: "Graphform",
  initialState,
  reducers: {
    updateProjectSettingsValue(
      state,
      action: PayloadAction<{ projectSettings: ProjectSettings }>
    ) {
      const projectSettings = action.payload.projectSettings;
      state.projectSettings = { ...projectSettings };
    },
    updateGraphSettingsValue(
      state,
      action: PayloadAction<{ graphSettingsForm: GraphSetting }>
    ) {
      const graphSettingsForm = action.payload.graphSettingsForm;

      type ShapeSet = {
        style: string;
        activityId: string;
      };
      let styles = new Set<string>();
      graphSettingsForm.graphData.forEach((data) => {
        styles.add(data.style);
      });

      let shapes: ShapeType[] = [];

      const uniqueStyles = Array.from(styles);

      // var startDate = new Date(graphSettingsForm.fromDate);
      // if (graphSettingsForm.timeRange === "Yearly") {
      //   startDate.setFullYear(startDate.getFullYear() - 1);
      // }

      // if (graphSettingsForm.timeRange === "Monthly") {
      //   startDate.setMonth(startDate.getMonth() - 1);
      //   if (startDate.getMonth() === 11) {
      //     // If the month was December, adjust the year as well
      //     startDate.setFullYear(startDate.getFullYear() - 1);
      //   }
      // }

      // graphSettingsForm.fromDate = startDate.toISOString();
      shapes = uniqueStyles.map((style, index) => ({
        type: "line",
        backgroundTexture: texturesData[0].id,
        color: "#24303F",
        name: style,
        lineType: lineStyles[0].id,
        id: index.toString(),
        activityId: graphSettingsForm.graphData
          .filter((x) => x.style === style)
          .map((data) => data.id),
      }));

      return {
        ...state,
        settings: graphSettingsForm,
        shapes: { shapesData: shapes },
      };
    },
    updateShapesValue(
      state,
      action: PayloadAction<{ shapesForm: ShapesSettings }>
    ) {
      state.shapes = action.payload.shapesForm;
    },
    updateTaskSlotsValue(
      state,
      action: PayloadAction<{ taskSlots: TaskSlot[] }>
    ) {
      state.taskSlots = [...action.payload.taskSlots];
    },
    updateTaskSlotsLevelTwoValue(
      state,
      action: PayloadAction<{ taskSlotsLevelTwo: TaskSlot[] }>
    ) {
      state.taskSlotsLevelTwo = [...action.payload.taskSlotsLevelTwo];
    },
    addActivity(state, action: PayloadAction<{ activity: GraphDataType }>) {
      var newActivity: GraphDataType = {
        ...action.payload.activity,
        id: uniqueId("pcf_"),
      };

      state.settings.graphData.unshift(newActivity);
      state.rawGraphDataFromFile!.unshift(newActivity);
    },

    addGraphDataList(
      state,
      action: PayloadAction<{ graphData: GraphDataType[] }>
    ) {
      const existingIds = new Set(
        state.settings.graphData.map((data) => data.id)
      );

      // Filter out duplicate graph data based on ID
      const newGraphData = action.payload.graphData.filter(
        (data) => !existingIds.has(data.id)
      );

      // Merge the new graph data with the existing data
      state.settings.graphData = [...state.settings.graphData, ...newGraphData];
      state.rawGraphDataFromFile = [
        ...state.settings.graphData,
        ...newGraphData,
      ];
      type ShapeSet = {
        style: string;
        activityId: string;
      };
      let styles = new Set<string>();
      action.payload.graphData.forEach((data) => {
        styles.add(data.style);
      });

      let shapes: ShapeType[] = [];

      const uniqueStyles = Array.from(styles);

      shapes = uniqueStyles.map((style, index) => ({
        type: "line",
        backgroundTexture: texturesData[0].id,
        color: "#24303F",
        name: style,
        lineType: lineStyles[0].id,
        id: index.toString(),
        activityId: action.payload.graphData
          .filter((x) => x.style === style)
          .map((data) => data.id),
      }));

      state.shapes.shapesData = shapes;
    },
    updateActivity(state, action: PayloadAction<{ activity: GraphDataType }>) {
      const index = state.settings.graphData.findIndex(
        (ls) => ls.id === action.payload.activity.id
      );
      if (index !== -1) {
        state.settings.graphData[index] = action.payload.activity;
        state.rawGraphDataFromFile![index] = action.payload.activity;
      }
      return state;
    },

    removeActivity(state, action: PayloadAction<{ activityId: string }>) {
      let newgraphData = state.settings.graphData.filter(
        (x) => x.id !== action.payload.activityId
      );
      state.settings.graphData = [...newgraphData];
      state.rawGraphDataFromFile = [...newgraphData];
      return state;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    applyFilter: (
      state,
      action: PayloadAction<Omit<GraphSetting, "graphData">>
    ) => {
      const { fromDate, toDate, fromDistance, toDistance } = action.payload;

      state.settings.fromDate = fromDate;
      state.settings.toDate = toDate;
      state.settings.fromDistance = fromDistance;
      state.settings.toDistance = toDistance;
      const filteredGraphData = state.rawGraphDataFromFile!.filter((data) => {
        const dataStartDate = new Date(data.startDate);
        const dataFinishDate = new Date(data.finishDate);

        return (
          dataFinishDate >= new Date(fromDate) &&
          dataStartDate <= new Date(toDate) &&
          data.startChainage >= fromDistance &&
          data.finishChainage <= toDistance
        );
      });

      state.settings.graphData = filteredGraphData;
      return state;
    },

    resetForm(state) {
      state.settings = { ...initialState.settings };
      state.projectSettings = { ...initialState.projectSettings };
      state.shapes = { ...initialState.shapes };
      state.taskSlots = { ...initialState.taskSlots };
      state.taskSlotsLevelTwo = { ...initialState.taskSlotsLevelTwo };

      state.loading = false;
    },
  },
  extraReducers: (builder) => {},
});

export const {
  updateProjectSettingsValue,
  updateGraphSettingsValue,
  updateShapesValue,
  updateTaskSlotsValue,
  updateTaskSlotsLevelTwoValue,
  setLoading,
  resetForm,
  addActivity,
  updateActivity,
  removeActivity,
  addGraphDataList,
  applyFilter,
} = GraphSlice.actions;

export default GraphSlice.reducer;
