import React from "react";
import { classNames } from "src/const/vars";

export function Button({ children, className, ...rest }: any) {
  return (
    <button
      type="button"
      className={classNames(
        "relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-boxdark-2 dark:text-bodydark",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PageButton({ children, className, ...rest }: any) {
  return (
    <button
      type="button"
      className={classNames(
        "relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-boxdark-2 dark:text-bodydark",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
export function DeleteButton({ children, className, ...rest }: any) {
  return (
    <button
      data-modal-target="popup-modal"
      data-modal-toggle="popup-modal"
      type="button"
      className={classNames(
        `mb-2 mr-2 rounded-lg border border-red-700
         px-5 py-2.5
         text-center text-sm
         font-medium text-red-700 hover:bg-red-800 hover:text-white 
         focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500
         dark:text-red-500 dark:hover:bg-red-600
         dark:hover:text-white dark:focus:ring-red-900`,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
export function EditButton({ children, className, ...rest }: any) {
  return (
    <button
      type="button"
      className={classNames(
        `mb-2 mr-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-800`,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
export function PrimaryButton({ children, className, ...rest }: any) {
  return (
    <button
      type="button"
      className={classNames(
        `mb-2 mr-2 rounded-lg border border-primary-700 px-5 py-2.5 text-center text-sm font-medium text-primary-700 hover:bg-primary-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-primary-300 dark:border-primary-500 dark:text-primary-500 dark:hover:bg-primary-600 dark:hover:text-white dark:focus:ring-primary-800 `,
        className
      )}
      {...rest}
    >
      <div className="flex gap-2"> {children}</div>
    </button>
  );
}

export function LabelButton({ children, className, ...rest }: any) {
  return (
    <button
      type="button"
      className={classNames(
        `mb-2 mr-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700`,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
