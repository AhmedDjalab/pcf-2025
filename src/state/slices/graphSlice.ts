import {
  createAsyncThunk,
  createSlice,
  current,
  PayloadAction,
} from "@reduxjs/toolkit";
import texturesData from "../../const/texturesArray";
import { lineStyles } from "../../const/linesArray";
import { uuidv4 } from "@firebase/util";
import { ProjectFileType } from "src/const/vars";
import { Employee, getEmployees } from "src/Services/EmployeeService2";
import { User } from "src/types/user";
import {
  ActivityModel,
  ActivityStyleModel,
  filterTypes,
  GraphSettingModel,
  Project,
  TaskSlotModel,
} from "src/types/Project";
import { RootState } from "../store";
import {
  getBriefProjects,
  getGraph,
  getProject,
  getProjects,
  saveProject,
} from "src/Services/ProjectService";
import { getCompanyId } from "src/Services/AuthService";
import axios from "axios";
import { UploadImagesUrl } from "src/variables/Urls";
import imageCompression from "browser-image-compression"; // Import the library
import { base64ToFile } from "src/Helpers/utils";
import api from "src/utils/api";
import { getActivities } from "src/Services/ActivityService";
import { actions } from "react-table";
import {
  getCommentsByProjectId,
  saveComment,
} from "src/Services/CommentService";
import { getAllActivityStyles } from "src/Services/ActivityStylesService";
import { getAllTaskSlot } from "src/Services/TaskSlotsService";
import { TableCellsIcon } from "@heroicons/react/24/solid";

export interface GraphDataType {
  id?: string;
  activityName: string;
  activityId: string;
  startDate: string;
  finishDate: string;
  startChainage: number;
  finishChainage: number;
  style: string;
  styleId?: string;
  calendarName?: string;
  duration?: string;
  critical?: boolean;
}
export interface ShapeType {
  type: "line" | "rect" | "triangle";
  backgroundTexture: string;
  lineType: string;
  color: string;
  name: string;
  id: string;
  activityIds?: string[];
}

export interface TaskSlot {
  start: number;
  end: number;
  name: string;
  id?: string;
  idnew: string;
}
export interface UdfSetting {
  pcfSettingName: string;
  udfSettingName: string;
  udfSettingId: string;
  pcfField: keyof GraphDataType;
}

