import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import texturesData from "../../const/texturesArray";
import { lineStyles } from "../../const/linesArray";
import { uniqueId } from "lodash";
import { uuidv4 } from "@firebase/util";

export interface GraphDataType {
  id: string;
  activityName: string;
  startDate: string;
  finishDate: string;
  startChainage: number;
  finishChainage: number;
  style: string;
  styleId?: string;
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

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;
const startDate = new Date(currentYear, 0, 1); // Month 0 is January
const endDate = new Date(nextYear, 11, 31);
const initialState: GraphCreateType = {
  projectSettings: {
    title: "",
    logoImg: "",
  },
  settings: {
    graphData: [],
    fromDate: startDate.toISOString(),
    toDate: endDate.toISOString(),
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
      let shapes: ShapeType[] = [];
      const graphSettingsForm = action.payload.graphSettingsForm;

      let styles = new Set<string>();
      graphSettingsForm.graphData.forEach((data) => {
        styles.add(data.style);
      });
      const uniqueStyles = Array.from(styles);

      shapes = uniqueStyles.map((style, index) => {
        const existingShape = state.shapes.shapesData.find(
          (shape) => shape.id === style
        );

        if (existingShape) {
          // If a shape with the same id already exists, don't update it.
          return existingShape;
        }

        return {
          type: "line",
          backgroundTexture: texturesData[0].id,
          color: "#24303F",
          name: style,
          lineType: lineStyles[0].id,
          id: style,
          activityId: graphSettingsForm.graphData
            .filter((x) => x.style === style)
            .map((data) => data.id),
        };
      });

      console.log(
        "🚀 ~ file: graphSlice.ts:131 ~ shapes=uniqueStyles.map ~ shapes:",
        shapes
      );

      return {
        ...state,
        settings: graphSettingsForm,
        shapes: { shapesData: [...state.shapes.shapesData, ...shapes] },
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
    addActivity(
      state,
      action: PayloadAction<{ activity: GraphDataType; shapeId: string }>
    ) {
      var newActivity: GraphDataType = {
        ...action.payload.activity,
        id: "pcf_" + uuidv4().split("-")[0],
      };

      //state.settings.graphData.unshift();
      //state.rawGraphDataFromFile!.unshift(newActivity);
      const graphData = [newActivity, ...state.settings.graphData];
      const rawData = [newActivity, ...state.settings.graphData];
      return {
        ...state,
        settings: { ...state.settings, graphData: graphData },
        rawGraphDataFromFile: rawData,
      };
    },

    addGraphDataList(
      state,
      action: PayloadAction<{ graphData: GraphDataType[] }>
    ) {
      const existingIds = new Set(
        state.settings.graphData.map((data) => data.id)
      );

      // Filter out duplicate graph data based on ID
      // const newGraphData = action.payload.graphData.filter(
      //   (data) => !existingIds.has(data.id)
      // );

      // Merge the new graph data with the existing data
      state.settings.graphData = action.payload.graphData;
      state.rawGraphDataFromFile = action.payload.graphData;
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
        id: style,
        activityId: action.payload.graphData
          .filter((x) => x.style === style)
          .map((data) => data.id),
      }));

      state.shapes.shapesData = shapes;
    },
    updateActivity(
      state,
      action: PayloadAction<{ activity: GraphDataType; shapeId: string }>
    ) {
      const { activity, shapeId } = action.payload;

      const graphDataIndex = state.settings.graphData.findIndex(
        (item) => item.id === activity.id
      );
      if (graphDataIndex !== -1) {
        state.settings.graphData[graphDataIndex] = activity;
        return state;
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
    // removeActivityFromShapeList(
    //   state,
    //   action: PayloadAction<{ activityId: string; shapeId: string }>
    // ) {
    //   // let newgraphData = state.settings.graphData.filter(
    //   //   (x) => x.id !== action.payload.activityId
    //   // );
    //   const index = state.shapes.shapesData.findIndex(
    //     (ls) => ls.id === action.payload.shapeId
    //   );
    //   const updatedShapesData = [...state.shapes.shapesData];

    //   if (index !== -1) {
    //     updatedShapesData[index].activityId?.filter(
    //       (x) => x !== action.payload.activityId
    //     );
    //     updatedShapesData[index] = {
    //       ...updatedShapesData[index],
    //       activityId: [
    //         ...(updatedShapesData[index].activityId || []),
    //         newActivity.id,
    //       ],
    //     };
    //   }
    // },
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
      if (fromDate > toDate) {
        return state;
      }
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
  extraReducers: () => {},
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
