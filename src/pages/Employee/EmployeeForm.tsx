import React from "react";
import { Formik, Form, Field, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import Input from "src/components/Input";
import Checkbox from "src/components/Checkbox";
import { saveEmployee } from "src/Services/EmployeeService2";
import { uniqueId } from "lodash";
import { useAuth } from "src/context/UserContext";
import { LabelButton } from "src/components/shared/Button";
import { Employee } from "src/Services/EmployeeService2";
import { getCompanyId } from "src/Services/AuthService";

interface EmployeeFormProps {
  initialValues?: Employee;
  onSubmit: () => void;
  handleClose: () => void;
}

export interface EmployeeData {
  id?: string;
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
  const { user } = useAuth();

  const validationSchema = Yup.object().shape({
    fullName: Yup.string()
      .required(t("employeeForm.errors.fullName"))
      .matches(
        /^[\w']+ [\w']+$/,
        t("employeeForm.errors.fullNameMustTwoString")
      ),

    email: Yup.string()
      .email(t("employeeForm.errors.email"))
      .required(t("employeeForm.errors.email")),
    password: Yup.string()
      .required("validationMessages.passwordRequired")
      .min(8, "validationMessages.passwordMinLength")
      .matches(/[A-Z]/, "validationMessages.passwordCapitalLetters")
      .matches(/[a-z]/, "validationMessages.passwordLowercaseLetters")
      .matches(/\d/, "validationMessages.passwordDigits")
      .matches(
        /[\[\]!"!@$%^&*(){}:;<>,.?/+_=|'~\\-]/,
        "validationMessages.passwordSpecialCharacters"
      )
      .matches(/^[^£# “”]*$/, "validationMessages.passwordNoInvalidCharacters"),
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

  const handleSubmitData = async (values: Employee) => {
    try {
      var companyId = getCompanyId();

      const employee: Employee = {
        ...values,
        userAdminId: user?.id!,
        //@ts-ignore
        companyId: companyId,
      };
      // If initialValues is not provided, it's an add operation
      // You can call your addEmployee function from your EmployeeService
      await saveEmployee(employee);

      // After the edit or add operation is successful, you can close the form
      onSubmit();
    } catch (error) {}
  };
  return (
    <div className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-white bg-opacity-20 dark:bg-gray-700 dark:bg-opacity-20">
      <div className="mt-20 max-h-full w-[50%] overflow-y-auto rounded bg-white p-6 shadow-md dark:bg-gray-700">
        <div className="mb-4 text-2xl font-semibold dark:text-white">
          {!!initialValues
            ? t("employeeForm.editEmployee")
            : t("employeeForm.addEmployee")}
        </div>
        <Formik
          initialValues={
            initialValues || {
              fullName: "",
              email: "",
              password: "",
              canRead: false,
              canWrite: false,
              userAdminId: user?.id!,
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
                <button
                  type="submit"
                  className="  mb-2 mr-2 rounded-lg border border-primary-700 px-5 py-2.5 text-center text-sm font-medium text-primary-700 hover:bg-primary-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-primary-300 dark:border-primary-500 dark:text-primary-500 dark:hover:bg-primary-600 dark:hover:text-white dark:focus:ring-primary-800 "
                >
                  {t("employeeForm.save")}
                </button>
                <LabelButton
                  type="button"
                  onClick={handleClose}
                  className="button"
                >
                  {t("employeeForm.cancel")}
                </LabelButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EmployeeForm;
