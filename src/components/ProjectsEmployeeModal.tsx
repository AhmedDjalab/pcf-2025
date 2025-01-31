import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { getBriefProjects, getProjects } from "src/Services/ProjectService";
import { useAuth } from "src/context/UserContext";
import Spinner from "./Spinner";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { LabelButton } from "./shared/Button";
import {
  ProjectsEmployeeType,
  saveProjectsPerEmployee,
} from "src/Services/ProjectEmployeesService";

interface Options {
  label: string;
  value: string;
}

interface ProjectsEmployeeModalProps {
  projectIds: string[];
  isOpen: boolean;
  handleClose: () => void;
  employeeId: string;
}

const ProjectsEmployeeModal = ({
  projectIds,
  isOpen,
  handleClose,
  employeeId,
}: ProjectsEmployeeModalProps) => {
  const { user, canWrite, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [selectedProjects, setSelectedProjects] = useState<Options[]>([]);

  const {
    data: projectData,
    isLoading: projectLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["projects", employeeId],
    queryFn: () => getBriefProjects(employeeId),
    refetchOnWindowFocus: false,
    staleTime: 10000,
  });

  useEffect(() => {
    let selectedProjectsData: Options[] = [];

    if (isSuccess && projectData) {
      selectedProjectsData =
        projectIds?.map((x) => ({
          label: projectData.find((p) => p.id === x)?.label ?? "",
          value: x,
        })) ?? [];

      setSelectedProjects(selectedProjectsData);
    }
  }, [projectData, projectData, projectIds, isSuccess]);

  const handleSave = async () => {
    const employeeProjects: ProjectsEmployeeType = {
      projectsIds: selectedProjects.map((x) => x.value),
      employeeId: employeeId,
    };

    const data = await saveProjectsPerEmployee(employeeProjects);

    if (data) {
      handleClose();
    }
  };

  return (
    <div className="fixed left-0 top-0 z-50 flex w-full items-center justify-center bg-white bg-opacity-20 dark:bg-gray-700 dark:bg-opacity-20">
      <div className="mt-20 w-[50%] text-boxdark dark:text-white overflow-y-auto rounded bg-white p-6 shadow-md dark:bg-gray-700">
        <div className="mb-4 text-2xl font-semibold">
          {t("header.projects")}
        </div>

        <div className="group relative z-0 mb-6 w-full">
          {projectLoading ? (
            <Spinner />
          ) : (
            <Select
              id="projects"
              name="projects"
              isDisabled={!canWrite && !isAdmin}
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
                projectData?.map((project) => ({
                  value: project.id!,
                  label: project.label,
                })) ?? []
              }
              isMulti
              value={selectedProjects}
              onChange={(selectedOptions: any, { action }: any) => {
                if (action === "select-option" || action === "remove-value") {
                  setSelectedProjects(selectedOptions as Options[]);
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
            className="mb-2 mr-2 rounded-lg border border-primary-700 px-5 py-2.5 text-center text-sm font-medium text-primary-700 hover:bg-primary-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-primary-300 dark:border-primary-500 dark:text-primary-500 dark:hover:bg-primary-600 dark:hover:text-white dark:focus:ring-primary-800"
          >
            {t("activityForm.save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsEmployeeModal;
