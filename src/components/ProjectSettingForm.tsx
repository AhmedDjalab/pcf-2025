import React, { useEffect, useState } from "react";
import ImagePicker from "./ImagePicker";
import { MultiStepFormProps } from "./DrawGraphForm";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state";
import {
  ProjectSettings,
  updateProjectSettingsValue,
} from "../state/slices/graphSlice";

const ProjectSettingForm = ({ setCurrentStep }: MultiStepFormProps) => {
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const dispatch = useDispatch();
  const projectSettings = useSelector(
    (state: RootState) => state.projectSettings
  );

  useEffect(() => {
    if (projectSettings) {
      setProjectTitle(projectSettings.title || ""); // Set to an empty string if undefined
      setSelectedImage(projectSettings.logoImg || ""); // Set to an empty string if undefined
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const projectSetting: ProjectSettings = {
      title: projectTitle,
      logoImg: selectedImage,
    };
    // Dispatch the action to update project settings
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
            Titre du Projet
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
            Logo
          </label>
          <ImagePicker
            onChange={handleImageChange}
            imageValue={selectedImage}
          />
        </div>

        <div className="mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectSettingForm;
