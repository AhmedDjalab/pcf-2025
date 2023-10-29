import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import DefaultLayout from "src/components/DefaultLayout";

const exampleProjects = [
  {
    id: "1",
    title: "Project 1",
    numEmployees: 5,
  },
  {
    id: "2",
    title: "Project 2",
    numEmployees: 8,
  },
  // Add more projects as needed
];

const Projects = () => {
  const [projects, setProjects] = useState(exampleProjects);
  const { t } = useTranslation();

  return (
    <DefaultLayout>
      <div className="dark:bg-boxdark bg-white h-[100vh]">
        <div className="py-2 ml-10 flex justify-between">
          {/* <button
            onClick={() => {}}
            className=" text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
          >
            {t("taskSlotsList.addButton")}
          </button> */}
        </div>
        <table className="min-w-full divide-y divide-gray-200 m-8 dark:text-gray-400">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {t("projectsList.title")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {t("projectsList.numEmployees")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {t("projectsList.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="px-6 py-4">{project.title}</td>
                <td className="px-6 py-4">{project.numEmployees}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover-bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    onClick={() => {}}
                  >
                    {t("projectsList.buttons.edit")}
                  </button>
                  <button
                    className="focus:outline-none text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover-bg-red-700 dark:focus:ring-red-900"
                    onClick={() => {}}
                  >
                    {t("projectsList.buttons.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DefaultLayout>
  );
};

export default Projects;
