//@ts-nocheck
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import DefaultLayout from "src/components/DefaultLayout";
import { RootState } from "src/state";
import * as XLSX from "xlsx";

import {
  PencilIcon,
  EyeIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getEmployees } from "src/Services/EmployeeService2";
import { useAuth } from "src/context/UserContext";
import {
  deleteProject,
  getProjects,
  getProjectsByEmployeeId,
} from "src/Services/ProjectService";
import Spinner from "src/components/Spinner";
import { Project } from "src/types/Project";
import {
  DocumentChartBarIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { resetStoreState } from "src/state/slices/graphSlice";
import { persistor } from "src/App";
import { UserRoles } from "src/enums/UsersRole";
import DynamicTable, { SelectColumnFilter } from "src/components/DynamicTable";
import DeleteConfirmationModal from "src/components/shared/DeleteConfirmationModal";
import Pagination from "src/components/shared/Pagination";
import moment from "moment-timezone";
import { Cell, Column, Row } from "react-table";
import { ThunkDispatch, AnyAction } from "@reduxjs/toolkit";
import UsersModal from "src/components/UsersModal";
// test
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
  const [projects, setProjects] = useState();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState("");
  const [selectedEmployeesId, setSelectedEmployeesId] = useState<string[]>([]);
  const { user, canWrite } = useAuth();
  const isAdmin = user?.role === UserRoles.Admin;
  const userTimeZone = moment.tz.guess();
  const timeZoneString = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();

  const ActionButtonsCell = ({ value, row }: any) => {
    const employeesId = row.original["employeesId"];

    return (
      <div className="flex gap-2">
        <Link
          to={`/view-graph/${value}`}
          className="focus:outline-none no-underline text-white bg-purple-500 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-3 py-2.5 mr-2 mb-2 dark:bg-purple-600 dark:hover-bg-purple-700 dark:focus:ring-purple-900"
        >
          <EyeIcon className="inline w-5 h-5 mr-2" />
          {t("projectsList.buttons.viewGraph")}
        </Link>

        <Link
          to={`/view-bim/${value}`}
          className="focus:outline-none no-underline text-white bg-fuchsia-500 hover:bg-fuchsia-800 focus:ring-4 focus:ring-bg-fuchsia-300 font-medium rounded-lg text-sm px-3 py-2.5 mr-2 mb-2 dark:bg-fuchsia-600 dark:hover-bg-fuchsia-700 dark:focus:ring-ebg-fuchsia-900"
        >
          <EyeIcon className="inline w-5 h-5 mr-2" />
          Bim
        </Link>
        <Link
          to={`/view-plan/${value}`}
          className="focus:outline-none no-underline text-white bg-[#f7ad25] hover:bg-[#f7ad25] focus:ring-4 focus:ring-[#f7ad25] font-medium rounded-lg text-sm px-3 py-2.5 mr-2 mb-2 dark:bg-[#f7ad25] dark:hover-bg-[#f7ad25] dark:focus:ring-[#f7ad25]"
        >
          <DocumentChartBarIcon className="inline w-5 h-5 mr-2" />
          {t("projectsList.buttons.viewPlan")}
        </Link>
        <Link
          to={`/create-project/${value}`}
          hidden={!canWrite && !isAdmin}
          onClick={() => {
            dispatch(resetStoreState());
          }}
          className="text-white no-underline bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover-bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          <PencilIcon className="inline w-5 h-5 mr-2" />
          {t("projectsList.buttons.edit")}
        </Link>
        {isAdmin && (
          <>
            <button
              className="focus:outline-none no-underline text-white bg-teal-500 hover:bg-teal-800 focus:ring-4 focus:ring-teal-300 font-medium rounded-lg text-sm px-3 py-2.5 mr-2 mb-2 dark:bg-teal-600 dark:hover-bg-teal-700 dark:focus:ring-teal-900"
              onClick={(e) => {
                setSelectedEmployeesId(employeesId);
                setSelectedRow(value);
                setIsUserModalVisible(true);
              }}
            >
              <UserIcon className="inline w-5 h-5 mr-2" />
              {t("header.users")}
            </button>
            <button
              className="focus:outline-none no-underline text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover-bg-red-700 dark:focus:ring-red-900"
              onClick={(e) => {
                setSelectedRow(value);
                setIsModalVisible(true);
              }}
            >
              <TrashIcon className="inline w-5 h-5 mr-2" />
              {t("projectsList.buttons.delete")}
            </button>
          </>
        )}
      </div>
    );
  };
  const columns = useMemo(
    () => [
      {
        Header: t("projectsList.title"),
        accessor: "title",
        Filter: SelectColumnFilter,
      },
      {
        Header: t("projectsList.createdAt"),
        accessor: "createdAt",

        Cell: ({ cell: { value } }: any) => {
          const dateValue = moment.utc(value);

          if (dateValue.format("YYYY-MM-DD") === "0001-01-01") {
            return <div>{t("projectsList.NoDateAvailable")}</div>;
          }

          const formattedValue = dateValue
            .tz(userTimeZone)
            .format("YYYY-MM-DD hh:mm");
          return <div>{formattedValue}</div>;
        },
      },
      {
        Header: t("projectsList.LastModifiedAt"),
        accessor: "updatedAt",

        Cell: ({ cell: { value } }: any) => {
          const dateValue = moment.utc(value);

          if (dateValue.format("YYYY-MM-DD") === "0001-01-01") {
            return <div>{t("projectsList.NoDateAvailable")}</div>;
          }

          const formattedValue = dateValue
            .tz(userTimeZone)
            .format("YYYY-MM-DD hh:mm");
          return <div>{formattedValue}</div>;
        },
      },
      {
        Header: t("projectsList.CreatedBy"),
        accessor: "creatorName",
        Filter: SelectColumnFilter,
      },
      {
        Header: t("projectsList.ModifiedBy"),
        accessor: "modifierName",
        Filter: SelectColumnFilter,
      },
      {
        Header: t("projectsList.actions"),
        accessor: "id",
        Cell: ({ row, cell: { value } }: any) => (
          <ActionButtonsCell value={value} row={row} />
        ),
      },
    ],
    [t, ActionButtonsCell, isAdmin]
  );
  const handleCancelDelete = () => {
    setIsModalVisible(false);
  };

  const handleDeleteConfirmation = () => {
    handleDeleteProject.mutate(selectedRow);
    setIsModalVisible(false);
  };
  const handleDeleteProject = useMutation({
    mutationFn: async (id: string) => {
      await deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", user?.id] });
    },
  });

  const {
    data: projectsData,
    isLoading: projectsLoading,
    refetch: refetchProject,
  } = useQuery({
    queryKey: ["projects", user?.id, pageIndex, pageSize, search],
    queryFn: () => {
      if (user?.role === UserRoles.Admin) {
        return getProjects({
          fromvalue: pageIndex,
          takevalue: pageSize,
          search: search,
          userAdminId: user?.id,
        });
      } else {
        return getProjectsByEmployeeId({
          fromvalue: pageIndex,
          takevalue: pageSize,
          search: search,
          employeeId: user?.id,
        });
      }
    },

    refetchOnWindowFocus: false,
    staleTime: 6000,
    enabled: !!user?.id,
  });

  const pageCount = useMemo(() => {
    return Math.ceil((projectsData?.count ?? 0) / pageSize);
  }, [pageSize, projectsData]);
  const nextPage = () => setPageIndex(pageIndex + 1);
  const previousPage = () => setPageIndex(pageIndex - 1);
  const onPageChange = (newPageIndex: number) => setPageIndex(newPageIndex);
  const onPageSizeChange = (newPageSize: number) => {
    setPageIndex(0);
    setPageSize(newPageSize);
  };

  const handleExportAllClick = (project: Project) => {
    const rawData = project.activities;
    if (!rawData) return;
    const worksheet = XLSX.utils.json_to_sheet(
      rawData.map(({ ...rest }) => rest) // Exclude styleID
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

  const handleDeleteClick = async (projectId: string) => {
    await deleteProject(projectId!);
  };
  const handlePurgeAndNavigate = async () => {
    try {
      dispatch(resetStoreState());

      // Now, navigate to the desired location
      navigate("/create-project");
    } catch (error) {
      console.error("Error purging state:", error);
    }
  };

  return (
    <DefaultLayout>
      <div className="w-full bg-white dark:bg-boxdark ">
        <div className="flex justify-between py-2 ml-10">
          <button
            disabled={!canWrite && !isAdmin}
            onClick={handlePurgeAndNavigate}
            className=" text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-3 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
          >
            {t("taskSlotsList.addButton")}
          </button>
        </div>
        {projectsLoading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col mx-auto min-w-[40rem] overflow-x-auto  ">
            <DynamicTable
              dataCount={projectsData?.count}
              data={projectsData?.projects ?? []}
              columns={columns}
              setSearch={setSearch}
            />
            {isModalVisible && (
              <DeleteConfirmationModal
                isOpen={isModalVisible}
                onDelete={handleDeleteConfirmation}
                onCancel={handleCancelDelete}
              />
            )}
            {isUserModalVisible && (
              <UsersModal
                handleClose={() => setIsUserModalVisible(false)}
                isOpen={isUserModalVisible}
                employeesIds={selectedEmployeesId}
                projectId={selectedRow}
              />
            )}
            <Pagination
              pageIndex={pageCount === 0 ? -1 : pageIndex}
              pageCount={pageCount}
              pageSize={pageSize}
              onNextPage={nextPage}
              onPreviousPage={previousPage}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Projects;
