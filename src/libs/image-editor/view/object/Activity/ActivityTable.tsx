import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DynamicTable from "src/components/DynamicTable";
import { StageActivity } from "src/state/currentStageData";

export type ActivityTaleProps = {
  activities: StageActivity[];
};
function ActivityTable({ activities }: ActivityTaleProps) {
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
  return (
    <aside>
      <DynamicTable
        data={activities ?? []}
        columns={predSuccColumns}
        dataCount={activities.length ?? 0}
        hideFilters={true}
      />
    </aside>
  );
}

export default ActivityTable;
