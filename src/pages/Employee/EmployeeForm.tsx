import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import Input from "src/components/Input";
import Checkbox from "src/components/Checkbox";
import { addEmployeeAndUser, editEmployee } from "src/Services/EmployeeService";
import { uniqueId } from "lodash";
import { useUserContext } from "src/context/UserContext";

interface EmployeeFormProps {
  initialValues?: EmployeeData;
  onSubmit: (values: EmployeeData) => void;
  handleClose: () => void;
}

export interface EmployeeData {
  id: string;
  fullName: string;
  email: string;
  password: string;
  canRead: boolean;
  canWrite: boolean;
  userId?: string;
  adminUserId: string;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialValues,
  onSubmit,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required(t("employeeForm.errors.fullName")),
    email: Yup.string()
      .email(t("employeeForm.errors.email"))
      .required(t("employeeForm.errors.email")),
    password: Yup.string().required(t("employeeForm.errors.password")),
    canRead: Yup.boolean().required(t("employeeForm.errors.canRead")),
    canWrite: Yup.boolean().required(t("employeeForm.errors.canWrite")),
  });
  const validationEditSchema = Yup.object().shape({
    fullName: Yup.string().required(t("employeeForm.errors.fullName")),
    email: Yup.string()
      .email(t("employeeForm.errors.email"))
      .required(t("employeeForm.errors.email")),

    canRead: Yup.boolean().required(t("employeeForm.errors.canRead")),
    canWrite: Yup.boolean().required(t("employeeForm.errors.canWrite")),
  });

  const handleSubmitData = async (values: EmployeeData) => {
    handleClose();
    // try {
    //   if (initialValues) {
    //     // If initialValues is provided, it's an edit operation
    //     // You can call your editEmployee function from your EmployeeService
    //     await editEmployee(initialValues.id!, values);
    //   } else {
    //     // If initialValues is not provided, it's an add operation
    //     // You can call your addEmployee function from your EmployeeService
    //     await addEmployeeAndUser(values);
    //   }

    //   // After the edit or add operation is successful, you can close the form
    //   handleClose();
    // } catch (error) {
    //   console.error("Error updating or adding employee: ", error);
    // }
  };
  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-white bg-opacity-20 dark:bg-gray-700 dark:bg-opacity-20">
      <div className="mt-20 max-h-full w-[50%] overflow-y-auto rounded bg-white p-6 shadow-md dark:bg-gray-700">
        <div className="mb-4 text-2xl font-semibold">
          {!!initialValues
            ? t("employeeForm.editEmployee")
            : t("employeeForm.addEmployee")}
        </div>
        <Formik
          initialValues={
            initialValues || {
              id: uniqueId("emp-"),
              fullName: "",
              email: "",
              password: "",
              canRead: false,
              canWrite: false,
              adminUserId: user?.uid!,
            }
          }
          onSubmit={handleSubmitData}
          validationSchema={
            initialValues ? validationEditSchema : validationSchema
          }
        >
          {({ values, errors, handleChange, handleSubmit, isValid }) => (
            <Form>
              <div className="mb-4">
                <Input
                  id="fullName"
                  type="text"
                  name="fullName"
                  label={t("employeeForm.fullName")}
                  onChange={handleChange}
                  value={values.fullName}
                  errors={errors}
                />
              </div>
              <div className="mb-4" hidden={!!initialValues}>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  label={t("employeeForm.email")}
                  onChange={handleChange}
                  value={values.email}
                  errors={errors}
                />
              </div>
              <div className="mb-4" hidden={!!initialValues}>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  label={t("employeeForm.password")}
                  onChange={handleChange}
                  value={values.password}
                  errors={errors}
                />
              </div>
              <div className="grid grid-cols-2 py-10">
                <Checkbox
                  id="canRead"
                  name="canRead"
                  label={t("employeeForm.canRead")}
                  onChange={handleChange}
                  checked={values.canRead}
                  errors={errors}
                />

                <Checkbox
                  id="canWrite"
                  name="canWrite"
                  label={t("employeeForm.canWrite")}
                  onChange={handleChange}
                  checked={values.canWrite}
                  errors={errors}
                />
              </div>

              <div className="flex items-center justify-between">
                <button type="submit" className="button">
                  {t("employeeForm.save")}
                </button>
                <button type="button" onClick={handleClose} className="button">
                  {t("employeeForm.cancel")}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EmployeeForm;
