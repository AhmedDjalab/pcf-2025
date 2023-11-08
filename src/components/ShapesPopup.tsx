import React, { useState } from "react";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";

import { useTranslation } from "react-i18next";

import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import {
  updateActivity,
  addActivity,
  ShapeType,
  updateStyleShape,
} from "src/state/slices/graphSlice"; // Replace with your actual slice
import { GraphDataType } from "src/state/slices/graphSlice";
import { RootState } from "src/state";
import Input from "./Input";
import DatePickerDefault from "./DatePicker";
import { LabelButton } from "./Button";
import Dropdown from "./DropDown";
import { lineStyles } from "src/const/linesArray";
import LineStylePicker from "./LineStylePicker";
import TexturePicker from "./TexturePicker";
import texturesData from "src/const/texturesArray";
import { PopoverColorPicker } from "./PopoverColorPicker";
import { uniqueId } from "lodash";
const shapeTypes = [
  { value: "line", text: "Ligne" },
  { value: "rect", text: "Rectangle" },
  { value: "triangle", text: "Triangle" },
];
interface StyleFormProps {
  id: string;
  onSubmit: (values: GraphDataType) => void;
  handleClose: () => void;
  minDistance: number;
  maxDistance: number;
}

const StyleForm: React.FC<StyleFormProps> = ({
  id,
  onSubmit,
  handleClose,
  minDistance,
  maxDistance,
}) => {
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const [isOpen, toggle] = useState(false);

  const shapesData = useSelector((state: RootState) => state.shapes.shapesData);
  const [initialValues, setInitialValues] = useState(
    shapesData.find((x) => x.name === id)!
  );
  console.error("this is name ", id, shapesData.find((x) => x.name === id)!);

  // const [color, setColor] = useState(
  //   shapesData.find((x) => x.name == id)!.color
  // );

  //   let validationSchema = Yup.object().shape({
  //     activityName: Yup.string().required("activityForm.errors.activityName"),
  //     startDate: Yup.date().required("activityForm.errors.startDate"),
  //     finishDate: Yup.date()
  //       .min(Yup.ref("startDate"), "activityForm.errors.endDateMin")

  //       .required("activityForm.errors.endDate"),

  //     startChainage: Yup.number()
  //       .required(t("taskSlotsPopUp.errors.required"))
  //       .min(minDistance, t("taskSlotsPopUp.errors.minDistance", { minDistance }))
  //       .max(
  //         maxDistance,
  //         t("taskSlotsPopUp.errors.maxDistance", { maxDistance })
  //       ),
  //     finishChainage: Yup.number()
  //       .required(t("taskSlotsPopUp.errors.required"))
  //       .min(minDistance, t("taskSlotsPopUp.errors.minDistance", { minDistance }))
  //       .max(maxDistance, t("taskSlotsPopUp.errors.maxDistance", { maxDistance }))
  //       .test(
  //         "is-greater-than-start",
  //         t("taskSlotsPopUp.errors.greaterThanStart"),
  //         function (finishChainage) {
  //           const start = this.parent.startChainage;
  //           return finishChainage > start;
  //         }
  //       ),
  //     style: Yup.string().required("activityForm.errors.activityStyle"),
  //   });

  const handleSubmitData = (values: ShapeType, validateForm?: any) => {
    if (!!initialValues) {
      dispatch(
        updateStyleShape({
          style: values,
        })
      );

      handleClose();
    }
  };

  return (
    <div className="fixed left-0 top-0 z-50 flex  w-full h-full  items-center justify-center bg-white bg-opacity-20 dark:bg-gray-700 dark:bg-opacity-20">
      <div className="  max-h-full w-[60%] md:w-[30%] overflow-y-auto rounded bg-white p-6 shadow-md dark:bg-gray-700">
        <div className="mb-4 text-2xl font-semibold">
          {!!initialValues ? "Edit Style" : "Add Style"}
        </div>
        {/* @ts-ignore */}
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmitData}
          enableReinitialize={true}
        >
          {({
            values,
            errors,
            handleChange,
            setFieldValue,
            handleSubmit,
            isValid,
          }) => (
            <Form>
              <div className="mb-2">
                <Input
                  id="name"
                  type="text"
                  name="name"
                  label="Name"
                  onChange={handleChange}
                  value={values.name}
                  errors={errors}
                />
              </div>
              <div className="mb-4 relative ">
                <label
                  htmlFor={"type"}
                  className={`
        mb-4 block  text-sm font-medium text-gray-900 dark:text-white  
        `}
                >
                  {t("shapesForm.headers.formatStyle")}
                </label>
                <select
                  className=" w-full self-center  block  rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  id="type"
                  name="type"
                  value={values.type}
                  onChange={handleChange}
                >
                  {shapeTypes.map(({ value, text }) => (
                    <option key={value} value={value}>
                      {/* @ts-ignore */}
                      {t(`shapesForm.${text}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="group relative  mb-6 w-full">
                <LineStylePicker
                  id="lineType"
                  startOffset={35}
                  label={t("shapesForm.headers.lineType")}
                  width={300}
                  rowId={values.id}
                  color={values.color}
                  lineStyles={lineStyles}
                  onSelectLineStyle={(lineId: string) => {
                    setFieldValue("lineType", lineId);
                  }}
                  selectedLineStyle={
                    lineStyles.find((x: any) => x.id === values.lineType)! ??
                    lineStyles[0]
                  }
                />
              </div>
              <div className="group relative   mb-6 w-full">
                <TexturePicker
                  id="backgroundTexture"
                  label={t("shapesForm.headers.rectangleTriangleType")}
                  rowId={values.id + uniqueId()}
                  color={values.color}
                  width={280}
                  texturetype={
                    texturesData.find(
                      (x) => x.id === values.backgroundTexture
                    )! ?? texturesData[0]
                  }
                  onSelectTexture={(textureId: string) => {
                    setFieldValue("backgroundTexture", textureId);
                  }}
                />
              </div>
              <div className="mb-4 w-full ">
                <PopoverColorPicker
                  id="color"
                  classname="ml-10 w-70"
                  label={t("shapesForm.headers.color")}
                  isOpen={isOpen}
                  toggle={toggle}
                  color={values.color}
                  onChangeComplete={(color: string) => {
                    setFieldValue("color", color);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  //   disabled={!isValid}
                  className="  mb-4 mr-2 rounded-lg border border-primary-700 px-5 py-2.5 text-center text-sm font-medium text-primary-700 hover:bg-primary-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-primary-300 dark:border-primary-500 dark:text-primary-500 dark:hover:bg-primary-600 dark:hover:text-white dark:focus:ring-primary-800 "
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

export default StyleForm;
