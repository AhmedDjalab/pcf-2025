import React, { useState, useEffect } from "react";
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

const ProjectSettingForm = ({ setCurrentStep }: MultiStepFormProps) => {
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [projectFileType, setProjectFileType] = useState(ProjectFileType.XLSX); // Set a default value
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const projectSettings = useSelector(
    (state: RootState) => state.projectSettings
  );

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
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            {t("projectForm.title")}
          </label>
          <input
            type="text"
            id="projectTitle"
            name="projectTitle"
            value={projectTitle}
            onChange={handleTitleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="projectImage"
            className="block text-gray-700 text-sm font-bold mb-2"
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
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            {t("projectForm.fileType")}
          </label>
          <select
            id="projectFileType"
            name="projectFileType"
            value={projectFileType}
            onChange={handleFileTypeChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {ProjectFiletypeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

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
