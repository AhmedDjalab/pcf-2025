import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { RootState } from "../state";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import ImagePicker from "./ImagePicker"; // Assuming you have this component for handling images

interface PlansPopUpProps {
  isNew: boolean;
  editRow: {
    name: string;
    startPk: number;
    endPk: number;
    planImageId?: string;
    planImageUrl?: string;
    id?: string;
    idnew: string;
  } | null;
  closeModal: () => void;
  handleAddPlan: (values: any) => void;
  handleEditPlan: (values: any) => void;
}

const PlansPopUp: React.FC<PlansPopUpProps> = ({
  isNew,
  editRow,
  closeModal,
  handleAddPlan,
  handleEditPlan,
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | undefined>(
    isNew ? "" : editRow!.planImageUrl
  );
  console.log("🚀 ~ selectedImage:", selectedImage, editRow);
  const minDistance: number = useSelector(
    (state: RootState) => state.graph.settings.fromDistance
  );
  const maxDistance: number = useSelector(
    (state: RootState) => state.graph.settings.toDistance
  );

  const initialValues = {
    name: isNew ? "" : editRow!.name,
    startPk: isNew ? "" : editRow!.startPk,
    endPk: isNew ? "" : editRow!.endPk,
    idnew: isNew ? "" : editRow!.idnew,
    id: isNew ? "" : editRow!.id,
    planImageUrl: isNew ? "" : editRow!.planImageUrl,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t("plansPopUp.errors.required")),
    // planImageId: Yup.string().required(t("plansPopUp.errors.required")),
    startPk: Yup.number()
      .required(t("plansPopUp.errors.required"))
      .min(minDistance, t("plansPopUp.errors.minDistance", { minDistance }))
      .max(maxDistance, t("plansPopUp.errors.maxDistance", { maxDistance })),
    endPk: Yup.number()
      .required(t("plansPopUp.errors.required"))
      .min(minDistance, t("plansPopUp.errors.minDistance", { minDistance }))
      .max(maxDistance, t("plansPopUp.errors.maxDistance", { maxDistance }))
      .test(
        "is-greater-than-start",
        t("plansPopUp.errors.greaterThanStart"),
        function (endPk) {
          const start = this.parent.startPk;
          return endPk > start;
        }
      ),
  });

  const onSubmit = (values: any) => {
    const formData = {
      ...values,
      planImageUrl: selectedImage,
    };

    if (isNew) {
      handleAddPlan(formData);
    } else {
      handleEditPlan({ ...formData, id: editRow!.idnew });
    }

    closeModal();
  };

  const handleImageChange = (img: string | null) => {
    if (img) {
      setSelectedImage(img);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-white bg-opacity-80 dark:bg-gray-700 dark:bg-opacity-20">
      <div className="bg-white p-6 rounded shadow-md w-96 dark:bg-gray-700 ">
        <div className="text-2xl font-semibold mb-4 dark:bg-gray-700 dark:text-white">
          {isNew ? t("plansPopUp.titles.add") : t("plansPopUp.titles.edit")}
        </div>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          enableReinitialize={true}
        >
          {({
            values,
            errors,
            handleChange,
            handleSubmit,
            resetForm,
            isValid,
          }) => (
            console.log("🚀 ~ errors:", values.planImageUrl),
            (
              <Form>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2  dark:text-white">
                    {t("plansPopUp.labels.name")}
                  </label>
                  <Field
                    type="text"
                    name="name"
                    placeholder={t("plansPopUp.placeholders.name")}
                    className={`border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded p-2 w-full block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500`}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 mt-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2  dark:text-white">
                    {t("plansPopUp.labels.start")}
                  </label>
                  <Field
                    type="number"
                    name="startPk"
                    placeholder={t("plansPopUp.placeholders.start")}
                    className={`border ${
                      errors.startPk ? "border-red-500" : "border-gray-300"
                    } rounded p-2 w-full block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500`}
                  />
                  <ErrorMessage
                    name="start"
                    component="div"
                    className="text-red-500 mt-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2  dark:text-white">
                    {t("plansPopUp.labels.end")}
                  </label>
                  <Field
                    type="number"
                    name="endPk"
                    placeholder={t("plansPopUp.placeholders.end")}
                    className={`border ${
                      errors.endPk ? "border-red-500" : "border-gray-300"
                    } rounded p-2 w-full block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500`}
                  />
                  <ErrorMessage
                    name="end"
                    component="div"
                    className="text-red-500 mt-2"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="planImage"
                    className="block text-gray-700 text-sm font-bold mb-2 dark:text-white"
                  >
                    {t("plansPopUp.labels.planImage")}
                  </label>
                  <ImagePicker
                    keyRef="planImageId"
                    onChange={handleImageChange}
                    imageValue={selectedImage}
                    setFileName={(fileName) => console.log(fileName)}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!isValid}
                    className="bg-blue-500 text-white rounded px-4 py-2 mr-2 hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                  >
                    {isNew
                      ? t("plansPopUp.buttons.add")
                      : t("plansPopUp.buttons.save")}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 text-gray-600 rounded px-4 py-2 hover:bg-gray-400 focus:outline-none focus:ring focus:ring-gray-300"
                  >
                    {t("plansPopUp.buttons.cancel")}
                  </button>
                </div>
              </Form>
            )
          )}
        </Formik>
      </div>
    </div>
  );
};

export default PlansPopUp;
