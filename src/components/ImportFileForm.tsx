import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { MultiStepFormProps } from "./DrawGraphForm";

import * as XLSX from "xlsx";
import {
  ActivityRelations,
  GraphDataType,
  UdfSetting,
  addActivitiesRelation,
  addDataDate,
  addFileName,
  addGraphDataList,
  removeActivity,
  updateGraphSettingsValue,
  updateShapes,
} from "src/state/slices/graphSlice";
import * as Yup from "yup";
import { useFormik } from "formik";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state";
import { animateScroll as scroll } from "react-scroll";
import {
  ArrowUpCircleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { BackToTopHeightSize, ProjectFileType } from "../const/vars";
import { useTranslation } from "react-i18next";
import ActivityTableForm from "./ActivityTableForm";
import Spinner from "./Spinner";
import ParameterSelector from "./ParmeterSelector";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { useAuth } from "src/context/UserContext";
import { useParams } from "react-router-dom";
import excel from "src/assets/filesLogo/excel.svg";
import primavera from "src/assets/filesLogo/PrimaveraXML.png";
import msProject from "src/assets/filesLogo/msProject.png";
import FiltersInputs from "./FiltersInputs";
import DynamicTable from "./DynamicTable";
import DeleteConfirmationModal from "./shared/DeleteConfirmationModal";
import Pagination from "./shared/Pagination";
import { extractValueAndUnit } from "src/utils/helpers";
import { ActivityRelationType } from "src/enums/ActivityRelationType";
import { getExtendPropertyData, getUDFData } from "src/Helpers/parsers";
export type FormValues = {
  fromDate: Date;
  toDate: Date;
  graphData: any[];
  fromDistance: string;
  toDistance: string;
  timeRange: "Yearly" | "Monthly" | "Weekly" | "Daily";
  distanceRange?: number;
};
export const ImportFileForm = ({ setCurrentStep }: MultiStepFormProps) => {
  const { canWrite, isAdmin } = useAuth();
  const { id } = useParams();

  const editForm = id !== null && id !== "" && id !== undefined;

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const userTimeZone = moment.tz.guess();

  const initForm: FormValues = {
    fromDate: new Date(currentYear, 0, 1), // Month 0 is January
    toDate: new Date(nextYear, 11, 31),
    graphData: [],
    fromDistance: "10000",
    toDistance: "20000",
    timeRange: "Yearly",
    distanceRange: 200,
  };
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const loading = useSelector((state: RootState) => state.graph.loading);
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const graphSettings = useSelector((state: RootState) => state.graph.settings);
  const fileType = useSelector(
    (state: RootState) => state.graph.projectSettings.fileType
  );
  const fileName = useSelector(
    (state: RootState) => state.graph.projectSettings.fileName
  );

  const graphDataTable = useMemo(() => {
    // Apply search filter
    const uniqueIds = new Set();

    const filteredData = graphSettings.graphData?.filter((item) => {
      const id: string = item.activityId;

      if (!uniqueIds.has(id) && id.includes(search)) {
        uniqueIds.add(id);
        return true;
      }
      return false;
    });

    // Apply pagination
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData?.slice(startIndex, endIndex);

    return paginatedData;
  }, [graphSettings.graphData, pageIndex, pageSize, search]);
  const rawData = useSelector(
    (state: RootState) => state.graph.rawGraphDataFromFile
  );

  const pageCount = useMemo(() => {
    return Math.ceil((graphSettings.graphData?.length ?? 0) / pageSize);
  }, [pageSize, graphSettings.graphData]);
  const nextPage = () => setPageIndex(pageIndex + 1);
  const previousPage = () => setPageIndex(pageIndex - 1);
  const onPageChange = (newPageIndex: number) => setPageIndex(newPageIndex);
  const onPageSizeChange = (newPageSize: number) => {
    setPageIndex(0);
    setPageSize(newPageSize);
  };

  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [settingParsedModal, setSettingParsedModal] = useState(false);
  const [userDefinedSettings, setUserDefinedSettings] = useState<any[]>([]);
  const [edit, setEdit] = useState<GraphDataType | null>(null);
  const [initialValues, setInitialValues] = useState<FormValues>(initForm);
  const [graphData, setGraphData] = useState<GraphDataType[]>([]);
  const [filteredData, setFilteredData] = useState<GraphDataType[]>([]);
  const [calendarData, setCalendarData] = useState<
    { id: string; name: string; hoursByDay: number }[]
  >([]);
  const [showBackToTopButton, setShowBackToTopButton] = useState(false);
  const [parsedData, setParsedData] = useState<any>();

  const validationSchema = Yup.object().shape({
    fromDate: Yup.date().required("La date de début est requise"),
    toDate: Yup.date()
      .required("La date de fin est requise")
      .min(
        Yup.ref("fromDate"),
        "La date de fin doit être après la date de début"
      ),
    fromDistance: Yup.number().required("La distance de départ est requise"),
    toDistance: Yup.number().required("La distance de fin est requise"),
  });

  const handleAddClick = () => {
    setEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (grT: GraphDataType) => {
    setEdit(grT);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (gtId: string) => {
    dispatch(removeActivity({ activityId: gtId }));
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEdit(null);
  };
  const formik = useFormik({
    initialValues: {
      fromDate: new Date(graphSettings.fromDate) ?? initForm.fromDate,
      toDate: new Date(graphSettings.toDate) ?? initForm.toDate,
      fromDistance: graphSettings.fromDistance.toString() ?? "10000",
      toDistance: graphSettings.toDistance.toString() ?? "20000",
      timeRange: graphSettings.timeRange ?? "Yearly",
      distanceRange: graphSettings.distanceRange ?? 200,
    },
    validationSchema,
    enableReinitialize: true,

    onSubmit: (values) => {
      dispatch(
        updateGraphSettingsValue({
          graphSettingsForm: {
            ...values,
            fromDate: values.fromDate.toISOString(),
            toDate: values.toDate.toISOString(),

            fromDistance: parseInt(values.fromDistance),
            toDistance: parseInt(values.toDistance),
            timeRange: values.timeRange,
          },
        })
      );
      setCurrentStep((prevStep) => prevStep + 1);
    },
  });

  //?  --------****--- parsers -------***---------------------

  //? ---------------------parsers -----------------

  const parsePrimaveraXML = (
    xmlDoc: Document,
    userSelectionData: UdfSetting[]
  ) => {
    const graphData: any[] = [];
    var activitiesRelation: ActivityRelations[] = [];

    // Get the <Project> element (assuming it's the root element)
    const project = xmlDoc.getElementsByTagName("Project")[0];

    // get the relationships of project
    var relations = project.getElementsByTagName("Relationship");

    for (let index = 0; index < relations.length; index++) {
      const relation = relations[index];

      const predecessorActivityObjectId = relation.getElementsByTagName(
        "PredecessorActivityObjectId"
      )[0].textContent;
      const successorActivityObjectId = relation.getElementsByTagName(
        "SuccessorActivityObjectId"
      )[0].textContent;
      const relationType = relation.getElementsByTagName("Type")[0].textContent;

      if (predecessorActivityObjectId && successorActivityObjectId) {
        var types = relationType?.split(" ") ?? [];
        var type = (types[0].charAt(0) + types[2].charAt(0)) as
          | "FS"
          | "SS"
          | "FF"
          | "SF";

        activitiesRelation.push({
          predecessorActivityId: predecessorActivityObjectId,
          successorActivityId: successorActivityObjectId,
          activityRelationType: ActivityRelationType[type],
        });
      }
    }

    if (project) {
      const activities = project.getElementsByTagName("Activity");
      const DataDate = project.getElementsByTagName("DataDate")[0].textContent;
      dispatch(addDataDate({ dataDate: DataDate }));
      setLoading(true);
      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];

        const activityId = activity.getElementsByTagName("Id")[0].textContent;

        const activityUID =
          activity.getElementsByTagName("ObjectId")[0].textContent!;

        const activityName =
          activity.getElementsByTagName("Name")[0].textContent;

        let duration = parseFloat(
          activity.getElementsByTagName("AtCompletionDuration")[0]
            .textContent ?? "0"
        );

        const startDate =
          activity.getElementsByTagName("StartDate")[0].textContent;
        const finishDate =
          activity.getElementsByTagName("FinishDate")[0].textContent;
        const calendarId =
          activity.getElementsByTagName("CalendarObjectId")[0].textContent;

        if (calendarId) {
          var calendarName = calendarData.find(
            (x) => x.id === calendarId
          )?.name;
          var hoursByDay = calendarData.find(
            (x) => x.id === calendarId
          )?.hoursByDay;
          if (duration && hoursByDay && hoursByDay > 0) {
            duration = duration / hoursByDay;
          }
        }
        // Get UDF data based on specific Titles
        const udfData = getUDFData(xmlDoc, activity, userSelectionData);

        const requiredFields = ["startChainage", "finishChainage", "style"];

        if (
          udfData !== null &&
          requiredFields.every(
            (field) =>
              udfData[field as keyof typeof udfData] !== undefined &&
              udfData[field as keyof typeof udfData] !== null &&
              udfData[field as keyof typeof udfData] !== ""
          )
        ) {
          graphData.push({
            activityId: activityId,
            activityUID,
            activityName,
            startDate,
            finishDate,
            calendarName,
            duration,
            ...udfData,
          });
        }

        setLoading(false);
      }
    }

    // setGraphData(graphData);
    dispatch(addGraphDataList({ graphData: graphData }));
    dispatch(addActivitiesRelation({ activitiesRelation: activitiesRelation }));

    formik.setFieldValue("graphData", graphData);
  };

  const parseMSProjectXML = (
    xmlDoc: Document,
    userSelectionData: UdfSetting[]
  ) => {
    const graphData: any[] = [];
    var activitiesRelation: ActivityRelations[] = [];

    // Get the <Project> element (assuming it's the root element)
    const project = xmlDoc.getElementsByTagName("Project")[0];

    if (project) {
      const activities = xmlDoc.getElementsByTagName("Tasks")[0].children;
      // const sumary = xmlDoc.getElementsByTagName("Summary")[0];

      // if (sumary) {
      //   return;
      // }
      const DataDate =
        project.getElementsByTagName("StatusDate")[0]?.textContent ??
        moment(new Date()).format("DD/MM/YYYY");

      dispatch(addDataDate({ dataDate: DataDate }));
      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];

        const activityId = activity.getElementsByTagName("ID")[0].textContent;
        const activityUID =
          activity.getElementsByTagName("UID")[0].textContent!;

        const activityName =
          activity.getElementsByTagName("Name")[0]?.textContent ?? activityId;
        const startDate = activity.getElementsByTagName("Start")[0].textContent;
        const finishDate =
          activity.getElementsByTagName("Finish")[0].textContent;

        let duration = activity.getElementsByTagName("Duration")[0].textContent;

        var predecessorLink =
          activity.getElementsByTagName("PredecessorLink")[0];
        let predecessorActivityID, predecessorType;

        if (predecessorLink) {
          predecessorActivityID =
            predecessorLink.getElementsByTagName("PredecessorUID")[0]
              .textContent!;

          predecessorType = parseInt(
            predecessorLink.getElementsByTagName("Type")[0].textContent!
          );
          activitiesRelation.push({
            predecessorActivityId: predecessorActivityID,
            successorActivityId: activityUID,
            activityRelationType: predecessorType,
          });
        }

        const criticalString =
          activity.getElementsByTagName("Critical")[0]?.textContent || "";
        const critical: boolean = criticalString === "1" ? true : false;
        // Get UDF data based on specific Titles
        let durationNumber = convertDurationToHours(duration ?? "");

        const calendarId =
          activity.getElementsByTagName("CalendarUID")[0].textContent;
        const udfData = getExtendPropertyData(
          xmlDoc,
          activity,
          userSelectionData
        );

        if (calendarId) {
          var calendarName = calendarData.find(
            (x) => x.id === calendarId
          )?.name;
          var hoursByDay = calendarData.find(
            (x) => x.id === calendarId
          )?.hoursByDay;
          if (duration && hoursByDay && hoursByDay > 0) {
            durationNumber = durationNumber / hoursByDay;
          }
        }

        const requiredFields = ["startChainage", "finishChainage", "style"];

        if (
          udfData !== null &&
          requiredFields.every(
            (field) =>
              udfData[field as keyof typeof udfData] !== undefined &&
              udfData[field as keyof typeof udfData] !== null &&
              udfData[field as keyof typeof udfData] !== ""
          )
        ) {
          graphData.push({
            activityId: activityId,
            activityName,
            activityUID,
            startDate,
            finishDate,
            calendarName,
            critical,
            duration: durationNumber,
            ...udfData,
          });
        }
      }
    }

    //setGraphData(graphData);
    dispatch(addGraphDataList({ graphData: graphData }));
    dispatch(addActivitiesRelation({ activitiesRelation: activitiesRelation }));
    formik.setFieldValue("graphData", graphData);
  };

  const parseXLsxContent = (
    parsedData: any[][],
    userSelectionData: UdfSetting[]
  ) => {
    const graphData = parsedData
      .slice(1)
      .filter((row) => row[0] !== null && row[0] !== undefined)
      .map((row) => {
        const dataObject: Partial<GraphDataType> = {}; // Create an empty object to store data
        userSelectionData?.forEach((setting) => {
          const columnName = setting.udfSettingName; // Get the column name from udfSettings
          const columnIndex = parsedData[0].indexOf(columnName);

          if (columnIndex !== -1) {
            const value = row[columnIndex]; // Get the value from the row

            if (
              setting.pcfField === "startDate" ||
              setting.pcfField === "finishDate"
            ) {
              // Handle date values
              const date = moment.utc(value, "DD/MM/YYYY", true);
              if (date.isValid()) {
                date.add(1, "day");
                dataObject[setting.pcfField] = date.toISOString();
              } else {
                // Handle invalid date format
              }
            } else if (
              setting.pcfField === "startChainage" ||
              setting.pcfField === "finishChainage"
            ) {
              // Handle numeric values
              dataObject[setting.pcfField] = parseFloat(value);
            } else {
              // Handle other fields
              if (setting.pcfField === "id") {
                dataObject["activityId"] = value.toString();
              } else {
                if (setting.pcfField === "critical") {
                  const critical: boolean = value == "1" ? true : false;

                  dataObject[setting.pcfField] = critical;
                } else {
                  dataObject[setting.pcfField] = value;
                }
              }
            }
          }
        });

        return dataObject as GraphDataType;
      })
      .filter((item) => item !== null) as GraphDataType[];
    // console.warn("this is errors of xlsx data ", graphData);
    //setGraphData(graphData);

    dispatch(addGraphDataList({ graphData: graphData }));
    formik.setFieldValue("graphData", graphData);
  };
  //? --------------------- end parsers -----------------test
  const submitData = (userSelectionData: UdfSetting[]) => {
    setSettingParsedModal(false);
    if (parsedData && fileType === ProjectFileType.XLSX) {
      parseXLsxContent(parsedData, userSelectionData);
      return;
    }
    if (parsedData && fileType === ProjectFileType.MicrosoftProject) {
      parseMSProjectXML(parsedData, userSelectionData);
      return;
    }
    if (parsedData && fileType === ProjectFileType.PrimaveraXML) {
      parsePrimaveraXML(parsedData, userSelectionData);
      return;
    }
  };

  const handleFileData = (data: ArrayBuffer | null) => {
    if (!data) {
      return [];
    }

    const workbook = XLSX.read(data, { type: "binary", cellDates: true });
    const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
    const worksheet = workbook.Sheets[sheetName];
    const parsedData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
    });

    const headers = parsedData[0].map((header: any) => header.toString());
    setUserDefinedSettings(() => headers);

    return parsedData;
  };
  function convertDurationToHours(duration: string): number {
    const regex = /PT(\d+)H(\d+)M(\d+)S/;
    const match = duration.match(regex);

    if (!match) {
      throw new Error("Invalid duration format");
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);

    const totalHours = hours + minutes / 60 + seconds / 3600;
    return totalHours;
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();

    const fileInput = event.target as HTMLInputElement;

    if (!fileInput || !fileInput.files) {
      return;
    }

    const file = fileInput.files[0];

    if (!file) {
      return;
    }
    fileInput.value = "";
    if (fileType === ProjectFileType.MicrosoftProject) {
      return handleMsProjectXMLFile(file);
    }
    if (fileType === ProjectFileType.PrimaveraXML) {
      return handlePrimaveraXMLFile(file);
    }

    const fileName = file.name;
    dispatch(addFileName({ fileName: fileName }));
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    if (fileExtension !== "xlsx") {
      // Show an alert for an invalid file format
      alert("Veuillez sélectionner un fichier XLSX ou Excel valide.");
      return;
    }

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target?.result as ArrayBuffer | null;
        if (data) {
          const parsedData = handleFileData(data);
          setSettingParsedModal(true);

          setParsedData(parsedData);
          //setGraphData((prev) => graphData);
          // parseXLsxContent(parsedData, udfSettings);
          // dispatch(addGraphDataList({ graphData: graphData }));
          // formik.setFieldValue("graphData", graphData);
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  const handlePrimaveraXMLFile = async (file: File) => {
    const fileName = file.name;
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    dispatch(addFileName({ fileName: fileName }));
    //setGraphData([]);
    if (fileExtension !== "xml") {
      // Show an alert for an invalid file format
      alert("Veuillez sélectionner un fichier XML de Primavera P6 valide.");
      return;
    }

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const xmlData = e.target?.result as string;

        if (xmlData) {
          const parsedData = await handlePrimaveraXMLData(xmlData);

          setSettingParsedModal(true);

          setParsedData(parsedData);

          // Set the graph data in your application state or dispatch it
          // dispatch(addGraphDataList({ graphData }));
          // formik.setFieldValue("graphData", graphData);
        }
      };

      reader.readAsText(file);
    }
  };

  const handlePrimaveraXMLData = async (xmlData: string) => {
    return new Promise((resolve, reject) => {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, "text/xml");

        const UDFTypes = xmlDoc.getElementsByTagName("UDFType");
        const calendars = xmlDoc.getElementsByTagName("Calendar");
        const calendarArray: any[] = [];

        for (let i = 0; i < calendars.length; i++) {
          const calendar = calendars[i];

          const calendarId =
            calendar.getElementsByTagName("ObjectId")[0]?.textContent ?? "";
          const calendarName =
            calendar.getElementsByTagName("Name")[0]?.textContent ?? "";
          const hoursByDay =
            calendar.getElementsByTagName("HoursPerDay")[0]?.textContent ?? "";

          const calendarData = {
            id: calendarId,
            name: calendarName,
            hoursByDay: hoursByDay,
          };

          calendarArray.push(calendarData);
          setCalendarData(calendarArray);
        }

        const udfArray: any[] = [];
        for (let j = 0; j < UDFTypes.length; j++) {
          const UDFType = UDFTypes[j];
          const udfId =
            UDFType.getElementsByTagName("ObjectId")[0]?.textContent ?? "";
          const alias =
            UDFType.getElementsByTagName("Title")[0]?.textContent ?? "";

          const userDefinedSetting = {
            alias,
            fieldName: alias,
            udfId,
          };
          udfArray.push(userDefinedSetting);
        }

        setUserDefinedSettings(() => udfArray);
        resolve(xmlDoc);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleMsProjectXMLFile = async (file: File) => {
    const fileName = file.name;
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    dispatch(addFileName({ fileName: fileName }));
    if (fileExtension !== "xml") {
      // Show an alert for an invalid file format
      alert(
        "Veuillez sélectionner un fichier XML de Microsoft Project valide."
      );
      return;
    }

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const xmlData = e.target?.result as string;

        if (xmlData) {
          const parsedData = await handleMSProjectXMLData(xmlData);
          setSettingParsedModal(true);

          setParsedData(parsedData);
          // Set the graph data in your application state or dispatch it
          // dispatch(addGraphDataList({ graphData }));
          // formik.setFieldValue("graphData", graphData);
        }
      };

      reader.readAsText(file);
    }
  };

  const handleMSProjectXMLData = async (xmlData: string) => {
    return new Promise((resolve, reject) => {
      // Parse the XML data and extract the required information
      // Create the graph data based on the parsed XML data
      // Resolve the promise with the xmlDoc
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, "text/xml");

        const UDFTypes =
          xmlDoc.getElementsByTagName("ExtendedAttributes")[0]?.children ?? [];
        const project = xmlDoc.getElementsByTagName("Project")[0];
        const calendars =
          xmlDoc.getElementsByTagName("Calendars")[0].children ?? [];

        const minutesPerDay =
          xmlDoc.getElementsByTagName("MinutesPerDay")[0].textContent;
        const calendarArray: any[] = [];

        for (let i = 0; i < calendars.length; i++) {
          const calendar = calendars[i];

          const calendarId =
            calendar.getElementsByTagName("UID")[0]?.textContent ?? "";
          const calendarName =
            calendar.getElementsByTagName("Name")[0]?.textContent ?? "";

          const calendarData = {
            id: calendarId,
            name: calendarName,
            hoursByDay: parseFloat(minutesPerDay ?? "0") / 60,
          };

          calendarArray.push(calendarData);
          setCalendarData(calendarArray);
        }
        const udfArray: any[] = [];
        for (let j = 0; j < UDFTypes.length; j++) {
          const UDFType = UDFTypes[j];

          const udfId =
            UDFType.getElementsByTagName("FieldID")[0]?.textContent ?? "";

          const aliasElement = UDFType.getElementsByTagName("Alias")[0];
          const fieldNameElement = UDFType.getElementsByTagName("FieldName")[0];
          const alias = aliasElement
            ? aliasElement.textContent
            : fieldNameElement
            ? fieldNameElement.textContent
            : "Alias not found";
          const fieldName =
            UDFType.getElementsByTagName("FieldName")[0]?.textContent ?? "";
          const userDefiendSetting = {
            alias,
            fieldName,
            udfId,
          };
          udfArray.push(userDefiendSetting);
        }
        setUserDefinedSettings(() => udfArray);
        resolve(xmlDoc);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleClick = (event: any) => {
    const { target = {} } = event || {};
    target.value = "";
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];

    if (!file) {
      // No file selected, do nothing
      return;
    }

    const fileName = file.name;
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

    if (fileExtension !== "xml" && fileType !== ProjectFileType.XLSX) {
      // Show an alert for an invalid file format
      alert("Veuillez sélectionner un fichier XML valide.");
      return;
    }
    if (fileExtension !== "xlsx" && fileType === ProjectFileType.XLSX) {
      // Show an alert for an invalid file format
      alert("Veuillez sélectionner un fichier XLSX valide.");
      return;
    }

    if (file) {
      const reader = new FileReader();
      let parsedData;
      reader.onload = async (e) => {
        let data = e.target?.result;
        if (fileType === ProjectFileType.MicrosoftProject) {
          data = e.target?.result as string;
          parsedData = await handleMSProjectXMLData(data);
        }

        if (fileType === ProjectFileType.PrimaveraXML) {
          data = e.target?.result as string;
          parsedData = handlePrimaveraXMLData(data);
        }

        data = e.target?.result as ArrayBuffer | null;
        if (data) {
          parsedData = handleFileData(data);
          //setGraphData((prev) => graphData);

          // dispatch
          // dispatch(addGraphDataList({ graphData: graphData }));
          // formik.setFieldValue("graphData", graphData);
        }
      };
      setParsedData(parsedData);
      reader.readAsBinaryString(file);
    }
  };

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBack = () => {
    // Define what should happen when the "Back" button is clicked.
    // For example, you can go back to the previous step.
    setCurrentStep((prevStep) => prevStep - 1);
  };

  useEffect(() => {
    const handleScroll = () => {
      // Check the scroll position, e.g., if the user scrolls down by 100 pixels, show the button
      if (window.scrollY > BackToTopHeightSize) {
        setShowBackToTopButton(true);
      } else {
        setShowBackToTopButton(false);
      }
    };

    // Add the scroll event listener when the component mounts
    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fileSvgIcons = () => {
    switch (fileType) {
      case ProjectFileType.MicrosoftProject:
        return <img src={msProject} alt="filelogo" className="h-30 w-30" />;

      case ProjectFileType.PrimaveraXML:
        return <img src={primavera} alt="filelogo" className="h-30 w-30" />;

      case ProjectFileType.XLSX:
        return <img src={excel} alt="filelogo" className="h-30 w-30" />;

      default:
        break;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ActionButtonsCell = ({ value, row }: any) => {
    return (
      <div className="flex gap-2">
        <button
          hidden={!canWrite && !isAdmin}
          onClick={() => {
            handleEditClick(row.original);
          }}
          className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover-bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          <PencilIcon className="inline w-5 h-5 mr-2" />
          {t("projectsList.buttons.edit")}
        </button>
        {isAdmin && (
          <button
            className="focus:outline-none text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover-bg-red-700 dark:focus:ring-red-900"
            onClick={(e) => {
              setSelectedRow(row.original["id"]);
              setIsModalVisible(true);
            }}
          >
            <TrashIcon className="inline w-5 h-5 mr-2" />
            {t("projectsList.buttons.delete")}
          </button>
        )}
      </div>
    );
  };
  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "activityId",
      },
      {
        Header: t("importFileForm.activityName"),
        accessor: "activityName",
      },

      {
        Header: t("importFileForm.startDate"),
        accessor: "startDate",

        Cell: ({ cell: { value } }: any) => {
          const dateValue = moment.utc(value);

          if (dateValue.format("YYYY-MM-DD") === "0001-01-01") {
            return (
              <div className="dark:bg-boxdark-2 dark:text-bodydark">
                {t("projectsList.NoDateAvailable")}
              </div>
            );
          }

          const formattedValue = dateValue
            .tz(userTimeZone)
            .format("DD/MM/YYYY");
          return (
            <div className="dark:bg-boxdark-2 dark:text-bodydark">
              {formattedValue}
            </div>
          );
        },
      },
      {
        Header: t("importFileForm.endDate"),
        accessor: "finishDate",

        Cell: ({ cell: { value } }: any) => {
          const dateValue = moment.utc(value);

          if (dateValue.format("YYYY-MM-DD") === "0001-01-01") {
            return (
              <div className="dark:bg-boxdark-2 dark:text-bodydark">
                {t("projectsList.NoDateAvailable")}
              </div>
            );
          }

          const formattedValue = dateValue
            .tz(userTimeZone)
            .format("DD/MM/YYYY");
          return (
            <div className="dark:bg-boxdark-2 dark:text-bodydark">
              {formattedValue}
            </div>
          );
        },
      },
      {
        Header: t("importFileForm.duration"),
        accessor: "duration",
        Cell: ({ cell: { value, row } }: any) => (
          <input
            type="text"
            className="min-w-[5rem] focus:outline-none dark:bg-boxdark-2 dark:text-bodydark"
            value={value}
            readOnly
          />
        ),
      },
      {
        Header: t("importFileForm.activityStyle"),
        accessor: "style",
        Cell: ({ cell: { value, row } }: any) => (
          <input
            type="text"
            className="min-w-[5rem] focus:outline-none dark:bg-boxdark-2 dark:text-bodydark"
            value={value}
            readOnly
          />
        ),
      },
      {
        Header: t("importFileForm.startPk"),
        accessor: "startChainage",
        Cell: ({ cell: { value, row } }: any) => (
          <input
            type="text"
            className="min-w-[2rem] focus:outline-none dark:bg-boxdark-2 dark:text-bodydark"
            value={value}
            readOnly
          />
        ),
      },
      {
        Header: t("importFileForm.endPk"),
        accessor: "finishChainage",
        Cell: ({ cell: { value, row } }: any) => (
          <input
            type="text"
            className="min-w-[2rem] focus:outline-none dark:bg-boxdark-2 dark:text-bodydark"
            value={value}
            readOnly
          />
        ),
      },
      {
        Header: t("importFileForm.calendar"),
        accessor: "calendarName",
        Cell: ({ cell: { value, row } }: any) => (
          <input
            type="text"
            className="min-w-[25rem] focus:outline-none dark:bg-boxdark-2 dark:text-bodydark"
            value={value}
            readOnly
          />
        ),
      },

      {
        Header: t("importFileForm.critical"),
        accessor: "critical",
        Cell: ({ cell: { value, row } }: any) => (
          <input
            type="checkbox"
            className={`min-w-50 `}
            checked={value}
            readOnly
          />
        ),
      },
      {
        Header: t("importFileForm.quantity"),
        accessor: "quantity",
        Cell: ({ cell: { value, row } }: any) => {
          var unit = row.original["quantityUnit"] ?? "";
          var quantityString = value + " " + unit;
          if (!value) {
            return <></>;
          }
          return (
            <input
              type="text"
              className={`min-w-50 `}
              value={quantityString}
              readOnly
            />
          );
        },
      },
      {
        Header: t("importFileForm.ProductionRate"),
        accessor: "productionRate",
        Cell: ({ cell: { value, row } }: any) => {
          var unit = row.original["productionRateUnit"] ?? "";
          var prString = value + " " + unit;
          if (!value) {
            return <></>;
          }
          return (
            <input
              type="text"
              className={`min-w-50 `}
              value={prString}
              readOnly
            />
          );
        },
      },
      {
        Header: t("importFileForm.workShops"),
        accessor: "workShops",
        Cell: ({ cell: { value, row } }: any) => (
          <input type="number" className={`min-w-50 `} value={value} readOnly />
        ),
      },
      {
        Header: t("projectsList.actions"),
        accessor: "styleId",
        Cell: ({ cell: { value, row } }: any) => (
          <ActionButtonsCell value={value} row={row} />
        ),
      },
    ],
    [t, userTimeZone, ActionButtonsCell]
  );
  const handleCancelDelete = () => {
    setIsModalVisible(false);
  };

  const handleDeleteConfirmation = () => {
    handleDeleteClick(selectedRow);

    setIsModalVisible(false);
  };

  return (
    <div
      className="w-full mt-10 relative h-[100%]"
      onDragOver={preventDefault}
      onDrop={handleDrop}
    >
      {loading ? (
        <Spinner />
      ) : (
        <label className="relative flex items-center justify-center w-full h-40 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer dark:bg-boxdark hover:border-gray-400 focus:outline-none">
          {editForm ? (
            <div className="flex flex-col ">
              {fileSvgIcons()}
              <span className="font-semibold text-center">{fileName}</span>
            </div>
          ) : (
            <>
              <span className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="font-medium text-gray-600">
                  {t("importFileForm.dragOrImport")}
                </span>
              </span>
              <input
                onChange={handleFileUpload}
                type="file"
                onClick={handleClick}
                disabled={!canWrite && !isAdmin}
                name="file_upload"
                className="hidden"
                accept={
                  fileType === ProjectFileType.XLSX
                    ? ".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    : ".xml, text/xml"
                }
              />
            </>
          )}
        </label>
      )}

      <div className="relative w-full mt-10">
        {rawData && rawData.length > 0 && <FiltersInputs />}

        <div className="flex justify-between my-4">
          {/* Add the "Back" button */}
          <button
            type="button"
            className="px-4 py-2 text-white bg-gray-400 rounded-lg hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-300 disabled:bg-gray-600"
            onClick={handleBack}
          >
            {t("importFileForm.back")}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-600"
            disabled={
              graphSettings.graphData?.length === 0 ||
              graphSettings.fromDate > graphSettings.toDate
            }
            onClick={() => {
              dispatch(updateShapes());
              setCurrentStep((prevStep) => prevStep + 1);
            }}
          >
            {t("importFileForm.next")}
          </button>
        </div>
        {
          <div className="flex justify-start my-4">
            <button
              type="button"
              onClick={handleAddClick}
              className="mb-2 mr-2 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
            >
              {t("importFileForm.add")}
            </button>
          </div>
        }
        <div className="flex flex-col mx-auto min-w-[40rem] overflow-x-scroll ">
          <DynamicTable
            dataCount={graphSettings.graphData?.length ?? 1 - 1 ?? 0}
            rawData={graphSettings.graphData ?? []}
            data={graphDataTable ?? []}
            columns={columns}
            setSearch={setSearch}
          />
          {isModalVisible && (
            <DeleteConfirmationModal
              isOpen={isModalVisible}
              onDelete={handleDeleteConfirmation}
              onCancel={handleCancelDelete}
            />
          )}
          <Pagination
            pageIndex={pageCount === 0 ? -1 : pageIndex}
            pageCount={pageCount}
            pageSize={pageSize}
            onNextPage={nextPage}
            onPreviousPage={previousPage}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      </div>

      {
        <>
          {showBackToTopButton && (
            <button
              type="button"
              className="flex items-end self-end justify-end w-full back-to-top-button"
              onClick={() => {
                scroll.scrollToTop(); // Scroll to the top when the button is clicked
              }}
            >
              <ArrowUpCircleIcon className="w-20 h-20 text-blue-500 opacity-40" />{" "}
              {/* Use the Heroicon here */}
            </button>
          )}
          {isModalOpen && (
            <ActivityTableForm
              initialValues={edit || undefined}
              onSubmit={closeModal}
              handleClose={() => setIsModalOpen(false)}
              minDistance={parseFloat(formik.values.fromDistance)}
              maxDistance={parseFloat(formik.values.toDistance)}
            />
          )}
          {settingParsedModal && (
            <ParameterSelector
              onSubmit={submitData}
              udfSettingString={userDefinedSettings}
              handleClose={() => setSettingParsedModal(false)}
            />
          )}
        </>
      }
    </div>
  );
};
