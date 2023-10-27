import React, { forwardRef, useCallback, useEffect, useState } from "react";
import { MultiStepFormProps } from "./DrawGraphForm";

import * as XLSX from "xlsx";
import {
  GraphDataType,
  UdfSetting,
  addGraphDataList,
  applyFilter,
  removeActivity,
  updateGraphSettingsValue,
} from "src/state/slices/graphSlice";
import * as Yup from "yup";
import { useFormik } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state";
import { animateScroll as scroll } from "react-scroll";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { BackToTopHeightSize, ProjectFileType } from "../const/vars";
import { useTranslation } from "react-i18next";
import ActivityTableForm from "./ActivityTableForm";
import Spinner from "./Spinner";
import ParameterSelector from "./ParmeterSelector";
import { type } from "@testing-library/user-event/dist/type";
import { uniqueId } from "lodash";

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
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  const initForm: FormValues = {
    fromDate: new Date(currentYear, 0, 1), // Month 0 is January
    toDate: new Date(nextYear, 11, 31),
    graphData: [],
    fromDistance: "10000",
    toDistance: "20000",
    timeRange: "Yearly",
    distanceRange: 200,
  };

  const dispatch = useDispatch();
  const graphSettings = useSelector((state: RootState) => state.settings);
  const fileType = useSelector(
    (state: RootState) => state.projectSettings.fileType
  );

  const rawData = useSelector((state: RootState) => state.rawGraphDataFromFile);
  const udfSettingsData = useSelector(
    (state: RootState) => state.userDefindSettings
  );
  console.error("MyComponent is rendering", udfSettingsData); // Add this line

  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [settingParsedModal, setSettingParsedModal] = useState(false);
  const [userDefinedSettings, setUserDefinedSettings] = useState<any[]>([]);
  const [edit, setEdit] = useState<GraphDataType | null>(null);
  const [initialValues, setInitialValues] = useState<FormValues>(initForm);
  const [graphData, setGraphData] = useState<GraphDataType[]>([]);
  const [filteredData, setFilteredData] = useState<GraphDataType[]>([]);
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
  const handleSaveActivity = (degree: GraphDataType) => {
    // Handle save logic
    // Call the API or dispatch an action to save the degree
    closeModal();
  };
  const formik = useFormik({
    initialValues: {
      fromDate: new Date(graphSettings.fromDate) ?? initForm.fromDate,
      toDate: new Date(graphSettings.toDate) ?? initForm.toDate,
      graphData: graphSettings.graphData,
      fromDistance: graphSettings.fromDistance.toString() ?? "10000",
      toDistance: graphSettings.toDistance.toString() ?? "20000",
      timeRange: graphSettings.timeRange ?? "Yearly",
      distanceRange: graphSettings.distanceRange ?? 200,
    },
    validationSchema,
    enableReinitialize: true,

    onSubmit: (values) => {
      if (values.graphData.length === 0) return;

      dispatch(
        updateGraphSettingsValue({
          graphSettingsForm: {
            ...values,
            fromDate: values.fromDate.toISOString(),
            toDate: values.toDate.toISOString(),
            graphData: graphSettings.graphData,
            fromDistance: parseInt(values.fromDistance),
            toDistance: parseInt(values.toDistance),
            timeRange: values.timeRange,
          },
        })
      );
      setCurrentStep((prevStep) => prevStep + 1);
    },
  });
  function arraysEqual(arr1: string[], arr2: string[]) {
    if (arr1.length !== arr2.length) return false;
    // for (let i = 0; i < arr1.length; i++) {
    //   if (arr1[i] !== arr2[i]) return false;
    // }
    return true;
  }

  //?  --------****--- parsers -------***---------------------

  //? get Extra parser for attributes names
  const getExtendPropertyData = (
    xmlDoc: any,
    activity: any,
    userSelectionData: UdfSetting[]
  ) => {
    // const UDFTypes =
    //   xmlDoc.getElementsByTagName("ExtendedAttributes")[0].children;

    const UDFElements = activity.getElementsByTagName("ExtendedAttribute");

    const dataObject: Partial<GraphDataType> = {};
    if (!UDFElements) {
      return {
        startChainage: 0,
        finishChainage: 0,
        style: activity.getElementsByTagName("Name")[0].textContent,
      };
    }
    for (let i = 0; i < UDFElements.length; i++) {
      const UDF = UDFElements[i];

      const typeObjectId = UDF.getElementsByTagName("FieldID")[0].textContent;
      const value = UDF.getElementsByTagName("Value")[0].textContent;

      const setting = userSelectionData?.find(
        (x) => x.udfSettingId === typeObjectId.trim() // Remove leading/trailing whitespaces
      );

      // console.error(
      //   "🚀 ~ file: ImportFileForm.tsx:582 ~ getExtendPropertyData ~ UDFType:",
      //   setting,
      //   udfSettingsData,
      //   typeObjectId,
      //   UDF
      // );

      if (!setting) return;
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
        dataObject[setting.pcfField] = value;
      }
      // const typeObjectIdFromUDFType =
      //   UDFType.getElementsByTagName("FieldID")[0].textContent;
      // const title = UDFType.getElementsByTagName("Alias")[0].textContent;
      // const textValue = UDF.getElementsByTagName("Value")[0].textContent;
      // console.log(
      //   "🚀 ~ file: ImportFileForm.tsx:523 ~ getExtendPropertyData ~ textValue:",
      //   typeObjectIdFromUDFType,
      //   title,
      //   textValue
      // );

      // if (typeObjectId === typeObjectIdFromUDFType) {
      //   if (title === "TilosStart") {
      //     udfData.startChainage = parseFloat(textValue);
      //   } else if (title === "TilosEnd") {
      //     udfData.finishChainage = parseFloat(textValue);
      //   } else if (title === "TilosStyle") {
      //     udfData.style = textValue;
      //   }
      // }
    }

    return dataObject;
  };

  const getUDFData = (
    xmlDoc: any,
    activity: any,
    userSelectionData: UdfSetting[]
  ) => {
    const UDFElements = activity.getElementsByTagName("UDF");

    const dataObject: Partial<GraphDataType> = {};

    for (let i = 0; i < UDFElements.length; i++) {
      const UDF = UDFElements[i];

      const typeObjectId =
        UDF.getElementsByTagName("TypeObjectId")[0].textContent;
      const textValue = UDF.getElementsByTagName("TextValue")[0].textContent;

      // Find the corresponding setting based on the typeObjectId
      const setting = userSelectionData!.find(
        (x) => x.udfSettingId === typeObjectId.toString()
      );

      if (setting) {
        if (
          setting.pcfField === "startDate" ||
          setting.pcfField === "finishDate"
        ) {
          // Handle date values
          const date = moment.utc(textValue, "DD/MM/YYYY", true);
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
          dataObject[setting.pcfField] = parseFloat(textValue);
        } else {
          // Handle other fields
          dataObject[setting.pcfField] = textValue;
        }
      }
    }

    return dataObject;
  };
  //? ---------------------parsers -----------------
  const parsePrimaveraXML = (
    xmlDoc: Document,
    userSelectionData: UdfSetting[]
  ) => {
    const graphData: any[] = [];

    // Get the <Project> element (assuming it's the root element)
    const project = xmlDoc.getElementsByTagName("Project")[0];

    if (project) {
      const activities = project.getElementsByTagName("Activity");

      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        const activityId = activity.getElementsByTagName("Id")[0].textContent;
        const activityName =
          activity.getElementsByTagName("Name")[0].textContent;

        const startDate =
          activity.getElementsByTagName("StartDate")[0].textContent;
        const finishDate =
          activity.getElementsByTagName("FinishDate")[0].textContent;

        // Get UDF data based on specific Titles
        const udfData = getUDFData(xmlDoc, activity, userSelectionData);

        graphData.push({
          id: activityId,
          activityName,
          startDate,
          finishDate,
          ...udfData,
        });
      }
    }

    // setGraphData(graphData);
    dispatch(addGraphDataList({ graphData: graphData }));
    formik.setFieldValue("graphData", graphData);
  };

  const parseMSProjectXML = (
    xmlDoc: Document,
    userSelectionData: UdfSetting[]
  ) => {
    const graphData: any[] = [];

    // Get the <Project> element (assuming it's the root element)
    const project = xmlDoc.getElementsByTagName("Project")[0];

    if (project) {
      const activities = xmlDoc.getElementsByTagName("Tasks")[0].children;
      // const sumary = xmlDoc.getElementsByTagName("Summary")[0];

      // if (sumary) {
      //   return;
      // }

      for (let i = 0; i < activities.length; i++) {
        const activity = activities[i];

        const activityId = activity.getElementsByTagName("ID")[0].textContent;
        const activityName =
          activity.getElementsByTagName("Name")[0].textContent;
        const startDate = activity.getElementsByTagName("Start")[0].textContent;
        const finishDate =
          activity.getElementsByTagName("Finish")[0].textContent;

        // Get UDF data based on specific Titles
        const udfData = getExtendPropertyData(
          xmlDoc,
          activity,
          userSelectionData
        );

        graphData.push({
          id: activityId,
          activityName,
          startDate,
          finishDate,
          ...udfData,
        });
      }
    }

    //setGraphData(graphData);
    dispatch(addGraphDataList({ graphData: graphData }));
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
              dataObject[setting.pcfField] = value;
            }
          }
        });

        return dataObject as GraphDataType;
      })
      .filter((item) => item !== null) as GraphDataType[];
    // console.warn("this is errors of xlsx data ", graphData);
    //setGraphData(graphData);
    console.warn("this is errors of xlsx data ", graphData);

    dispatch(addGraphDataList({ graphData: graphData }));
    formik.setFieldValue("graphData", graphData);
  };

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

  function adjustTimeZone(dateString: string) {
    const [day, month, year] = dateString.split("/");
    const parsedDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    return parsedDate.toISOString().split("T")[0]; // Output as YYYY-MM-DD
  }

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

    console.log("this is erors ", parsedData);
    const headers = parsedData[0].map((header: any) => header.toString());
    setUserDefinedSettings((prev) => headers);

    // Assuming your data structure matches the XLSX columns order
    // const graphData = parsedData
    //   .slice(1)
    //   .filter((row) => row[0] !== null && row[0] !== undefined)
    //   .map((row) => {
    //     const startDate = moment.utc(row[2], "DD/MM/YYYY", true); // Parse Start Date
    //     const finishDate = moment.utc(row[3], "DD/MM/YYYY", true);
    //     if (!startDate.isValid() || !finishDate.isValid()) {
    //       // Handle invalid date format here
    //       return null;
    //     }
    //     startDate.add(1, "day");
    //     finishDate.add(1, "day");
    //     return {
    //       id: row[0],
    //       activityName: row[1].toString().trim(),
    //       startDate: startDate.toISOString(), // Assign parsed Start Date
    //       finishDate: finishDate.toISOString(), // Assign parsed Finish Date
    //       startChainage: parseFloat(row[4]),
    //       finishChainage: parseFloat(row[5]),
    //       style: row[6],
    //     } as GraphDataType;
    //   })
    //   .filter((item) => item !== null) as GraphDataType[];
    return parsedData;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    event.preventDefault();
    event.stopPropagation();

    const fileInput = event.target as HTMLInputElement;

    if (!fileInput || !fileInput.files) {
      // Handle the case where event.target is null or files are not available
      return;
    }

    const file = fileInput.files[0];

    if (!file) {
      // No file selected, do nothing
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

        setUserDefinedSettings((pre) => udfArray);
        resolve(xmlDoc);
      } catch (error) {
        reject(error);
      }
    });
  };

  //! this is case of MS
  const handleMsProjectXMLFile = async (file: File) => {
    const fileName = file.name;
    const fileExtension = fileName.split(".").pop()?.toLowerCase();

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
          xmlDoc.getElementsByTagName("ExtendedAttributes")[0].children;
        console.warn(
          "🚀 ~ file: ImportFileForm.tsx:662 ~ returnnewPromise ~ UDFTypes:",
          UDFTypes
        );

        const udfArray: any[] = [];
        for (let j = 0; j < UDFTypes.length; j++) {
          const UDFType = UDFTypes[j];
          const udfId = UDFType.getElementsByTagName("FieldID")[0].textContent;

          const aliasElement = UDFType.getElementsByTagName("Alias")[0];
          const fieldNameElement = UDFType.getElementsByTagName("FieldName")[0];
          const alias = aliasElement
            ? aliasElement.textContent
            : fieldNameElement
            ? fieldNameElement.textContent
            : "Alias not found";
          const fieldName =
            UDFType.getElementsByTagName("FieldName")[0].textContent;
          const userDefiendSetting = {
            alias,
            fieldName,
            udfId,
          };
          udfArray.push(userDefiendSetting);
        }
        setUserDefinedSettings((prev) => udfArray);
        resolve(xmlDoc);
      } catch (error) {
        reject(error);
        console.error("error ", error);
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
  // const renderMonthContent = (month: any, shortMonth: any, longMonth: any) => {
  //   const tooltipText = `Tooltip for month: ${longMonth}`;
  //   return <span title={tooltipText}>{shortMonth}</span>;
  // };

  const CustomInput = forwardRef(({ value, onClick, onChange }: any, ref) => (
    <input
      type="text"
      value={value}
      onClick={onClick}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring focus:ring-blue-300"
    />
  ));

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

  // const applyFilter = () => {
  //   const filteredGraphData = graphSettings.graphData.filter((data) => {
  //     const dataStartDate = new Date(data.startDate);
  //     console.log(
  //       "🚀 ~ file: ImportFileForm.tsx:290 ~ filteredGraphData ~ dataStartDate:",
  //       dataStartDate
  //     );
  //     const dataFinishDate = new Date(data.finishDate);
  //     console.log(
  //       "🚀 ~ file: ImportFileForm.tsx:292 ~ filteredGraphData ~ dataFinishDate:",
  //       dataFinishDate
  //     );

  //     const zeroDistance =
  //       formik.values.fromDistance == "0" && formik.values.toDistance == "0";
  //     const fromDate = new Date(formik.values.fromDate);
  //     console.log(
  //       "🚀 ~ file: ImportFileForm.tsx:303 ~ filteredGraphData ~ fromDate:",
  //       fromDate
  //     );
  //     const toDate = new Date(formik.values.toDate);
  //     console.log(
  //       "🚀 ~ file: ImportFileForm.tsx:305 ~ filteredGraphData ~ toDate:",
  //       toDate
  //     );

  //     return (
  //       dataFinishDate >= fromDate &&
  //       dataStartDate <= toDate &&
  //       data.startChainage >= parseFloat(formik.values.fromDistance) &&
  //       data.finishChainage <= parseFloat(formik.values.toDistance)
  //     );
  //   });
  //   console.log(
  //     "🚀 ~ file: ImportFileForm.tsx:304 ~ filteredGraphData ~ filteredGraphData:",
  //     filteredGraphData,
  //     graphSettings.graphData
  //   );
  //   setFilteredData(filteredGraphData);
  // };

  useEffect(() => {
    dispatch(
      applyFilter({
        fromDate: formik.values.fromDate.toISOString(),
        toDate: formik.values.toDate.toISOString(),
        fromDistance: parseFloat(formik.values.fromDistance),
        toDistance: parseFloat(formik.values.toDistance),
        timeRange: formik.values.timeRange,
        distanceRange: formik.values.distanceRange,
      })
    );
  }, [
    dispatch,
    formik.values.distanceRange,
    formik.values.fromDate,
    formik.values.fromDistance,
    formik.values.timeRange,
    formik.values.toDate,
    formik.values.toDistance,
    graphSettings.graphData.length,
  ]);

  return (
    <div
      className="w-full mt-10 relative"
      onDragOver={preventDefault}
      onDrop={handleDrop}
    >
      <form onSubmit={formik.handleSubmit}>
        {isLoading ? (
          <Spinner />
        ) : (
          <label className="flex justify-center items-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
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
              name="file_upload"
              className="hidden"
              accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />
          </label>
        )}

        <div className="relative   w-full mt-10">
          {rawData && rawData.length > 0 && (
            <div className="grid grid-cols-3 gap-2 justify-center">
              <div className="mb-4">
                <label
                  htmlFor="fromDate"
                  className="block font-medium text-gray-700"
                >
                  {t("importFileForm.startDate")}
                </label>
                <DatePicker
                  id="fromDate"
                  selected={formik.values.fromDate}
                  onChange={(date) => formik.setFieldValue("fromDate", date)}
                  dateFormat="MM/yyyy"
                  wrapperClassName="w-full px-3 py-2 border rounded-lg"
                  customInput={
                    <CustomInput
                      className="w-full px-3 py-2 border rounded-lg"
                      value={moment(formik.values.fromDate).format("MMMM")}
                    />
                  }
                  showMonthYearPicker
                />
                {/* {formik.touched.fromDate && formik.errors.fromDate ? (
                   <div className="text-red-600">{formik.errors.fromDate}</div>
                 ) : null} */}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="toDate"
                  className="block font-medium text-gray-700"
                >
                  {t("importFileForm.endDate")}
                </label>
                <DatePicker
                  id="toDate"
                  selected={formik.values.toDate}
                  onChange={(date) => formik.setFieldValue("toDate", date)}
                  dateFormat="MM/yyyy"
                  wrapperClassName="w-full px-3 py-2 border rounded-lg"
                  customInput={
                    <CustomInput
                      value={moment(formik.values.toDate).format("MMMM")}
                    />
                  }
                  showMonthYearPicker
                />
                {/* {formik.touched.toDate && formik.errors.toDate ? (
                   <div className="text-red-600">{formik.errors.toDate}</div>
                 ) : null} */}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="timeRange"
                  className="block font-medium text-gray-700"
                >
                  {t("importFileForm.timeScale")}
                </label>
                <select
                  value={formik.values.timeRange}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  id="timeRange"
                  name="timeRange"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring focus:ring-blue-300"
                >
                  <option value="Yearly">
                    {t("importFileForm.yearlyOption")}
                  </option>
                  <option value="Monthly">
                    {t("importFileForm.monthlyOption")}
                  </option>
                  <option value="Weekly">
                    {t("importFileForm.weeklyOption")}
                  </option>
                  <option value="Daily">
                    {t("importFileForm.dailyOption")}
                  </option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="fromDistance"
                  className="block font-medium text-gray-700"
                >
                  {t("importFileForm.startPk")}
                </label>
                <input
                  id="fromDistance"
                  name="fromDistance"
                  type="number"
                  value={formik.values.fromDistance}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring focus:ring-blue-300"
                />
                {formik.touched.fromDistance && formik.errors.fromDistance && (
                  <div className="text-red-600">
                    {formik.errors.fromDistance}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="toDistance"
                  className="block font-medium text-gray-700"
                >
                  {t("importFileForm.endPk")}
                </label>
                <input
                  id="toDistance"
                  name="toDistance"
                  type="number"
                  value={formik.values.toDistance}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring focus:ring-blue-300"
                />
                {formik.touched.toDistance && formik.errors.toDistance && (
                  <div className="text-red-600">{formik.errors.toDistance}</div>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="distanceRange"
                  className="block font-medium text-gray-700"
                >
                  {t("importFileForm.distanceRange")}
                </label>
                <input
                  id="distanceRange"
                  name="distanceRange"
                  type="number"
                  value={formik.values.distanceRange}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring focus:ring-blue-300"
                />
                {formik.touched.distanceRange &&
                  formik.errors.distanceRange && (
                    <div className="text-red-600">
                      {formik.errors.distanceRange}
                    </div>
                  )}
              </div>
            </div>
          )}
          <div className="my-4 flex justify-between">
            {/* Add the "Back" button */}
            <button
              type="button"
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-300 disabled:bg-gray-600"
              onClick={handleBack}
            >
              {t("importFileForm.back")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-600"
              disabled={
                graphSettings.graphData.length === 0 ||
                graphSettings.fromDate > graphSettings.toDate
              }
            >
              {t("importFileForm.next")}
            </button>
          </div>
          {
            <div className="my-4 flex justify-start">
              <button
                type="button"
                onClick={handleAddClick}
                className="mb-2 mr-2 rounded-lg bg-green-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              >
                {t("importFileForm.add")}
              </button>
            </div>
          }
          <table
            key={uniqueId()}
            className="   w-full  text-sm text-left text-gray-500 dark:text-gray-400"
          >
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  ID
                </th>
                <th scope="col" className="px-6 py-3">
                  {t("importFileForm.activityName")}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t("importFileForm.startDate")}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t("importFileForm.endDate")}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t("importFileForm.startPk")}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t("importFileForm.endPk")}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t("importFileForm.activityStyle")}
                </th>
                <th scope="col" className="px-6 py-3">
                  {t("importFileForm.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {graphSettings.graphData.map((data, index) => (
                <tr
                  key={data.id + index + uniqueId()}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {data.id}
                  </th>
                  <td className="px-6 py-4">{data.activityName}</td>
                  <td className="px-6 py-4">
                    {moment(data.startDate).format("DD/MM/YYYY")}
                  </td>
                  <td className="px-6 py-4">
                    {moment(data.finishDate).format("DD/MM/YYYY")}
                  </td>
                  <td className="px-6 py-4">{data.startChainage}</td>
                  <td className="px-6 py-4">{data.finishChainage}</td>
                  <td className="px-6 py-4">{data.style}</td>
                  <td className="flex px-6 py-3">
                    <button
                      type="button"
                      onClick={() => handleEditClick(data)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {t("importFileForm.edit")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(data.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      {t("importFileForm.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </form>
      {
        <>
          {showBackToTopButton && (
            <button
              type="button"
              className="back-to-top-button flex justify-end items-end self-end w-full"
              onClick={() => {
                scroll.scrollToTop(); // Scroll to the top when the button is clicked
              }}
            >
              <ArrowUpCircleIcon className=" h-20 w-20  text-blue-500 opacity-40" />{" "}
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
