import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DynamicTable from "src/components/DynamicTable";
import Pagination from "src/components/shared/Pagination";
import { StageActivity } from "src/state/currentStageData";

export type ActivityTaleProps = {
  activities: StageActivity[];
  pageIndex?: number;
  pageSize?: number;
  count?: number;
  setPageIndex?: any;
  setPageSize?: any;
};
function ActivityTable({
  activities,
  setPageIndex,
  setPageSize,
  pageIndex = 1,
  pageSize = 1,
  count,
}: ActivityTaleProps) {
  const { t } = useTranslation();
  const predSuccColumns = useMemo(
    () => [
      {
        Header: t("preSucactivity.activityId"),
        accessor: "activityId",
        Cell: ({ row, cell: { value } }: any) => {
          const isPassed = row.original["isPassed"];
          const color = row.original["color"];

          return (
            <div
              className={`dark:bg-boxdark-2  ${
                isPassed && "text-gray-600 dark:text-gray-600"
              }`}
              style={{
                color: color && !isPassed ? color : undefined,
              }}
            >
              {value}
            </div>
          );
        },
      },
      {
        Header: t("preSucactivity.activityUID"),
        accessor: "activityUID",
        Cell: ({ row, cell: { value } }: any) => {
          const isPassed = row.original["isPassed"];
          const color = row.original["color"];
          return (
            <div
              className={`dark:bg-boxdark-2  ${
                isPassed && "text-gray-600 dark:text-gray-600"
              }`}
              style={{
                color: color && !isPassed ? color : undefined,
              }}
            >
              {value}
            </div>
          );
        },
      },
      {
        Header: t("preSucactivity.activityName"),
        accessor: "name",
        Cell: ({ row, cell: { value } }: any) => {
          const isPassed = row.original["isPassed"];
          const color = row.original["color"];
          return (
            <div
              className={` line-clamp-2 break-all dark:bg-boxdark-2 ${
                isPassed && "text-gray-600 dark:text-gray-600"
              } `}
              style={{
                color: color && !isPassed ? color : undefined,
              }}
            >
              {value}
            </div>
          );
        },
      },
    ],
    [t]
  );

  const pageCount = useMemo(() => {
    return Math.ceil((count ?? 0) / pageSize);
  }, [pageSize, count]);
  const nextPage = () => setPageIndex(pageIndex + 1);
  const previousPage = () => setPageIndex(pageIndex - 1);
  const onPageChange = (newPageIndex: number) => setPageIndex(newPageIndex);
  const onPageSizeChange = (newPageSize: number) => {
    setPageIndex(0);
    setPageSize(newPageSize);
  };
  return (
    <aside>
      <DynamicTable
        data={activities ?? []}
        columns={predSuccColumns}
        dataCount={activities.length ?? 0}
        hideFilters={true}
      />

      <Pagination
        pageIndex={pageCount === 0 ? -1 : pageIndex}
        pageCount={pageCount}
        pageSize={pageSize}
        onNextPage={nextPage}
        onPreviousPage={previousPage}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </aside>
  );
}

export default ActivityTable;
