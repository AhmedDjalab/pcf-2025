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
  console.log("this is name ", id);
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();

  const shapesData = useSelector((state: RootState) => state.shapes.shapesData);

  const [initialValues, setInitialValues] = useState(
    shapesData.find((x) => x.name == id)!
  );

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

  const handleSubmitData = (
    values: ShapeType,
    validateForm?: FormikHelpers<ShapeType>
  ) => {
    // const selectedShapeId =
    //   shapesData.find((x) => x.name === values.style)?.id ?? "0";
    // if (!!initialValues) {
    //   dispatch(
    //     updateActivity({
    //       activity: values,
    //       shapeId: selectedShapeId,
    //     })
    //   );
    // } else {
    //   dispatch(addActivity({ activity: values, shapeId: selectedShapeId }));
    // }
    // handleClose();
  };
  const [isOpen, toggle] = useState(false);

  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-white bg-opacity-20 dark:bg-gray-700 dark:bg-opacity-20">
      <div className=" mt-20 max-h-full  w-[50%] overflow-y-auto rounded bg-white p-6 shadow-md dark:bg-gray-700">
        <div className="mb-4 text-2xl font-semibold">
          {!!initialValues
            ? t("activityForm.editActivity")
            : t("activityForm.addActivity")}
        </div>
        {/* @ts-ignore */}
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmitData}
          enableReinitialize={true}
        >
          {({ values, errors, handleChange, handleSubmit, isValid }) => (
            <Form>
              <div className="mb-4">
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
              <div className="group relative   mb-6 w-full">
                <LineStylePicker
                  rowId={values.id}
                  color={values.color}
                  lineStyles={lineStyles}
                  onSelectLineStyle={handleChange}
                  selectedLineStyle={
                    lineStyles.find((x: any) => x.id === values.lineType)! ??
                    lineStyles[0]
                  }
                />
              </div>
              <div className="group relative   mb-6 w-full">
                <TexturePicker
                  rowId={values.id}
                  color={values.color}
                  texturetype={
                    texturesData.find((x) => x.id === values.backgroundTexture)!
                  }
                  onSelectTexture={handleChange}
                />
              </div>
              <div className="mb-4 w-full ">
                <PopoverColorPicker
                  isOpen={isOpen}
                  toggle={toggle}
                  color={values.color}
                  onChangeComplete={handleChange}
                />
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

export default StyleForm;
