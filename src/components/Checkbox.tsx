import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (e: any) => void;
  id: string;
  name: string;
  disabled?: boolean;
  errors?: any; // Add the 'errors' prop if you want to show error messages
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  id,
  errors,
  name,
  disabled,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          checked={checked}
          id={id}
          type="checkbox"
          value=""
          disabled={disabled}
          className={`
            h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600
            ${
              errors && errors[id]
                ? 'border-red-500 focus:border-red-500 dark:border-red-400'
                : ''
            }
          `}
          onChange={onChange}
        />
        <label
          htmlFor={id}
          className={`
            ml-2 text-sm font-medium text-gray-900 dark:text-gray-300
            ${errors && errors[name] ? 'text-red-700 dark:text-red-500' : ''}
          `}
        >
          {label}
        </label>
      </div>
      {errors && errors[name] && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
          {t(errors[name])}
        </p>
      )}
    </div>
  );
};

export default Checkbox;
