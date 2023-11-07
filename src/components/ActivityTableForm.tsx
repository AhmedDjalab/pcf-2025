import React, { useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

import { useTranslation } from "react-i18next";

import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { updateActivity, addActivity } from "src/state/slices/graphSlice"; // Replace with your actual slice
import { GraphDataType } from "src/state/slices/graphSlice";
import { RootState } from "src/state";
import Input from "./Input";
import DatePickerDefault from "./DatePicker";
import { LabelButton } from "./Button";
import Dropdown from "./DropDown";

interface ActivityTableFormProps {
  initialValues?: GraphDataType;
  onSubmit: (values: GraphDataType) => void;
  handleClose: () => void;
  minDistance: number;
  maxDistance: number;
}

const ActivityTableForm: React.FC<ActivityTableFormProps> = ({
  initialValues,
  onSubmit,
  handleClose,
  minDistance,
  maxDistance,
}) => {
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const shapesData = useSelector((state: RootState) => state.shapes.shapesData);
  const [selectedShapeId, setSelectedShapeId] = useState("");

  let validationSchema = Yup.object().shape({
    activityName: Yup.string().required("activityForm.errors.activityName"),
    startDate: Yup.date().required("activityForm.errors.startDate"),
    finishDate: Yup.date()
      .min(Yup.ref("startDate"), "activityForm.errors.endDateMin")

      .required("activityForm.errors.endDate"),

    startChainage: Yup.number()
      .required(t("taskSlotsPopUp.errors.required"))
      .min(minDistance, t("taskSlotsPopUp.errors.minDistance", { minDistance }))
      .max(
        maxDistance,
        t("taskSlotsPopUp.errors.maxDistance", { maxDistance })
      ),
    finishChainage: Yup.number()
      .required(t("taskSlotsPopUp.errors.required"))
      .min(minDistance, t("taskSlotsPopUp.errors.minDistance", { minDistance }))
      .max(maxDistance, t("taskSlotsPopUp.errors.maxDistance", { maxDistance }))
      .test(
        "is-greater-than-start",
        t("taskSlotsPopUp.errors.greaterThanStart"),
        function (finishChainage) {
          const start = this.parent.startChainage;
          return finishChainage > start;
        }
      ),
    style: Yup.string().required("activityForm.errors.activityStyle"),
  });

  const handleSubmitData = (
    values: GraphDataType,
    validateForm?: FormikHelpers<GraphDataType>
  ) => {
    const selectedShapeId =
      shapesData.find((x) => x.name === values.style)?.id ?? "0";

    if (!!initialValues) {
      dispatch(
        updateActivity({
          activity: values,
          shapeId: selectedShapeId,
        })
      );
    } else {
      dispatch(addActivity({ activity: values, shapeId: selectedShapeId }));
    }
    handleClose();
  };

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-white bg-opacity-20 dark:bg-gray-700 dark:bg-opacity-20">
      <div className=" mt-20 max-h-full  w-[50%]  text-boxdark dark:text-white overflow-y-auto rounded bg-white p-6 shadow-md dark:bg-gray-700">
        <div className="mb-4 text-2xl font-semibold">
          {!!initialValues
            ? t("activityForm.editActivity")
            : t("activityForm.addActivity")}
        </div>
        {/* @ts-ignore */}
        <Formik
          initialValues={
            initialValues || {
              activityName: "",
              startDate: new Date().toISOString(),
              finishDate: new Date().toISOString(),
              startChainage: 0,
              finishChainage: 0,
              style: "",
              id: "",
              styleId: "",
            }
          }
          onSubmit={handleSubmitData}
          validationSchema={validationSchema}
        >
          {({ values, errors, handleChange, handleSubmit, isValid }) => (
            <Form>
              <div className="mb-4">
                <Input
                  id="activityName"
                  type="text"
                  name="activityName"
                  label={t("activityForm.activityName")}
                  onChange={handleChange}
                  value={values.activityName}
                  errors={errors}
                />
              </div>
              <div className="group relative   mb-6 w-full">
                {/* <Input
                  id="startDate"
                  type="date"
                  name="startDate"
                  label={t("activityForm.startDate")}
                  onChange={handleChange}
                  value={values.startDate}
                  errors={errors.startDate}
                /> */}
                <DatePickerDefault
                  id="startDate"
                  name="startDate"
                  label={t("activityForm.startDate")}
                  value={new Date(values.startDate)}
                  defaultDate={new Date(values.startDate)}
                  onChange={(date: Date) => {
                    handleChange({
                      target: {
                        name: "startDate",
                        value: date.toISOString(),
                      },
                    });
                  }}
                  errors={errors.startDate as string}
                />
              </div>
              <div className="group relative   mb-6 w-full">
                {/* <DefaultInput
                  id="finishDate"
                  type="date"
                  name="finishDate"
                  label={t("activityForm.endDate")}
                  onChange={handleChange}
                  value={values.finishDate}
                  errors={errors.finishDate}
                /> */}
                <DatePickerDefault
                  id="finishDate"
                  name="finishDate"
                  label={t("activityForm.endDate")}
                  value={new Date(values.finishDate)}
                  defaultDate={new Date(values.finishDate)}
                  onChange={(date: Date) => {
                    handleChange({
                      target: {
                        name: "finishDate",
                        value: date.toISOString(),
                      },
                    });
                  }}
                  errors={errors.finishDate as string}
                />
              </div>
              <div className="mb-4">
                <Input
                  id="startChainage"
                  type="number"
                  name="startChainage"
                  label={t("activityForm.startPk")}
                  onChange={handleChange}
                  value={values.startChainage}
                  errors={errors}
                />
              </div>

              <div className="mb-4">
                <Input
                  id="finishChainage"
                  type="number"
                  name="finishChainage"
                  label={t("activityForm.endPk")}
                  onChange={handleChange}
                  value={values.finishChainage}
                  errors={errors}
                />
              </div>
              <div className="mb-4">
                {shapesData.length > 0 ? (
                  <Dropdown
                    id="style"
                    name="style"
                    label={t("activityForm.activityStyle")}
                    onChange={(data) => {
                      handleChange({
                        target: {
                          name: "style",
                          value: data.target.value,
                        },
                      });
                    }}
                    value={values.style}
                    error={errors.style as string}
                    optionValue="name"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    options={shapesData ?? []}
                  />
                ) : (
                  <Input
                    id="style"
                    type="text"
                    name="style"
                    label={t("activityForm.activityStyle")}
                    onChange={handleChange}
                    value={values.style}
                    errors={errors}
                  />
                )}
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  //   disabled={!isValid}
                  className="  mb-2 mr-2 rounded-lg border border-primary-700 px-5 py-2.5 text-center text-sm font-medium text-primary-700 hover:bg-primary-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-primary-300 dark:border-primary-500 dark:text-primary-500 dark:hover:bg-primary-600 dark:hover:text-white dark:focus:ring-primary-800 "
                >
                  {t("activityForm.save")}
                </button>

                <LabelButton type="button" onClick={handleClose}>
                  {t("activityForm.cancel")}
                </LabelButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ActivityTableForm;
