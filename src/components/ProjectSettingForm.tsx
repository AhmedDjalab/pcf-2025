import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ProjectSettings,
  fetchEmployees,
  updateProjectSettingsValue,
} from "src/state/slices/graphSlice";
import { RootState } from "src/state";
import { MultiStepFormProps } from "./DrawGraphForm";
import ImagePicker from "./ImagePicker";
import { ProjectFileType, ProjectFiletypeOptions } from "src/const/vars";
import { EmployeeData } from "src/pages/Employee/EmployeeForm";
import {
  Employee,
  EmployeesResponse,
  getEmployees,
} from "src/Services/EmployeeService2";
import Select from "react-select";
import { useAuth } from "src/context/UserContext";
import Spinner from "./Spinner";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import { base64ToFile } from "src/Helpers/utils";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { siteName } from "src/variables/Urls";

interface Options {
  label: string;
  value: string;
}
const ProjectSettingForm = ({ setCurrentStep }: MultiStepFormProps) => {
  const [projectTitle, setProjectTitle] = useState("");

  const [fileName, setFileName] = useState("");

  const [projectFileType, setProjectFileType] = useState(ProjectFileType.XLSX); // Set a default value
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const { t } = useTranslation();

  const { user, canWrite, isAdmin } = useAuth();

  const projectSettings = useSelector(
    (state: RootState) => state.projectSettings
  );
  // const [employees, setEmployees] = useState<Employee[]>(
  //   projectSettings.employees ?? []
  // );
  const isDevelopment = process.env.REACT_APP_ENV === "development";
  // const url = useMemo(
  //   () =>
  //     projectSettings.logoImg
  //       ? isDevelopment
  //         ? siteName + projectSettings.logoImg
  //         : projectSettings.logoImg
  //       : "",
  //   [projectSettings.logoImg, isDevelopment]
  // );
  const [selectedImage, setSelectedImage] = useState(
    projectSettings.logoImg ?? ""
  );
  const [selectedEmployees, setSelectedEmployees] = useState<Options[]>([]);

  const loading = useSelector((state: RootState) => state.loading);
  const queryClient = new QueryClient();
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
    staleTime: 6000,
    enabled: !!user?.id,
  });
  const selectedEmployeesData = useMemo(() => {
    if (employeeData === undefined) {
      return [];
    }
    return (
      projectSettings.employeesId?.map((x) => {
        return {
          label: employeeData.employees.find((e) => e.id === x)!.email,
          value: x,
        };
      }) ?? []
    );
  }, [employeeData, projectSettings.employeesId]);
  useEffect(() => {
    if (isSuccess && employeeData) {
      setSelectedEmployees(selectedEmployeesData);
    }
  }, [employeeData, isSuccess, selectedEmployeesData]);

  useEffect(() => {
    if (projectSettings) {
      setProjectTitle(projectSettings.title || "");
      setSelectedImage(projectSettings.logoImg || "");
    }
  }, [projectSettings]);

  const handleImageChange = (img: string | null) => {
    if (img) {
      setSelectedImage(img);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectTitle(e.target.value);
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProjectFileType(Number(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const projectSetting: ProjectSettings = {
      title: projectTitle,
      logoImg: selectedImage,
      fileType: ProjectFiletypeOptions.find(
        (option) => option.id === projectFileType
      )?.id!,
      employeesId: selectedEmployees.map((x) => x.value),
      file: selectedImage,
      fileName: fileName,
    };
    dispatch(updateProjectSettingsValue({ projectSettings: projectSetting }));
    setCurrentStep((step) => step + 1);
  };

  return (
    <div className=" mx-auto w-full mt-10 relative h-screen">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="mb-4">
          <label
            htmlFor="projectTitle"
            className="block text-gray-700 text-sm font-bold mb-2 dark:text-white"
          >
            {t("projectForm.title")}
          </label>
          <input
            type="text"
            id="projectTitle"
            name="projectTitle"
            value={projectTitle}
            onChange={handleTitleChange}
            className="block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            required
            disabled={!canWrite && !isAdmin}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="projectImage"
            className="block text-gray-700 text-sm font-bold mb-2  dark:text-white"
          >
            {t("projectForm.logo")}
          </label>
          <ImagePicker
            onChange={handleImageChange}
            imageValue={selectedImage}
            setFileName={(fileName) => setFileName(fileName)}
            disabled={!canWrite && !isAdmin}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="projectFileType"
            className="block text-gray-700 text-sm font-bold mb-2 dark:text-white "
          >
            {t("projectForm.fileType")}
          </label>
          <select
            id="projectFileType"
            name="projectFileType"
            value={projectFileType}
            disabled={!canWrite && !isAdmin}
            onChange={handleFileTypeChange}
            className="block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          >
            {ProjectFiletypeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {t(`projectFileTypes.${option.name}`)}
              </option>
            ))}
          </select>
        </div>
        {/* Multi-Select for Employees */}
        <div className="group relative z-0 mb-6 w-full">
          <label
            htmlFor="employees"
            className={`mb-2 block text-sm font-medium 
                    
                       text-gray-900 dark:text-white
                  `}
          >
            {t("header.employees")}
          </label>
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
        {/* End Multi-Select for Employees */}

        <div className="mt-4 flex justify-end w-full">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 self-end"
          >
            {t("projectForm.next")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectSettingForm;
