import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import DefaultLayout from "src/components/DefaultLayout";

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
  const [employees, setEmployees] = useState(exampleEmployees);
  const { t } = useTranslation();

  const handleCheckboxChange = (employeeId: string, property: any) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((employee) =>
        employee.id === employeeId
          ? //@ts-ignore
            { ...employee, [property]: !employee[property] }
          : employee
      )
    );
  };

  return (
    <DefaultLayout>
      <div>
        <div className="my-4 ml-10 flex justify-between">
          <button
            onClick={() => {}}
            className=" text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800"
          >
            {t("taskSlotsList.addButton")}
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200 m-10">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {t("employeeList.fullName")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                {t("employeeList.jobTitle")}
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
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4">{employee.fullName}</td>
                <td className="px-6 py-4">{employee.jobTitle}</td>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={employee.canRead}
                    onChange={() =>
                      handleCheckboxChange(employee.id, "canRead")
                    }
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={employee.canWrite}
                    onChange={() =>
                      handleCheckboxChange(employee.id, "canWrite")
                    }
                  />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    className="text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    onClick={() => {}}
                  >
                    {t("taskSlotsList.buttons.edit")}
                  </button>
                  <button
                    className="focus:outline-none text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
                    onClick={() => {}}
                  >
                    {t("taskSlotsList.buttons.delete")}
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

export default Employees;
