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
        accessor: "activityUID",
        Cell: ({ row, cell: { value } }: any) => {
          const isPassed = row.original["isPassed"];

          return (
            <div
              className={`dark:bg-boxdark-2 dark:text-bodydark ${
                isPassed && "text-red-500 dark:text-red-500"
              }`}
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

          return (
            <div
              className={`dark:bg-boxdark-2 dark:text-bodydark ${
                isPassed && "text-red-500 dark:text-red-500"
              }`}
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
