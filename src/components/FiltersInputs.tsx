import { dispatch } from "d3";
import { useFormik } from "formik";
import React, { forwardRef, useEffect, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/state";
import {
  applyFilter,
  fetchActivities,
  saveSettings,
  updateGraphSettingsValue,
} from "src/state/slices/graphSlice";
import { FormValues } from "./ImportFileForm";
import * as Yup from "yup";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { useAuth } from "src/context/UserContext";
import DatePicker from "react-datepicker";
import { useParams } from "react-router-dom";

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

const CustomInput = forwardRef<HTMLInputElement, any>(
  (
    { value, onClick, onChange, disabled }: any,
    ref: React.Ref<HTMLInputElement>
  ) => (
    <input
      type="text"
      ref={ref}
      value={value}
      onClick={onClick}
      onChange={onChange}
      disabled={disabled}
      className="block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
    />
  )
);

const initForm: FormValues = {
  fromDate: new Date(currentYear, 0, 1), // Month 0 is January
  toDate: new Date(nextYear, 11, 31),
  graphData: [],
  fromDistance: "10000",
  toDistance: "20000",
  timeRange: "Yearly",
  distanceRange: 200,
};
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
function FiltersInputs() {
  const { id } = useParams();

  const { canWrite, isAdmin } = useAuth();
  const editForm = id !== null && id !== "" && id !== undefined;
  const graphSettings = useSelector((state: RootState) => state.graph.settings);
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const { t } = useTranslation();
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
      if (editForm) {
        dispatch(
          fetchActivities({
            projectId: id,
            filter: {
              fromDate: values.fromDate,
              toDate: values.toDate,
              fromDistance: parseFloat(values.fromDistance),
              toDistance: parseFloat(values.toDistance),
              timeRange: values.timeRange,
              distanceRange: values.distanceRange,
            },
          })
        );
      }
    },
  });

  useEffect(() => {
    console.warn(
      "🚀 ~ file: FiltersInputs.tsx:101 ~ useEffect ~ editForm:",
      editForm
    );

    if (!editForm) {
      dispatch(
        applyFilter({
          filters: {
            fromDate: formik.values.fromDate.toISOString(),
            toDate: formik.values.toDate.toISOString(),
            fromDistance: parseFloat(formik.values.fromDistance),
            toDistance: parseFloat(formik.values.toDistance),
            timeRange: formik.values.timeRange,
            distanceRange: formik.values.distanceRange,
          },
        })
      );
    } else {
      console.log("thi is dates", formik.values);
      // dispatch(
      //   saveSettings({
      //     filters: {
      //       fromDate: formik.values.fromDate.toISOString(),
      //       toDate: formik.values.toDate.toISOString(),
      //       fromDistance: parseFloat(formik.values.fromDistance),
      //       toDistance: parseFloat(formik.values.toDistance),
      //       timeRange: formik.values.timeRange,
      //       distanceRange: formik.values.distanceRange,
      //     },
      //   })
      // );
      // const timeoutId = setTimeout(() => {
      //   dispatch(
      //     fetchActivities({
      //       projectId: id,
      //       filter: {
      //         fromDate: formik.values.fromDate,
      //         toDate: formik.values.toDate,
      //         fromDistance: parseFloat(formik.values.fromDistance),
      //         toDistance: parseFloat(formik.values.toDistance),
      //         timeRange: formik.values.timeRange,
      //         distanceRange: formik.values.distanceRange,
      //       },
      //     })
      //   );
      // }, 1000); // Adjust the delay as needed (e.g., 500 milliseconds)

      // return () => {
      //   clearTimeout(timeoutId);
      // };
    }
  }, [
    dispatch,
    editForm,
    formik.values,

    formik.values.fromDate,
    formik.values.fromDistance,
    formik.values.timeRange,
    formik.values.toDate,
    formik.values.toDistance,
    id,
  ]);

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-3 gap-2 justify-center">
          <div className="mb-4">
            <label
              htmlFor="fromDate"
              className="block font-medium text-gray-700 dark:text-white"
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
                  value={moment(formik.values.fromDate).format("MMMM")}
                  disabled={!canWrite && !isAdmin}
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
              className="block font-medium text-gray-700 dark:text-white"
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
                  disabled={!canWrite && !isAdmin}
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
              className="block font-medium text-gray-700 dark:text-white"
            >
              {t("importFileForm.timeScale")}
            </label>
            <select
              value={formik.values.timeRange}
              onChange={formik.handleChange}
              id="timeRange"
              name="timeRange"
              disabled={!canWrite && !isAdmin}
              className="block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            >
              <option value="Yearly">{t("importFileForm.yearlyOption")}</option>
              <option value="Monthly">
                {t("importFileForm.monthlyOption")}
              </option>
              <option value="Weekly">{t("importFileForm.weeklyOption")}</option>
              <option value="Daily">{t("importFileForm.dailyOption")}</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="fromDistance"
              className="block font-medium text-gray-700 dark:text-white"
            >
              {t("importFileForm.startPk")}
            </label>
            <input
              id="fromDistance"
              name="fromDistance"
              type="number"
              disabled={!canWrite && !isAdmin}
              value={formik.values.fromDistance}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            {formik.touched.fromDistance && formik.errors.fromDistance && (
              <div className="text-red-600">{formik.errors.fromDistance}</div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="toDistance"
              className="block font-medium text-gray-700 dark:text-white"
            >
              {t("importFileForm.endPk")}
            </label>
            <input
              id="toDistance"
              name="toDistance"
              disabled={!canWrite && !isAdmin}
              type="number"
              value={formik.values.toDistance}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            />
            {formik.touched.toDistance && formik.errors.toDistance && (
              <div className="text-red-600">{formik.errors.toDistance}</div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="distanceRange"
              className="block font-medium text-gray-700 dark:text-white"
            >
              {t("importFileForm.distanceRange")}
            </label>
            <div className="flex gap-2">
              <input
                id="distanceRange"
                name="distanceRange"
                disabled={!canWrite && !isAdmin}
                type="number"
                value={formik.values.distanceRange}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={` ${
                  editForm ? "w-[50%]" : "w-full"
                } block  rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500`}
              />
              {formik.touched.distanceRange && formik.errors.distanceRange && (
                <div className="text-red-600">
                  {formik.errors.distanceRange}
                </div>
              )}
              {editForm && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 focus:outline-none focus:ring focus:ring-violet-300 disabled:bg-gray-600"
                >
                  {t("importFileForm.SaveFilter")}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default FiltersInputs;