export interface ProjectSettings {
  title: string;
  logoImg?: string;
  logoId?: string;
  clientlogoImg?: string;
  clientlogoImgId?: string;
  fileType?: ProjectFileType;
  employees?: Employee[];
  employeesId?: string[];
  file?: string;
  fileName?: string;
  dataDate?: Date;
}
export interface GraphSetting {
  graphData?: GraphDataType[];
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

export interface CommentsType {
  idNew?: string;
  id?: string;
  commentText: string;
  pk: number;
  userId: string;
  start: Date;
  projectId?: string;
  commentorUserEmail?: string;
  createdDate?: Date;
  updateAt?: Date;
}

export interface ProjectOption {
  id: string;
  label: string;
}
export interface GraphCreateType {
  id?: string;
  projectSettings: ProjectSettings;
  settings: GraphSetting;
  shapes: ShapesSettings;
  taskSlots: TaskSlot[];
  taskSlotsLevelTwo: TaskSlot[];
  loading?: boolean;
  error?: string;
  rawGraphDataFromFile?: GraphDataType[];
  userDefindSettings?: UdfSetting[];
  comments?: CommentsType[];
  projectOptions?: ProjectOption[];
}

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;
const startDate = new Date(currentYear, 0, 1); // Month 0 is January
const endDate = new Date(nextYear, 11, 31);
const initialState: GraphCreateType = {
  id: "",
  projectSettings: {
    title: "",
    logoImg: "",
    clientlogoImg: "",
    fileType: ProjectFileType.XLSX,
    employees: [],
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
  userDefindSettings: [],
  comments: [],
  projectOptions: [],
};

export const fetchCommentsThunk = createAsyncThunk(
  "projectSettings/Comments",
  async (projectId: string) => {
    const response = await getCommentsByProjectId({
      projectId: projectId,
    });

    return response;
  }
);
export const saveCommentDataThunk = createAsyncThunk(
  "projectSettings/SaveComment",
  async (comment: CommentsType) => {
    const response = await saveComment(comment);

    return response;
  }
);

export const fetchEmployees = createAsyncThunk(
  "projectSettings/fetchEmployees",
  async (user: User) => {
    const response = await getEmployees({
      fromvalue: 0,
      takevalue: 0,
      search: "",
      userAdminId: user.id,
    });

    return response?.employees; // Assuming your API returns an object with an 'employees' property
  }
);
export const fetchAllProjectsOptions = createAsyncThunk(
  "projectSettings/getAllProjectOptions",
  async () => {
    const response = await getBriefProjects();

    if (response) {
      return { success: true, data: response };
    } else {
      return { success: false, message: response };
    }
  }
);

export const fetchAllStyleByProjectId = createAsyncThunk(
  "projectSettings/getAllStyleByProjectId",
  async (projectId: string) => {
    const response = await getAllActivityStyles({ projectId });

    if (response) {
      return { success: true, data: response };
    } else {
      return { success: false, message: response };
    }
  }
);
export const fetchAllTaskSlotByProjectId = createAsyncThunk(
  "projectSettings/getAllTaskSlotsByProjectId",
  async ({ projectId, level }: { projectId: string; level: number }) => {
    const response = await getAllTaskSlot({ projectId, level });

    if (response) {
      return { success: true, data: response };
    } else {
      return { success: false, message: response };
    }
  }
);
export interface AcitivityFetchProp {
  projectId: string;
  filter: filterTypes;
}

export const fetchActivities = createAsyncThunk(
  "importFile/fetchActivities",
  async ({ projectId, filter }: AcitivityFetchProp) => {
    const response = await getActivities({
      fromvalue: 0,
      takevalue: 0,
      search: "",
      fromDate: filter.fromDate,
      toDate: filter.toDate,
      fromDistance: filter.fromDistance,
      toDistance: filter.toDistance,
      projectId: projectId,
    });

    return {
      activities: response?.activities,
      fitler: filter,
    }; // Assuming your API returns an object with an 'employees' property
  }
);
export const fetchProjectByIdThunk = createAsyncThunk<
  { success: boolean; data?: Project; message?: string },
  string, // Assuming the project ID is a string, adjust as needed
  { state: RootState }
>("projectSettings/fetchProjectById", async (projectId, thunkAPI) => {
  try {
    // Get the current Redux state
    const state: RootState = thunkAPI.getState();

    // Call your fetchProjectById API with the project ID
    const response = await getProject(projectId);

    // Handle the response if needed and return the appropriate data
    if (response) {
      return { success: true, data: response };
    } else {
      return { success: false, message: response };
    }
  } catch (error) {
    // Handle errors here if needed
    return {
      success: false,
      message: "An error occurred while fetching the project.",
    };
  }
});

export const saveProjectThunk = createAsyncThunk<
  { success: boolean; message?: string },
  User,
  { state: RootState }
>("projectSettings/saveProject", async (user: User, thunkAPI) => {
  try {
    // Get the current Redux state

    const state: RootState = thunkAPI.getState();

    // Transform the state into the format expected by your backend
    const projectData: Project = {
      id: state.graph.id,
      title: state.graph.projectSettings.title,
      logoUrl: state.graph.projectSettings.logoImg,
      logoUrlId: state.graph.projectSettings.logoId,
      clientLogoUrl: state.graph.projectSettings.clientlogoImg,
      clientLogoId: state.graph.projectSettings.clientlogoImgId,
      fileType: state.graph.projectSettings.fileType,
      fileName: state.graph.projectSettings.fileName,
      dataDate: state.graph.projectSettings.dataDate,
      //@ts-ignore
      companyId: getCompanyId(),
      userId: user.id,
      employeesId: state.graph.projectSettings.employeesId,
      activities: state.graph.rawGraphDataFromFile!.map((act) => ({
        // Map properties from GraphDataType to ActivityModel
        name: act.activityName,
        activityId: act.activityId,
        startDate: new Date(act.startDate),
        endDate: new Date(act.finishDate),
        startPk: act.startChainage,
        endPk: act.finishChainage,
        style: act.style,
        calendar: act.calendarName ?? "",
        duration: act.duration,
        critical: act.critical,

        id: act.id,
      })),
      graphSettings: {
        fromDate: new Date(state.graph.settings.fromDate),
        toDate: new Date(state.graph.settings.toDate),
        fromDistance: state.graph.settings.fromDistance,
        toDistance: state.graph.settings.toDistance,
        distanceRange: state.graph.settings.distanceRange,
        timeRange: state.graph.settings.timeRange,
      },
      activityStyles: state.graph.shapes.shapesData.map((shape) => ({
        // Map properties from ShapeType to ActivityStyleModel
        name: shape.name,
        color: shape.color,
        backgroundTextureType: shape.backgroundTexture,
        lineStyleType: shape.lineType,
        shapeType: shape.type,
        activityId: shape.activityIds?.[0], // You need to adjust this based on your actual model
      })),
      taskSlotsLevelOne: state.graph.taskSlots.map((taskSlot) => ({
        // Map properties from TaskSlot to TaskSlotModel
        id: taskSlot.id,
        idnew: taskSlot.id,
        start: taskSlot.start,
        end: taskSlot.end,
        name: taskSlot.name,
        level: 1, // Assuming Level is 1 for taskSlots
      })),
      taskSlotsLevelTwo: state.graph.taskSlotsLevelTwo.map((taskSlot) => ({
        // Map properties from TaskSlot to TaskSlotModel
        id: taskSlot.id,
        idnew: taskSlot.id,
        start: taskSlot.start,
        end: taskSlot.end,
        name: taskSlot.name,
        level: 2, // Assuming Level is 2 for taskSlotsLevelTwo
      })),
    };

    const response = await saveProject(projectData);

    // Handle the response if needed and return the appropriate data
    return { success: true, message: "Project saved successfully" };
  } catch (error) {
    // Handle errors here if needed
    return {
      success: false,
      message: "An error occurred while saving the project.",
    };
  }
});

const GraphSlice = createSlice({
  name: "Graphform",
  initialState: initialState,
  reducers: {
    updateProjectSettingsValue(
      state,
      action: PayloadAction<{ projectSettings: ProjectSettings }>
    ) {
      const projectSettings = action.payload.projectSettings;
      state.projectSettings = { ...state.projectSettings, ...projectSettings };
      state.userDefindSettings = [];
    },

    saveSettings(
      state,
      action: PayloadAction<{ filters: Omit<GraphSetting, "graphData"> }>
    ) {
      const { fromDate, toDate, fromDistance, toDistance } =
        action.payload.filters;

      state.settings.fromDate = fromDate;
      state.settings.toDate = toDate;
      state.settings.fromDistance = fromDistance;
      state.settings.toDistance = toDistance;
    },

    applyFilter(
      state,
      action: PayloadAction<{ filters: Omit<GraphSetting, "graphData"> }>
    ) {
      const {
        fromDate,
        toDate,
        fromDistance,
        toDistance,
        timeRange,
        distanceRange,
      } = action.payload.filters;

      state.settings.fromDate = fromDate;
      state.settings.toDate = toDate;
      state.settings.fromDistance = fromDistance;
      state.settings.toDistance = toDistance;
      state.settings.timeRange = timeRange;
      state.settings.distanceRange = distanceRange;

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
    },

    updateShapes(state) {
      let shapes: ShapeType[] = [];
      let styles = new Set<string>();
      state.settings.graphData?.forEach((data) => {
        styles.add(data.style);
      });
      const uniqueStyles = Array.from(styles);

      shapes = uniqueStyles.map((style, index) => {
        const existingShape = state.shapes.shapesData.find(
          (shape) => shape.name === style
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
          activityIds:
            state.settings.graphData
              ?.filter((x) => x.style === style)
              .map((data) => data.id) ?? [],
        } as ShapeType;
      });
      state.shapes.shapesData = shapes;
    },

    updateGraphSettingsValue(
      state,

      action: PayloadAction<{ graphSettingsForm: GraphSetting }>
    ) {
      let shapes: ShapeType[] = [];
      const graphSettingsForm = action.payload.graphSettingsForm;

      let styles = new Set<string>();
      state.settings.graphData?.forEach((data) => {
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
          activityIds: state.settings.graphData
            ?.filter((x) => x.style === style)
            .map((data) => data.id),
        } as ShapeType;
      });

      return {
        ...state,
        settings: graphSettingsForm,
        shapes: { shapesData: [...shapes] },
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
        activityId: "pcf_" + uuidv4().split("-")[0],
      };

      //state.settings.graphData.unshift();
      //state.rawGraphDataFromFile!.unshift(newActivity);
      const graphData = [newActivity, ...(state.settings.graphData ?? [])];
      const rawData = [newActivity, ...(state.rawGraphDataFromFile ?? [])];
      return {
        ...state,
        settings: { ...state.settings, graphData: graphData },
        rawGraphDataFromFile: rawData,
      };
    },

    updateUDFSettings(
      state,
      action: PayloadAction<{ udfSettings: UdfSetting[] }>
    ) {
      state.userDefindSettings = [...action.payload.udfSettings];
      state.rawGraphDataFromFile = [];
      state.settings.graphData = [];
    },

    addGraphDataList(
      state,
      action: PayloadAction<{ graphData: GraphDataType[] }>
    ) {
      const existingIds = new Set(
        state.settings.graphData?.map((data) => data.id)
      );

      // Filter out duplicate graph data based on ID
      const newGraphData = action.payload.graphData.filter(
        (data) => !existingIds.has(data.id)
      );

      // Merge the new graph data with the existing data
      state.settings.graphData = newGraphData;
      state.rawGraphDataFromFile = action.payload.graphData;
      let styles = new Set<string>();
      action.payload.graphData.forEach((data) => {
        styles.add(data.style);
      });

      let shapes: ShapeType[] = [];

      const uniqueStyles = Array.from(styles);

      const newShapes = uniqueStyles.map((style, index) => ({
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

      // Check if shapesData already exists in state.shapes
      if (state.shapes.shapesData) {
        // Filter out shapes with the same id from newShapes
        const uniqueNewShapes = newShapes.filter((newShape) => {
          return !state.shapes.shapesData!.some(
            (existingShape) => existingShape.name === newShape.name
          );
        });

        // Merge the existing shapes with the new unique shapes
        //@ts-ignore
        state.shapes.shapesData = [
          ...state.shapes.shapesData,
          ...uniqueNewShapes,
        ];
      } else {
        // If it doesn't exist, assign the new shapes directly
        //@ts-ignore
        state.shapes.shapesData = newShapes;
      }
    },
    updateActivity(
      state,
      action: PayloadAction<{ activity: GraphDataType; shapeId: string }>
    ) {
      const { activity, shapeId } = action.payload;

      const graphDataIndex = state.settings.graphData?.findIndex(
        (item) => item.id === activity.id
      );

      if (graphDataIndex !== undefined && graphDataIndex !== -1) {
        //@ts-ignore
        state.settings.graphData![graphDataIndex] = activity;
        //@ts-ignore
        state.rawGraphDataFromFile![graphDataIndex] = activity;
        return state;
      }

      return state;
    },

    removeActivity(state, action: PayloadAction<{ activityId: string }>) {
      let newGraphData = state.settings.graphData
        ? state.settings.graphData.filter(
            (x) => x.id !== action.payload.activityId
          )
        : [];
      state.settings.graphData = [...newGraphData];
      state.rawGraphDataFromFile = [...newGraphData];
      return state;
    },

    updateStyleShape(state, action: PayloadAction<{ style: ShapeType }>) {
      const { style } = action.payload;

      const shapeIndex = state.shapes.shapesData.findIndex(
        (item) => item.id === style.id
      );

      if (shapeIndex !== -1) {
        state.shapes.shapesData[shapeIndex] = style;

        return state;
      }

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

    addComment(state, action: PayloadAction<{ comment: CommentsType }>) {
      state.comments?.push(action.payload.comment);
    },
    updateCommentsList(
      state,
      action: PayloadAction<{ comments: CommentsType[] }>
    ) {
      state.comments = action.payload.comments;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    updateComment(
      state,
      action: PayloadAction<{ comment: CommentsType; index: number }>
    ) {
      const index = action.payload.index;
      const comment = action.payload.comment;

      if (state.comments) {
        state.comments[index] = comment;
      }
    },
    updateCommentById(state, action: PayloadAction<{ comment: CommentsType }>) {
      const { comment } = action.payload;

      const graphCommentIndex = state.comments?.findIndex(
        (item) => item.id === comment.id
      );

      if (graphCommentIndex !== undefined && graphCommentIndex !== -1) {
        //@ts-ignore
        state.comments![graphCommentIndex] = comment;
        //@ts-ignore

        return state;
      }

      return state;
    },

    addDataDate(state, action: PayloadAction<{ dataDate: string | null }>) {
      state.projectSettings.dataDate = action.payload.dataDate
        ? new Date(action.payload.dataDate + "Z")
        : undefined;
    },
    addFileName(state, action: PayloadAction<{ fileName: string }>) {
      console.warn(
        "🚀 ~ file: graphSlice.ts:753 ~ addFileName ~ fileName:",
        action.payload.fileName
      );
      state.projectSettings.fileName = action.payload.fileName;
    },

    resetStoreState(state) {
      state.settings = { ...initialState.settings };
      state.projectSettings = { ...initialState.projectSettings };
      state.shapes = { ...initialState.shapes };
      state.taskSlots = [...initialState.taskSlots];
      state.taskSlotsLevelTwo = [...initialState.taskSlotsLevelTwo];
      state.rawGraphDataFromFile = {
        ...(initialState.rawGraphDataFromFile ?? []),
      };

      state.loading = false;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(saveProjectThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(saveProjectThunk.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(saveProjectThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    builder.addCase(fetchActivities.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchActivities.fulfilled, (state, action) => {
      console.log("🚀 ~ builder.addCase ~ fetchActivities:", fetchActivities);
      state.loading = false;

      var activities = action.payload?.activities?.map((act) => ({
        id: act.activityId,
        styleId: act.style,
        activityId: act.activityId,
        startDate: new Date(act.startDate).toISOString(),
        finishDate: new Date(act.endDate).toISOString(),
        startChainage: act.startPk,
        finishChainage: act.endPk,
        style: act.style,
        activityName: act.name,
        calendarName: act.calendar,
        duration: act.duration,
        critical: act.critical,
      }));
      state.settings.graphData = activities ?? [];

      const {
        fromDate,
        toDate,
        fromDistance,
        toDistance,
        timeRange,
        distanceRange,
      } = action.payload.fitler;

      state.settings.fromDate = fromDate.toISOString();
      state.settings.toDate = toDate.toISOString();
      state.settings.fromDistance = fromDistance;
      state.settings.toDistance = toDistance;
      state.settings.timeRange = timeRange ?? "Yearly";
      state.settings.distanceRange = distanceRange ?? 200;
    });
    builder.addCase(fetchActivities.rejected, (state, action) => {
      state.loading = false;
      state.settings.graphData = [];
    });

    builder.addCase(fetchEmployees.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchEmployees.fulfilled, (state, action) => {
      state.projectSettings.employees = action.payload ?? [];
      state.loading = false;
    });
    builder.addCase(fetchEmployees.rejected, (state) => {
      state.projectSettings.employees = [];
      state.loading = false;
    });
    builder.addCase(fetchProjectByIdThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProjectByIdThunk.fulfilled, (state, action) => {
      state.loading = false;
      resetStoreState();

      var activities = action.payload.data?.activities?.map((act) => ({
        id: act.id,
        styleId: act.style,
        activityId: act.activityId,
        startDate: new Date(act.startDate).toISOString(),
        finishDate: new Date(act.endDate).toISOString(),
        startChainage: act.startPk,
        finishChainage: act.endPk,
        style: act.style,
        activityName: act.name,
        calendarName: act.calendar ?? "",
        duration: act.duration,
        critical: act.critical,
      }));
      const projectData: GraphCreateType = {
        id: action.payload.data?.id,
        projectSettings: {
          title: action.payload.data!.title,
          employeesId: action.payload.data!.employeesId,
          logoImg: action.payload.data!.logoUrl,
          logoId: action.payload.data!.logoUrlId ?? undefined,
          clientlogoImg: action.payload.data!.clientLogoUrl,
          clientlogoImgId: action.payload.data!.clientLogoId ?? undefined,
          fileType: action.payload.data!.fileType ?? undefined,
          fileName: action.payload.data!.fileName ?? undefined,
          dataDate: action.payload.data!.dataDate ?? undefined,
        },

        rawGraphDataFromFile: activities,
        settings: {
          graphData: activities ?? [],
          fromDate: new Date(
            action.payload.data!.graphSettings?.fromDate ??
              initialState.settings.fromDate
          ).toISOString(),
          toDate: new Date(
            action.payload.data!.graphSettings?.toDate ??
              initialState.settings.toDate
          ).toISOString(),
          fromDistance:
            action.payload.data!.graphSettings?.fromDistance ??
            initialState.settings.fromDistance,
          toDistance:
            action.payload.data!.graphSettings?.toDistance ??
            initialState.settings.toDistance,
          distanceRange: action.payload.data!.graphSettings?.distanceRange!,
          timeRange:
            action.payload.data!.graphSettings?.timeRange ??
            initialState.settings.timeRange,
        },
        shapes: {
          shapesData:
            action.payload.data!.activityStyles?.map((shape) => ({
              name: shape.name,
              color: shape.color,
              backgroundTexture: shape.backgroundTextureType,
              lineType: shape.lineStyleType,
              type: shape.shapeType,
              activityId: [],
              id: shape.id!,
            })) ?? [],
        },
        taskSlots:
          action.payload.data!.taskSlotsLevelOne?.map((taskSlot) => ({
            start: taskSlot.start,
            end: taskSlot.end,
            name: taskSlot.name,
            level: 1,
            id: taskSlot.id!,
            idnew: taskSlot.id!,
          })) ?? [],
        taskSlotsLevelTwo:
          action.payload.data!.taskSlotsLevelTwo?.map((taskSlot) => ({
            start: taskSlot.start,
            end: taskSlot.end,
            name: taskSlot.name,
            level: 2,
            id: taskSlot.id!,
            idnew: taskSlot.id!,
          })) ?? [],
      };
      state.id = projectData.id;
      state.settings = projectData.settings;
      state.projectSettings = projectData.projectSettings;
      state.shapes = projectData.shapes;
      state.taskSlots = projectData.taskSlots;
      state.taskSlotsLevelTwo = projectData.taskSlotsLevelTwo;
      state.rawGraphDataFromFile = projectData.rawGraphDataFromFile;
    });
    builder.addCase(fetchProjectByIdThunk.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(fetchCommentsThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCommentsThunk.fulfilled, (state, action) => {
      state.comments = action.payload ?? [];
      state.loading = false;
    });
    builder.addCase(fetchCommentsThunk.rejected, (state) => {
      state.comments = [];
      state.loading = false;
    });

    builder.addCase(saveCommentDataThunk.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(saveCommentDataThunk.fulfilled, (state, action) => {
      state.loading = false;
    });
    builder.addCase(saveCommentDataThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(fetchAllProjectsOptions.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAllProjectsOptions.fulfilled, (state, action) => {
      state.loading = false;
      state.projectOptions = action.payload.data;
    });
    builder.addCase(fetchAllProjectsOptions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(fetchAllStyleByProjectId.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAllStyleByProjectId.fulfilled, (state, action) => {
      state.loading = false;
      // ?update the styles
      var newStyles: ActivityStyleModel[] | undefined = action.payload.data;
      var styles = state.shapes.shapesData.map((s) => {
        if (newStyles) {
          var matchedStyle = newStyles.find((x) => x.name === s.name);
          console.warn(
            "🚀 ~ file: graphSlice.ts:960 ~ styles ~ matchedStyle:",
            matchedStyle
          );

          if (matchedStyle) {
            // Copy specific attributes from ActivityStyleModel to ShapeType
            s.color = matchedStyle.color;
            s.lineType = matchedStyle.lineStyleType;
            s.backgroundTexture = matchedStyle.backgroundTextureType;
            s.type = matchedStyle.shapeType;
          }
        }
        return s;
      });

      state.shapes.shapesData = [...styles];
    });
    builder.addCase(fetchAllStyleByProjectId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(fetchAllTaskSlotByProjectId.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAllTaskSlotByProjectId.fulfilled, (state, action) => {
      state.loading = false;
      // ?update the task slots
      var level = action.meta.arg.level;
      if (level === 1) {
        state.taskSlots =
          action.payload.data?.map((taskSlot) => ({
            start: taskSlot.start,
            end: taskSlot.end,
            name: taskSlot.name,
            level: 1,
            idnew: taskSlot.id!,
          })) ?? [];
      } else {
        state.taskSlotsLevelTwo =
          action.payload.data?.map((taskSlot) => ({
            start: taskSlot.start,
            end: taskSlot.end,
            name: taskSlot.name,
            level: 2,
            idnew: taskSlot.id!,
          })) ?? [];
      }
      // const taskSlotData : TaskSlotModel[] = action.payload.data ;
    });
    builder.addCase(fetchAllTaskSlotByProjectId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
});

export const {
  addFileName,
  addDataDate,
  saveSettings,
  updateShapes,
  updateProjectSettingsValue,
  updateGraphSettingsValue,
  updateShapesValue,
  updateTaskSlotsValue,
  updateTaskSlotsLevelTwoValue,
  setLoading,
  resetStoreState,
  addActivity,
  updateActivity,
  removeActivity,
  updateUDFSettings,
  addGraphDataList,
  applyFilter,
  updateStyleShape,
  addComment,
  updateCommentsList,
  updateComment,
  updateCommentById,
} = GraphSlice.actions;

export default GraphSlice.reducer;
