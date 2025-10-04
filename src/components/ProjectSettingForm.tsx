//@ts-nocheck

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
import { editEmployee } from "src/Services/EmployeeService";
import { useParams } from "react-router-dom";
import { UploadFilesUrl } from "src/variables/Urls";
import api from "src/utils/api";
import { compressFile } from "src/utils/fileCompresser";

export interface Options {
  label: string;
  value: string;
}

const ProjectSettingForm = ({ setCurrentStep }: MultiStepFormProps) => {
  const [projectTitle, setProjectTitle] = useState("");
  const { id } = useParams();

  const [fileName, setFileName] = useState("");
  const [clientfileName, setClientFileName] = useState("");
  const [ifcFileUrl, setIfcFileUrl] = useState("");
  const [ifcUploading, setIfcUploading] = useState(false);
  const [ifcError, setIfcError] = useState("");
  const [ifcSuccess, setIfcSuccess] = useState("");

  const fileType = useSelector(
    (state: RootState) => state.graph.projectSettings.fileType
  );
  const [projectFileType, setProjectFileType] = useState(ProjectFileType.XLSX);

  useEffect(() => {
    if (fileType) {
      setProjectFileType(fileType);
    }
  }, [fileType]);

  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  const { t } = useTranslation();

  const { user, canWrite, isAdmin } = useAuth();

  const projectSettings = useSelector(
    (state: RootState) => state.graph.projectSettings
  );

  const isDevelopment = import.meta.env.VITE_API_URL === "development";

  const [selectedImage, setSelectedImage] = useState(
    projectSettings.logoImg ?? ""
  );
  const [selectedClientImage, setSelectedClientImage] = useState(
    projectSettings.clientlogoImg ?? ""
  );
  const [selectedEmployees, setSelectedEmployees] = useState<Options[]>([]);

  const loading = useSelector((state: RootState) => state.graph.loading);
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
    staleTime: 10000,
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
  }, [employeeData, isSuccess, selectedEmployeesData, user]);

  useEffect(() => {
    if (projectSettings) {
      setProjectTitle(projectSettings.title || "");
      setSelectedImage(projectSettings.logoImg || "");
      setSelectedClientImage(projectSettings.clientlogoImg || "");
      setIfcFileUrl(projectSettings.ifcFileUrl || "");
    }
  }, [projectSettings]);

  const handleImageChange = (img: string | null) => {
    if (img) {
      setSelectedImage(img);
    }
  };

  const handleClientImageChange = (img: string | null) => {
    if (img) {
      setSelectedClientImage(img);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectTitle(e.target.value);
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProjectFileType(Number(e.target.value));
  };

  // IFC File validation
  const validateIfcFile = (file: File) => {
    const validExtensions = [".ifc"];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf("."));

    return validExtensions.includes(fileExtension);
  };

  // IFC File upload handler
  const handleIfcFileUpload = async (file: File) => {
    setIfcError("");
    setIfcSuccess("");

    if (!file) return;

    // Validate file extension
    if (!validateIfcFile(file)) {
      setIfcError(
        t("errors.invalidIfcFile") ||
          "Please upload a valid IFC file (.ifc extension only)"
      );
      return;
    }

    if (!projectTitle.trim()) {
      setIfcError(
        t("errors.projectTitleRequired") ||
          "Please enter a project title before uploading IFC file"
      );
      return;
    }

    setIfcUploading(true);

    try {
      const formData = new FormData();
      const compressedBlob = await compressFile(file);

      formData.append("file", compressedBlob, file.name + ".gz");
      // Use project title as folder path name
      formData.append("folderPathName", projectTitle.trim());

      const response = await api.post(UploadFilesUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 200) {
        const fullUrl = response.data;
        setIfcFileUrl(fullUrl);
        setIfcSuccess(
          t("success.ifcFileUploaded") || "IFC file uploaded successfully!"
        );
      }
    } catch (error) {
      console.error("Error uploading IFC file:", error);
      setIfcError(
        t("errors.ifcUploadFailed") ||
          "Failed to upload IFC file. Please try again."
      );
    } finally {
      setIfcUploading(false);
    }
  };

  const handleRemoveIfcFile = () => {
    setIfcFileUrl("");
    setIfcError("");
    setIfcSuccess("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const projectSetting: ProjectSettings = {
      title: projectTitle,
      logoImg: selectedImage,
      clientlogoImg: selectedClientImage,
      fileType: ProjectFiletypeOptions.find(
        (option) => option.id === projectFileType
      )?.id!,
      employeesId: selectedEmployees.map((x) => x.value),
      file: selectedImage,
      ifcFileUrl: ifcFileUrl, // Add IFC file URL to project settings
    };
    dispatch(updateProjectSettingsValue({ projectSettings: projectSetting }));
    setCurrentStep((step) => step + 1);
  };

  return (
    <div className="relative w-full mx-auto mt-10">
      {loading ? (
        <Spinner height="80" width="80" />
      ) : (
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label
              htmlFor="projectTitle"
              className="block mb-2 text-sm font-bold text-gray-700 dark:text-white"
            >
              {t("projectForm.title")}
            </label>
            <input
              type="text"
              id="projectTitle"
              name="projectTitle"
              value={projectTitle}
              onChange={handleTitleChange}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              required
              disabled={!canWrite && !isAdmin}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="projectImage"
              className="block mb-2 text-sm font-bold text-gray-700 dark:text-white"
            >
              {t("projectForm.logo")}
            </label>
            <ImagePicker
              keyRef="logoimg"
              onChange={handleImageChange}
              imageValue={selectedImage}
              setFileName={(fileName) => setFileName(fileName)}
              disabled={!canWrite && !isAdmin}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="projectClientImage"
              className="block mb-2 text-sm font-bold text-gray-700 dark:text-white"
            >
              {t("projectForm.clientCompanyLogo")}
            </label>
            <ImagePicker
              keyRef="clientimg"
              onChange={handleClientImageChange}
              imageValue={selectedClientImage}
              setFileName={(fileName) => setClientFileName(fileName)}
              disabled={!canWrite && !isAdmin}
            />
          </div>

          {/* IFC File Upload Section */}
          <div className="mb-4">
            <label
              htmlFor="ifcFile"
              className="block mb-2 text-sm font-bold text-gray-700 dark:text-white"
            >
              {t("projectForm.ifcFile") || "IFC File"}
              <span className="ml-2 text-xs text-gray-500">
                ({t("projectForm.optional") || "Optional"})
              </span>
            </label>

            {ifcFileUrl ? (
              // Show uploaded file
              <div className="relative p-4 border-2 border-green-300 border-dashed rounded-lg dark:border-green-600 bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        {t("projectForm.ifcFileUploaded") ||
                          "IFC File Uploaded"}
                      </p>
                      <p className="max-w-xs text-xs text-green-600 truncate dark:text-green-400">
                        {ifcFileUrl.split("/").pop() ||
                          "File uploaded successfully"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveIfcFile}
                    disabled={!canWrite && !isAdmin}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t("projectForm.removeFile") || "Remove file"}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              // Upload area
              <div className="relative">
                <label
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                    ifcUploading || (!canWrite && !isAdmin)
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {ifcUploading ? (
                      <>
                        <Spinner height="32" width="32" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          {t("projectForm.uploadingIfcFile") ||
                            "Uploading IFC file..."}
                        </p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          ></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">
                            {t("projectForm.clickToUploadIfc") ||
                              "Click to upload IFC file"}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {t("projectForm.ifcFilesOnly") || "IFC files only"}
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".ifc"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleIfcFileUpload(e.target.files[0])
                    }
                    disabled={
                      ifcUploading ||
                      !projectTitle.trim() ||
                      (!canWrite && !isAdmin)
                    }
                  />
                </label>

                {!projectTitle.trim() && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <p className="px-4 text-sm text-center text-white">
                      {t("projectForm.enterProjectTitleFirst") ||
                        "Enter project title first"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Error/Success Messages */}
            {ifcError && (
              <div className="flex items-center p-3 mt-2 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-red-800/20 dark:text-red-400">
                <svg
                  className="flex-shrink-0 w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>{ifcError}</span>
              </div>
            )}

            {ifcSuccess && (
              <div className="flex items-center p-3 mt-2 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-green-800/20 dark:text-green-400">
                <svg
                  className="flex-shrink-0 w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5v2.25a.75.75 0 001.5 0V10.5a.75.75 0 00-.75-.75H9z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>{ifcSuccess}</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="projectFileType"
              className="block mb-2 text-sm font-bold text-gray-700 dark:text-white"
            >
              {t("projectForm.fileType")}
            </label>
            <select
              id="projectFileType"
              name="projectFileType"
              value={projectFileType}
              disabled={!canWrite && !isAdmin}
              onChange={handleFileTypeChange}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            >
              {ProjectFiletypeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {t(`projectFileTypes.${option.name}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Select for Employees */}
          <div className="relative z-0 w-full mb-6 group">
            <label
              htmlFor="employees"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              {t("header.users")}
            </label>
            {employeeLoading ? (
              <Spinner />
            ) : (
              <Select
                id="employees"
                name="employees"
                isDisabled={(!canWrite && !isAdmin) || id !== undefined}
                classNames={{
                  control: () => `block w-full rounded-lg border
                    border-gray-300 text-sm
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
                  }
                }}
              />
            )}
          </div>
          {/* End Multi-Select for Employees */}

          <div className="flex justify-end w-full mt-4">
            <button
              type="submit"
              className="self-end px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {t("projectForm.next")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProjectSettingForm;
