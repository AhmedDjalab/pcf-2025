//@ts-nocheck

import React, { ChangeEvent, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { classNames } from "./shared/Utils";

interface Option {
  id: number;
  name: string;
}

interface DropdownProps extends React.InputHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: any[];
  optionValue?: string;
  optionLabel?: string;
  defaultValue?: any;
  value?: any;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string | undefined; // Add the 'error' prop for Formik/Yup error messages

  labelDir?: "inLine" | "Above";
  containerClass?: string;
  labelClassName?: string;
}

const Dropdown = ({
  label,
  options,
  value,
  onChange,
  optionValue,
  optionLabel,
  defaultValue,
  labelDir = "Above",
  containerClass,
  labelClassName,
  error, // Add the 'error' prop here
  ...rest
}: DropdownProps) => {
  const { t } = useTranslation();
  let selectedOption;
  if (value && options) {
    selectedOption = options.find(
      (option) => option[optionValue ?? "id"] === value
    );
  }
  const selectDefaultLabel = useMemo(
    () => <option value="">{t("selectOption")}</option>,
    [t]
  );
  const selectedValue = selectedOption
    ? selectedOption[optionValue ?? "id"]
    : "";

  return (
    <div
      className={classNames(
        containerClass ?? "",
        labelDir == "Above"
          ? "relative"
          : " relative inline-flex w-full items-baseline  gap-4 "
      )}
    >
      <label
        htmlFor={rest.id}
        className={classNames(
          labelClassName ?? "",
          `
        mb-2 block w-[30%] pl-3 text-sm font-medium
     
        ${
          error
            ? "border-red-500 text-red-700 dark:text-red-500"
            : "text-gray-900 dark:text-white"
        }
        `
        )}
      >
        {label}
      </label>
      <select
        {...rest}
        onChange={onChange}
        className={`
        block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500
        ${error ? "border-red-500 dark:border-red-500" : ""}
        `}
        value={value}
      >
        {selectDefaultLabel}
        {options.map((option) => (
          <option key={option.id} value={option[optionValue ?? "id"]}>
            {option[optionLabel ?? "name"]}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
          {t(error)}
        </p>
      )}
    </div>
  );
};

export default Dropdown;
