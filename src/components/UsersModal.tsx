import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import React, { useEffect, useMemo, useState } from "react";
import { getEmployees } from "src/Services/EmployeeService2";
import { useAuth } from "src/context/UserContext";
import Spinner from "./Spinner";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { LabelButton } from "./shared/Button";
import {
  ProjectEmployeesType,
  saveProjectEmployees,
} from "src/Services/ProjectEmployeesService";
interface Options {
  label: string;
  value: string;
}
interface UsersModalProps {
  employeesIds: string[];
  isOpen: boolean;
  handleClose: () => void;
  projectId: string;
}

const UsersModal = ({
  employeesIds,
  isOpen,
  handleClose,
  projectId,
}: UsersModalProps) => {
  const { user, canWrite, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [selectedEmployees, setSelectedEmployees] = useState<Options[]>([]);

  const {
    data: employeeData,
    isLoading: employeeLoading,
    refetch: refetchEmployee,
    isSuccess,
  } = useQuery({
    queryKey: ["employees", user?.id],
    queryFn: () =>
      getEmployees({
        fromvalue: 0,
        takevalue: 0,
        userAdminId: user?.id,
        search: "",
      }),

    refetchOnWindowFocus: false,
    staleTime: 10000,
  });
  //   const selectedEmployeesData = useMemo(() => {
  //     if (employeeData === undefined) {
  //       return [];
  //     }
  //     return (
  //       employeesIds?.map((x) => {
  //         return {
  //           label: employeeData.employees.find((e) => e.id === x)?.email ?? "",
  //           value: x,
  //         };
  //       }) ?? []
  //     );
  //   }, [employeeData, employeesIds]);

  useEffect(() => {
    let selectedEmployeesData: Options[] = [];

    if (isSuccess && employeeData?.employees) {
      selectedEmployeesData =
        employeesIds.map((x) => ({
          label: employeeData.employees.find((e) => e.id === x)?.email ?? "",
          value: x,
        })) ?? [];

      setSelectedEmployees((prv) => (prv = selectedEmployeesData));
    }
  }, [employeeData, employeeData?.employees, employeesIds, isSuccess]);

  const handleSave = async () => {
    var projectEmplyees: ProjectEmployeesType = {
      employeesId: selectedEmployees.map((x) => x.value),
      projectId: projectId,
    };

    const data = await saveProjectEmployees(projectEmplyees);

    if (data) {
      handleClose();
    }
  };

  return (
    <div className="fixed left-0 top-0 z-50 flex  w-full items-center justify-center bg-white bg-opacity-20 dark:bg-gray-700 dark:bg-opacity-20">
      <div className=" mt-20  w-[50%]  text-boxdark dark:text-white overflow-y-auto rounded bg-white p-6 shadow-md dark:bg-gray-700">
        <div className="mb-4 text-2xl font-semibold">{t("header.users")}</div>

        <div className="group relative z-0 mb-6 w-full">
          {employeeLoading ? (
            <Spinner />
          ) : (
            <Select
              id="employees"
              name="employees"
              isDisabled={!canWrite && !isAdmin}
              classNames={{
                control: () => `block w-full rounded-lg border
          border-gray-300   text-sm
           text-gray-900 focus:border-blue-500
            focus:ring-blue-500 dark:border-gray-600
             dark:bg-gray-700 dark:text-white
              dark:placeholder-gray-400
               dark:focus:border-blue-500
                dark:focus:ring-blue-500 
                font-bold text-lg dark:text-white
                `,
                menu: () => "bg-white dark:bg-gray-700",
              }}
              options={
                employeeData?.employees.map((employee) => ({
                  value: employee.id!,
                  label: employee.email,
                })) ?? []
              }
              isMulti
              value={selectedEmployees}
              onChange={(selectedOptions: any, { action }: any) => {
                if (action === "select-option" || action === "remove-value") {
                  setSelectedEmployees(selectedOptions as Options[]);
                  // formik.setFieldValue(
                  //   "employees",
                  //   (selectedOptions as Options[]).map((option) => option.value)
                  // );
                }
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <LabelButton type="button" onClick={handleClose}>
            {t("activityForm.cancel")}
          </LabelButton>
          <button
            type="button"
            onClick={handleSave}
            className="  mb-2 mr-2 rounded-lg border border-primary-700 px-5 py-2.5 text-center text-sm font-medium text-primary-700 hover:bg-primary-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-primary-300 dark:border-primary-500 dark:text-primary-500 dark:hover:bg-primary-600 dark:hover:text-white dark:focus:ring-primary-800 "
          >
            {t("activityForm.save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersModal;
