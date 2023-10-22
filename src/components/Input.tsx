import { EyeIcon, EyeDropperIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { classNames } from "src/const/vars";

export interface IInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errors?: any;
  name: string;
  labelDir?: "inLine" | "Above";
  containerClass?: string;
}

function Input({
  id,
  name,
  placeholder,
  label,
  type,
  errors,
  labelDir = "Above",
  containerClass,
  ...rest
}: IInputProps) {
  const { t } = useTranslation();
  const [, setIsFocused] = React.useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleFocus = () => {
    setIsFocused(true);
  };
  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div
      className={classNames(
        containerClass ?? "",
        labelDir === "Above" ? "relative" : "inline-flex items-baseline  gap-4 "
      )}
    >
      {/*!! w-[30%] */}
      <label
        htmlFor={id}
        className={`
        mb-2 block w-[30%] text-sm font-medium text-gray-900 dark:text-white
         ${errors && errors[name] ? "text-red-700 dark:text-red-500" : ""}
        `}
      >
        {label}
      </label>
      <input
        type={showPassword ? "text" : type}
        id={id}
        className={`
        block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500
        ${rest.className}
        
        ${
          errors && errors[name]
            ? "block w-full rounded-lg border border-red-500  p-2.5 text-sm text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-red-500 dark:border-red-400 "
            : ""
        }
        `}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      {type === "password" && ( // Only show the toggle button for password type
        <button
          type="button"
          className="absolute right-3 top-10 h-5  w-5 text-gray-600 focus:outline-none dark:text-gray-300"
          onClick={handleTogglePassword}
        >
          {showPassword ? (
            <EyeIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <EyeDropperIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      )}
      {errors && errors[name] && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
          {t(errors[name])}
        </p>
      )}
    </div>
  );
}

export default Input;
