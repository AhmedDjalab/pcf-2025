import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import DefaultLayout from "src/components/DefaultLayout";
import { RootState } from "src/state";
import * as XLSX from "xlsx";

import {
  PencilIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

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
  const projectSettings = useSelector(
    (state: RootState) => state.projectSettings
  );
  let rawData = useSelector((state: RootState) => state.rawGraphDataFromFile);

  const { t } = useTranslation();
  const handleExportAllClick = () => {
    if (!rawData) return;
    const worksheet = XLSX.utils.json_to_sheet(
      rawData.map(({ styleId, ...rest }) => rest) // Exclude styleID
    );

    // Format the headers to uppercase
    worksheet["A1"].v = "ID";
    worksheet["B1"].v = "ACTIVITY NAME";
    worksheet["C1"].v = "START DATE";
    worksheet["D1"].v = "FINISH DATE";
    worksheet["E1"].v = "START CHAINAGE";
    worksheet["F1"].v = "FINISH CHAINAGE";
    worksheet["G1"].v = "STYLE";

    // Iterate through the data and trim field values
    for (let i = 2; i <= rawData.length + 1; i++) {
      worksheet["A" + i].v = (worksheet["A" + i].v || "").trim();
      worksheet["B" + i].v = (worksheet["B" + i].v || "").trim();

      worksheet["G" + i].v = (worksheet["G" + i].v || "").trim();
    }

    // Create a new workbook and add the worksheet to it
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Graph Data");

    // Export the workbook to an XLSX file

    // Export the workbook to an XLSX file
    XLSX.writeFile(workbook, "pcfallData.xlsx");
  };
  return (
    <DefaultLayout>
      <div className="dark:bg-boxdark bg-white h-[calc(100dvh)] w-full overflow-x-auto">
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
              {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {t("projectsList.numEmployees")}
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {t("projectsList.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {/* {projects.map((project) => (
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
            ))} */}

            <tr key={"projectSettings.id"}>
              <td className="px-6 py-4">{projectSettings.title}</td>
              {/* <td className="px-6 py-4">{project.numEmployees}</td> */}
              {/* <td className="whitespace-nowrap px-6 py-4">
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
              </td> */}

              <td className="whitespace-nowrap px-6 py-4">
                <Link
                  to={"/create-project"}
                  className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover-bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                >
                  <PencilIcon className="w-5 h-5 mr-2 inline" />
                  {t("projectsList.buttons.edit")}
                </Link>

                <Link
                  to={"/graph"}
                  className="focus:outline-none text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover-bg-red-700 dark:focus:ring-red-900"
                >
                  <EyeIcon className="w-5 h-5 mr-2 inline" />
                  {t("projectsList.buttons.viewGraph")}
                </Link>

                <button
                  className="focus:outline-none text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover-bg-green-700 dark:focus:ring-green-900"
                  onClick={handleExportAllClick}
                >
                  <DocumentArrowDownIcon className="w-5 h-5 mr-2 inline" />
                  {t("projectsList.buttons.download")}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DefaultLayout>
  );
};

export default Projects;
