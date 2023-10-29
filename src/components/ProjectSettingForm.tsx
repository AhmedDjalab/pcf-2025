import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ProjectSettings,
  updateProjectSettingsValue,
} from "src/state/slices/graphSlice";
import { RootState } from "src/state";
import { MultiStepFormProps } from "./DrawGraphForm";
import ImagePicker from "./ImagePicker";
import { ProjectFileType, ProjectFiletypeOptions } from "src/const/vars";
import { EmployeeData } from "src/pages/Employee/EmployeeForm";
import { getEmployees } from "src/Services/EmployeeService";
import Select from "react-select";
import { useUserContext } from "src/context/UserContext";

interface Options {
  label: string;
  value: string;
}
const ProjectSettingForm = ({ setCurrentStep }: MultiStepFormProps) => {
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<Options[]>([]);

  const [projectFileType, setProjectFileType] = useState(ProjectFileType.XLSX); // Set a default value
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const { user } = useUserContext();

  const projectSettings = useSelector(
    (state: RootState) => state.projectSettings
  );
  const fetchEmploye = useCallback(async () => {
    if (user?.uid) {
      const emp = await getEmployees(user?.uid!);

      setEmployees(emp);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchEmploye();
  }, [fetchEmploye]);

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
    };
    dispatch(updateProjectSettingsValue({ projectSettings: projectSetting }));
    setCurrentStep((step) => step + 1);
  };

  return (
    <div className=" mx-auto">
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
            onChange={handleFileTypeChange}
            className="block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          >
            {ProjectFiletypeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
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
            {"Employees"}
          </label>
          <Select
            id="employees"
            name="employees"
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
              employees.map((employee) => ({
                value: employee.id,
                label: employee.email,
              })) ?? []
            }
            isMulti
            value={selectedEmployees}
            onChange={(selectedOptions: any, { action }: any) => {
              if (action === "select-option" || action === "remove-value") {
                setSelectedEmployees(selectedOptions as Options[]);
                // setFieldValue(
                //   "employees",
                //   (selectedOptions as Options[]).map((option) => option.value)
                // );
              }
            }}
          />
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
