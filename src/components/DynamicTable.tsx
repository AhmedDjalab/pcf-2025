import React from "react";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  TableState,
  useAsyncDebounce,
} from "react-table";
import "regenerator-runtime";
import { classNames } from "src/components/shared/Utils";
import {
  SortIcon,
  SortUpIcon,
  SortDownIcon,
} from "src/components/shared/Icons";
import PdfIcon from "/src/images/icon/pdf.svg";
import ExcelIcon from "/src/images/icon/excel.svg";

import { useTranslation } from "react-i18next";

export interface DynamicTableProps {
  columns: any;
  data: any[];
  rawData?: any[];
  hideFilters?: boolean;
  dataCount?: number;
  setSearch?: any;
  initialeStateColumn?: Partial<TableState<object>> | undefined;
}

// Define a default UI for filtering
function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
  dataCount,
}: any) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const { t } = useTranslation();
  const onChange = useAsyncDebounce((value: any) => {
    setGlobalFilter(value);
  }, 500);

  return (
    <label className="flex items-baseline gap-x-4">
      <span className="px-2 text-gray-700 dark:text-bodydark">
        {t("DynamicTable.Search")}{" "}
      </span>
      <input
        type="text"
        className=" rounded-md border-gray-300 px-2 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-boxdark-2 dark:text-bodydark"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={`${dataCount} ${t("DynamicTable.records")}...`}
      />
    </label>
  );
}

// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id, render },
  data,
}: any) {
  // Calculate the options for filtering
  const options = React.useMemo(() => {
    if (data) {
      // If data is provided, assume it's an array of values for the given column
      return data.map((e: any) => e[id]);
    } else {
      // If data is not provided, use preFilteredRows
      const uniqueOptions = new Set();
      preFilteredRows.forEach((row: any) => {
        uniqueOptions.add(row.values[id]);
      });
      return [...uniqueOptions.values()];
    }
  }, [id, preFilteredRows, data]);

  // Render a multi-select box
  return (
    <label className="flex items-baseline gap-x-6 ">
      <span className="pl-2 text-gray-700 dark:text-bodydark">
        {render("Header")}:{" "}
      </span>
      <select
        className="rounded-md truncate w-32 border-gray-300 px-2 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-boxdark-2 dark:text-bodydark"
        name={id}
        id={id}
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
      >
        <option value="">All</option>
        {options.map((option: any, i: any) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function StatusLicense({ value }: any) {
  const status = value ? "active" : "inactive";

  return (
    <span
      className={classNames(
        "leading-wide rounded-full px-3 py-1 text-xs font-bold uppercase shadow-sm",
        status.startsWith("active") ? "bg-green-100 text-green-800" : "",
        status.startsWith("inactive") ? "bg-yellow-100 text-yellow-800" : "",
        status.startsWith("offline") ? "bg-red-100 text-red-800" : ""
      )}
    >
      {status}
    </span>
  );
}

export function AvatarCell({ value, column, row }: any) {
  return (
    <div className="flex items-center">
      <div className="h-10 w-10 flex-shrink-0">
        <img
          className="h-10 w-10 rounded-full"
          src={row.original[column.imgAccessor]}
          alt=""
        />
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">
          {row.original[column.emailAccessor]}
        </div>
      </div>
    </div>
  );
}

function DynamicTable({
  rawData,
  columns,
  data,
  dataCount,
  setSearch,
  initialeStateColumn,
  hideFilters = false,
}: DynamicTableProps) {
  // Use the state and functions returned from useTable to build your UI

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,

    rows, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page
    setHiddenColumns,
    state,
    preGlobalFilteredRows,
    exportData,
  }: any = useTable(
    {
      columns,
      data: data,
    },
    useFilters, // useFilters!
    useGlobalFilter,
    useSortBy
  );

  React.useEffect(() => {
    const hiddenColumns = columns
      .filter((column: any) => column.show === false)
      .map((column: any) => column.accessor);

    setHiddenColumns(hiddenColumns);
  }, []);
  // Render the UI for your table

  return (
    <>
      <div className="flex-col gap-4 sm:flex  sm:gap-x-2">
        {/* <div className="flex  gap-4 self-end  p-4">
          <button
            onClick={() => {
              exportData("csv", true);
            }}
          >
            <img src={ExcelIcon} className="ml-1 inline h-10 w-10" />
          </button>

          <button
            onClick={() => {
              exportData("pdf", true);
            }}
          >
            <img src={PdfIcon} className="ml-1 inline h-10 w-10" />
          </button>
        </div> */}
        {!hideFilters && (
          <div className="flex overflow-x-scroll md:overflow-x-hidden ">
            <GlobalFilter
              preGlobalFilteredRows={preGlobalFilteredRows}
              globalFilter={state.globalFilter}
              setGlobalFilter={setSearch}
              dataCount={dataCount}
            />
            <div className="flex ">
              {headerGroups.map((headerGroup: any) =>
                headerGroup.headers.map((column: any) =>
                  column.Filter ? (
                    <div className="" key={column.id}>
                      {column.render("Filter")}
                    </div>
                  ) : null
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* table */}
      <div className="mt-4 flex flex-col">
        <div className="-my-2  sm:-mx-6 lg:-mx-8 overflow-x-auto">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8 ">
            <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg ">
              <table
                {...getTableProps()}
                className="min-w-full divide-y divide-gray-200 "
              >
                <thead>
                  {headerGroups.map((headerGroup: any) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column: any) => (
                        // Add the sorting props to control sorting. For this example
                        // we can add them into the header props
                        <th
                          scope="col"
                          className="group px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                        >
                          <div className="flex items-center justify-between">
                            {column.render("Header")}
                            {/* Add a sort direction indicator */}
                            <span>
                              {column.isSorted ? (
                                column.isSortedDesc ? (
                                  <SortDownIcon className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <SortUpIcon className="h-4 w-4 text-gray-400" />
                                )
                              ) : (
                                <SortIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                              )}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody
                  {...getTableBodyProps()}
                  className="divide-y divide-gray-200 bg-white dark:border-gray-700 dark:bg-boxdark-2 dark:text-bodydark   "
                >
                  {rows.map((row: any, i: any) => {
                    // new
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map((cell: any) => {
                          return (
                            <td
                              {...cell.getCellProps()}
                              className="whitespace-nowrap px-6 py-4"
                              role="cell"
                            >
                              {cell.column.Cell.name === "defaultRenderer" ? (
                                <div className="text-sm text-gray-500">
                                  {cell.render("Cell")}
                                </div>
                              ) : (
                                cell.render("Cell")
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DynamicTable;
