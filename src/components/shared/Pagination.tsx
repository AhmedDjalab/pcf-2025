import React, { ChangeEvent } from "react";
import {
  ChevronDoubleLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/solid";
import { Button, PageButton } from "./Button";
import { useTranslation } from "react-i18next"; // Import the useTranslation hook

interface PaginationProps {
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pageIndex,
  pageCount,
  pageSize,
  onNextPage,
  onPreviousPage,
  onPageChange,
  onPageSizeChange,
}) => {
  const { t } = useTranslation(); // Initialize the useTranslation hook

  const handlePageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newPageIndex = parseInt(event.target.value);
    onPageChange(newPageIndex);
  };

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value);
    onPageSizeChange(newPageSize);
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button onClick={onPreviousPage} disabled={pageIndex === 0}>
          {t("Pagination.previous")}
        </Button>
        <Button onClick={onNextPage} disabled={pageIndex === pageCount - 1}>
          {t("Pagination.next")}
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-x-2">
          <span className="text-sm text-gray-700 dark:text-bodydark">
            {t("Pagination.page", { pageIndex: pageIndex + 1, pageCount })}
          </span>
          <label>
            <span className="sr-only">{t("Pagination.itemsPerPage")}</span>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-boxdark-2 dark:text-bodydark"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              {[5, 10, 20].map((pageSizeOption) => (
                <option key={pageSizeOption} value={pageSizeOption}>
                  {t("Pagination.show", { pageSize: pageSizeOption })}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <nav
            className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <PageButton
              className="rounded-l-md dark:bg-boxdark-2 dark:text-bodydark"
              onClick={() => onPageChange(0)}
              disabled={pageIndex === 0}
            >
              <span className="sr-only">{t("Pagination.first")}</span>
              <ChevronDoubleLeftIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </PageButton>
            <PageButton onClick={onPreviousPage} disabled={pageIndex === 0}>
              <span className="sr-only">{t("Pagination.previous")}</span>
              <ChevronLeftIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </PageButton>
            <PageButton
              onClick={onNextPage}
              disabled={pageIndex === pageCount - 1}
            >
              <span className="sr-only">{t("Pagination.next")}</span>
              <ChevronRightIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </PageButton>
            <PageButton
              className="rounded-r-md"
              onClick={() => onPageChange(pageCount - 1)}
              disabled={pageIndex === pageCount - 1}
            >
              <span className="sr-only">{t("Pagination.last")}</span>
              <ChevronDoubleRightIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </PageButton>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
