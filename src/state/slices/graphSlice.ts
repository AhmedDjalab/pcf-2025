import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GraphDataType {
  id: string;
  activityName: string;
  startDate: Date;
  finishDate: Date;
  startChainage: number;
  finishChainage: number;
  style: string;
}
export interface ShapeType {
  type: "line" | "rect" | "traingle";
  backgroundTexture: string;
  color: string;
  name: string;
  id: string;
}

export interface GraphSetting {
  graphData: GraphDataType[];
  fromDate: Date;
  toDate: Date;
  fromDistance: number;
  toDistance: number;
}
export interface ShapesSettings {
  shapesData: ShapeType[];
}

interface GraphCreateType {
  settings: GraphSetting;
  shapes: ShapesSettings;
  loading: boolean;
}

const initialState: GraphCreateType = {
  settings: {
    graphData: [],
    fromDate: new Date(),
    toDate: new Date(),
    fromDistance: 0,
    toDistance: 0,
  },
  shapes: {
    shapesData: [],
  },
  loading: false,
};

const GraphSlice = createSlice({
  name: "Graphform",
  initialState,
  reducers: {
    updateGraphSettingsValue(
      state,
      action: PayloadAction<{ graphSettingsForm: GraphSetting }>
    ) {
      const graphSettingsForm = action.payload.graphSettingsForm;

      const styles = new Set<string>();
      graphSettingsForm.graphData.forEach((data) => {
        styles.add(data.style);
      });

      if (state.shapes.shapesData.length === 0) {
        const uniqueStyles = Array.from(styles);

        const shapes: ShapeType[] = uniqueStyles.map((style, index) => ({
          type: "line",
          backgroundTexture: "",
          color: "#24303F",
          name: style,
          id: index.toString(),
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

    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    resetForm(state) {
      state.settings = { ...initialState.settings };
      state.shapes = { ...initialState.shapes };

      state.loading = false;
    },
  },
  extraReducers: (builder) => {},
});

export const {
  updateGraphSettingsValue,
  updateShapesValue,

  setLoading,
  resetForm,
} = GraphSlice.actions;

export default GraphSlice.reducer;
