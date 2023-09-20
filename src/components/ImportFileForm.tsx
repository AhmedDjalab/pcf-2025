import React, { forwardRef, useEffect, useState } from "react";
import { MultiStepFormProps } from "./DrawGraphForm";
//@ts-ignore
import * as XLSX from "xlsx";
import {
  GraphDataType,
  GraphSetting,
  updateGraphSettingsValue,
} from "../state/slices/graphSlice";
import * as Yup from "yup";
import { useFormik, useFormikContext } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state";
export const ImportFileForm = ({ setCurrentStep }: MultiStepFormProps) => {
  const [graphData, setGraphData] = useState<GraphDataType[]>([]);
  const [filteredData, setFilteredData] = useState<GraphDataType[]>([]);
  const dispatch = useDispatch();
  const graphSettings = useSelector((state: RootState) => state.graph.settings);
  type FormValues = {
    fromDate: Date;
    toDate: Date;
    graphData: any[]; // Adjust the type for graphData as needed
    fromDistance: string;
    toDistance: string;
    timeRange: "Yearly" | "Monthly" | "Weekly" | "Daily"; // Define the specific values for timeRange
  };

  const initialValues: FormValues = {
    fromDate: new Date(),
    toDate: new Date(),
    graphData: [],
    fromDistance: "10000",
    toDistance: "20000",
    timeRange: "Yearly",
  };
  const validationSchema = Yup.object().shape({
    fromDate: Yup.date().required("From Date is required"),
    toDate: Yup.date()
      .required("To Date is required")
      .min(Yup.ref("fromDate"), "To Date should be after From Date"),
    fromDistance: Yup.number().required("From Distance is required"),
    toDistance: Yup.number().required("To Distance is required"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,

    onSubmit: (values) => {
      if (values.graphData.length === 0) return;

      dispatch(
        updateGraphSettingsValue({
          graphSettingsForm: {
            ...values,
            fromDate: values.fromDate.toISOString(),
            toDate: values.toDate.toISOString(),
            graphData: filteredData,
            fromDistance: parseInt(values.fromDistance),
            toDistance: parseInt(values.toDistance),
            timeRange: values.timeRange,
          },
        })
      );
      setCurrentStep((prevStep) => prevStep + 1);
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const fileInput = event.target!;

    if (!fileInput) {
      // Handle the case where event.target is null
      return;
    }
    const file = fileInput.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary", cellDates: true });
          const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
          const worksheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Assuming your data structure matches the XLSX columns order
          const graphData = parsedData
            .slice(1)
            .filter((row: any) => row[0] !== null && row[0] !== undefined)
            .map((row: any) => {
              const startDate = moment(row[2], "MM/DD/YYYY"); // Parse Start Date
              const finishDate = moment(row[3], "MM/DD/YYYY"); // Parse Finish Date

              if (!startDate.isValid() || !finishDate.isValid()) {
                // Handle invalid date format here
                return null;
              }

              return {
                id: row[0],
                activityName: row[1],
                startDate: startDate.toISOString(), // Assign parsed Start Date
                finishDate: finishDate.toISOString(), // Assign parsed Finish Date
                startChainage: parseFloat(row[4]),
                finishChainage: parseFloat(row[5]),
                style: row[6],
              };
            })
            .filter((item: any) => item !== null) as GraphDataType[];

          setGraphData(graphData);
          formik.setFieldValue("graphData", graphData);
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary", cellDates: true });
          const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
          const worksheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Assuming your data structure matches the XLSX columns order
          const graphData = parsedData
            .slice(1)
            .filter((row: any) => row[0] !== null && row[0] !== undefined)
            .map((row: any) => {
              const startDate = moment(row[2], "MM/DD/YYYY"); // Parse Start Date
              const finishDate = moment(row[3], "MM/DD/YYYY"); // Parse Finish Date

              if (!startDate.isValid() || !finishDate.isValid()) {
                // Handle invalid date format here
                return null;
              }

              return {
                id: row[0],
                activityName: row[1],
                startDate: startDate.toISOString(), // Assign parsed Start Date
                finishDate: finishDate.toISOString(), // Assign parsed Finish Date
                startChainage: parseFloat(row[4]),
                finishChainage: parseFloat(row[5]),
                style: row[6],
              };
            })
            .filter((item: any) => item !== null) as GraphDataType[];

          setGraphData(graphData);
          formik.setFieldValue("graphData", graphData);
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  const renderMonthContent = (month: any, shortMonth: any, longMonth: any) => {
    const tooltipText = `Tooltip for month: ${longMonth}`;
    return <span title={tooltipText}>{shortMonth}</span>;
  };

  const CustomInput = forwardRef(({ value, onClick }: any, ref) => (
    //@ts-ignore
    //@ts-ignore
    <input
      type="text"
      value={value}
      onClick={onClick}
      className="w-full px-3 py-2 border rounded-lg outline-none focus:ring focus:ring-blue-300"
    />
  ));

  const applyFilter = () => {
    const filteredGraphData = graphData.filter((data) => {
      const dataStartDate = moment(data.startDate);
      const dataFinishDate = moment(data.finishDate);

      const zeroDistance =
        formik.values.fromDistance == "0" && formik.values.toDistance == "0";

      if (zeroDistance) {
        return (
          dataStartDate.isSameOrAfter(formik.values.fromDate, "day") &&
          dataFinishDate.isSameOrBefore(formik.values.toDate, "day")
        );
      } else {
        return (
          dataStartDate.isSameOrAfter(formik.values.fromDate, "day") &&
          dataFinishDate.isSameOrBefore(formik.values.toDate, "day") &&
          data.startChainage >= parseFloat(formik.values.fromDistance) &&
          data.finishChainage <= parseFloat(formik.values.toDistance)
        );
      }
    });
    setFilteredData(filteredGraphData);
  };

  // Effect to apply the filter whenever form fields change
  useEffect(() => {
    applyFilter();
  }, [formik.values]);

  return (
    <div
      className="w-full mt-10"
      onDragOver={preventDefault}
      onDrop={handleDrop}
    >
      <form onSubmit={formik.handleSubmit}>
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
              Drop files to Attach, or
              <span className="text-blue-600 underline"> browse</span>
            </span>
          </span>
          <input
            onChange={handleFileUpload}
            type="file"
            name="file_upload"
            className="hidden"
            accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
        </label>

        <div className="relative   w-full mt-10">
          {graphData.length > 0 && (
            <div className="flex gap-2">
              <div className="mb-4 flex gap-2  items-center">
                <label
                  htmlFor="fromDate"
                  className="block font-medium text-gray-700"
                >
                  From Date
                </label>
                <DatePicker
                  id="fromDate"
                  selected={formik.values.fromDate}
                  onChange={(date) => formik.setFieldValue("fromDate", date)}
                  dateFormat="MM/yyyy"
                  className="w-full px-3 py-2 border rounded-lg"
                  customInput={
                    <CustomInput
                      value={moment(formik.values.fromDate).format("MMMM")}
                    />
                  }
                  showMonthYearPicker
                />
                {/* {formik.touched.fromDate && formik.errors.fromDate ? (
            <div className="text-red-600">{formik.errors.fromDate}</div>
          ) : null} */}
              </div>

              <div className="mb-4 flex gap-2  items-center">
                <label
                  htmlFor="toDate"
                  className="block font-medium text-gray-700"
                >
                  To Date
                </label>
                <DatePicker
                  id="toDate"
                  selected={formik.values.toDate}
                  onChange={(date) => formik.setFieldValue("toDate", date)}
                  dateFormat="MM/yyyy"
                  className="w-full px-3 py-2 border rounded-lg"
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
              <div className="mb-4 flex gap-2  items-center">
                <label
                  htmlFor="fromDistance"
                  className="block font-medium text-gray-700"
                >
                  From Distance
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

              <div className="mb-4 flex gap-2  items-center">
                <label
                  htmlFor="toDistance"
                  className="block font-medium text-gray-700"
                >
                  To Distance
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

              <div className="mb-4 flex gap-2 items-center">
                <label
                  htmlFor="timeRange"
                  className="block font-medium text-gray-700"
                >
                  Time Range
                </label>
                <select
                  value={formik.values.timeRange}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  id="timeRange"
                  name="timeRange"
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring focus:ring-blue-300"
                >
                  <option value="Yearly">Yearly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Daily">Daily</option>
                </select>
              </div>
            </div>
          )}

          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  ID
                </th>
                <th scope="col" className="px-6 py-3">
                  Activity Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Start Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Finish Date
                </th>
                <th scope="col" className="px-6 py-3">
                  Start Chainage
                </th>
                <th scope="col" className="px-6 py-3">
                  Finish Chainage
                </th>
                <th scope="col" className="px-6 py-3">
                  Style
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((data) => (
                <tr
                  key={data.id}
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
                    {new Date(data.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(data.finishDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{data.startChainage}</td>
                  <td className="px-6 py-4">{data.finishChainage}</td>
                  <td className="px-6 py-4">{data.style}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="my-4 flex justify-end ">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500
             text-white rounded-lg
              hover:bg-blue-600
               focus:outline-none focus:ring
                focus:ring-blue-300
                 disabled:bg-gray-600
                "
            disabled={graphData.length === 0}
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
};
