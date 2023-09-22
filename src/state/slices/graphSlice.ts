import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import texturesData from "../../const/texturesArray";
import { lineStyles } from "../../const/linesArray";

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
  rawExcelData?: GraphDataType[];
  timeRange: "Yearly" | "Monthly" | "Weekly" | "Daily";
}
export interface ShapesSettings {
  shapesData: ShapeType[];
}

interface GraphCreateType {
  projectSettings: ProjectSettings;
  settings: GraphSetting;
  shapes: ShapesSettings;
  taskSlots: TaskSlot[];
  loading: boolean;
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
    fromDistance: 0,
    toDistance: 0,
    timeRange: "Yearly",
  },
  shapes: {
    shapesData: [],
  },
  taskSlots: [],
  loading: false,
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
      state.projectSettings = projectSettings;
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
      const styles = new Set<string>();
      graphSettingsForm.graphData.forEach((data) => {
        styles.add(data.style);
      });

      if (state.shapes.shapesData.length === 0) {
        const uniqueStyles = Array.from(styles);

        const shapes: ShapeType[] = uniqueStyles.map((style, index) => ({
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
        state.shapes.shapesData = shapes;
      }

      state.settings = graphSettingsForm;
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

    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    resetForm(state) {
      state.settings = { ...initialState.settings };
      state.projectSettings = { ...initialState.projectSettings };
      state.shapes = { ...initialState.shapes };
      state.taskSlots = { ...initialState.taskSlots };

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
  setLoading,
  resetForm,
} = GraphSlice.actions;

export default GraphSlice.reducer;
