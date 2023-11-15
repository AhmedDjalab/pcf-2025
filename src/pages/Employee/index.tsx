import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DefaultLayout from "src/components/DefaultLayout";
import EmployeeForm, { EmployeeData } from "./EmployeeForm";
import {
  Employee,
  deleteEmployee,
  // deleteEmployeeAndUser,
  getEmployees,
} from "src/Services/EmployeeService2";
import { useAuth } from "src/context/UserContext";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import Spinner from "src/components/Spinner";
import { deleteEmployeeAndUser } from "src/Services/EmployeeService";

const exampleEmployees = [
  {
    id: "1",
    fullName: "John Doe",
    jobTitle: "Software Engineer",
    canRead: true,
    canWrite: true,
  },
  {
    id: "2",
    fullName: "Jane Smith",
    jobTitle: "Product Manager",
    canRead: false,
    canWrite: true,
  },
  // Add more employees as needed
];

const Employees = () => {
  // const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edit, setEdit] = useState<Employee | null>(null);
  const { user } = useAuth();
  const queryClient = new QueryClient();
  const {
    data: employeeData,
    isLoading: employeeLoading,
    refetch: refetchEmployee,
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
  // const fetchEmploye = useCallback(async () => {
  //   if (user?.id) {
  //     const emp = await getEmployees({
  //       fromvalue: 0,
  //       takevalue: 0,
  //       userAdminId: user.id,
  //       search: "",
  //     });

  //     setEmployees(emp?.employees ?? []);
  //   }
  // }, [user?.id]);

  // useEffect(() => {
  //   fetchEmploye();
  // }, [fetchEmploye]);

  const handleAddClick = () => {
    setEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (grT: Employee) => {
    setEdit(grT);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (gtId: string) => {
    deleteEmployee(gtId);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEdit(null);
    refetchEmployee();
  };
  const { t } = useTranslation();

  // const handleCheckboxChange = (employeeId: string, property: any) => {
  //   setEmployees((prevEmployees) =>
  //     prevEmployees.map((employee) =>
  //       employee.id === employeeId
  //         ? //@ts-ignore
  //           { ...employee, [property]: !employee[property] }
  //         : employee
  //     )
  //   );
  // };

  return (
    <DefaultLayout>
      {employeeLoading ? (
        <Spinner />
      ) : (
        <div className="dark:bg-boxdark bg-white h-[100vh] w-full overflow-x-auto">
          <div className="py-2 ml-10 flex justify-between ">
            <button
              onClick={() => setIsModalOpen(true)}
              className=" text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
            >
              {t("taskSlotsList.addButton")}
            </button>
          </div>
          <table className="min-w-full divide-y divide-gray-200 m-10 dark:text-gray-400">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("employeeList.fullName")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("employeeForm.email")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("employeeList.canRead")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("employeeList.canWrite")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("employeeList.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {employeeData?.employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4  ">{employee.fullName}</td>
                  <td className="px-6 py-4  ">{employee.email}</td>

                  <td className="px-6 py-4">
                    <input type="checkbox" checked={employee.canRead} />
                  </td>
                  <td className="px-6 py-4">
                    <input type="checkbox" checked={employee.canWrite} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <button
                      className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                      onClick={() => handleEditClick(employee)}
                    >
                      {t("taskSlotsList.buttons.edit")}
                    </button>
                    <button
                      className="focus:outline-none text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                      onClick={() => handleDeleteClick(employee.id!)}
                    >
                      {t("taskSlotsList.buttons.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isModalOpen && (
            <EmployeeForm
              initialValues={edit || undefined}
              onSubmit={closeModal}
              handleClose={() => setIsModalOpen(false)}
            />
          )}
        </div>
      )}
    </DefaultLayout>
  );
};

export default Employees;
