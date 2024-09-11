//@ts-nocheck

// import { FormikErrors } from 'formik';
// import React, { ChangeEvent, useEffect, useState } from 'react';
// import Datepicker from 'tailwind-datepicker-react';

// import moment from 'moment';

// export interface IDatePickerProps
//   extends React.InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   errors?: FormikErrors<Date>;
//   name: string;
//   onChange: any;
//   options: DatePickerOptions;
//   touched?: any;
//   value: any;
//   defaultDate?: Date;
// }

// interface DatePickerOptions {
//   title?: string;
//   autoHide?: boolean;
//   todayBtn?: boolean;
//   clearBtn?: boolean;
//   maxDate?: Date;
//   minDate?: Date;
//   theme?: {
//     background?: string;
//     todayBtn?: string;
//     clearBtn?: string;
//     icons?: string;
//     text?: string;
//     disabledText?: string;
//     input?: string;
//     inputIcon?: string;
//     selected?: string;
//   };
//   icons?: {
//     prev?: () => React.ReactElement;
//     next?: () => React.ReactElement;
//   };
//   datepickerClassNames?: string;
//   defaultDate?: string | Date;
//   language?: string;
// }

// const DatePickerDefault = ({
//   id,
//   name,
//   placeholder,
//   label,
//   errors,
//   options,
//   onChange,
//   touched,
//   defaultDate,
//   ...rest
// }: IDatePickerProps) => {
//   const [showDate, setShow] = React.useState<boolean>(false);

//   const handleIssuedClose = (state: boolean) => {
//     setShow(state);
//   };

//   return (
//     <div className="relative">
//       <label
//         htmlFor={id}
//         className={`
//     mb-2 block text-sm font-medium text-gray-900 dark:text-white
//      ${errors ? 'text-red-700 dark:text-red-500' : ''}
//     `}
//       >
//         {label}
//       </label>
//       <Datepicker
//         id={id}
//         name={name}
//         options={options}
//         onChange={onChange}
//         show={showDate}
//         setShow={handleIssuedClose}
//       />
//       <>
//         {errors && (
//           <p className="mt-2 text-sm text-red-600 dark:text-red-500">
//             {errors ? <>{errors}</> : null}
//           </p>
//         )}
//       </>
//     </div>
//   );
// };

// export default DatePickerDefault;
// // theme: {
// //   input: ` ${
// //     errors.issueDate
// //       ? 'text-red-700 dark:text-red-500 bg-red-300 dark:bg-red-300'
// //       : undefined
// //   }`,
// // },
// // const DatePicker = ({
// //   id,
// //   name,
// //   placeholder,
// //   label,
// //   errors,
// //   options,
// //   onChange,
// //   touched,
// //   ...rest
// // }: IDatePickerProps) => {
// //   const [showDate, setShow] = React.useState<boolean>(false);
// //   const handleIssuedClose = (state: boolean) => {
// //     setShow(state);
// //   };

// //   useEffect(() => {
// //     const datepickerEl = document.getElementById('datepickerId');
// //     new Datepicker(datepickerEl, {
// //       // options
// //     });
// //   }, []);

// //   console.log('this is defaitl ', options.defaultDate);
// //   return (
// //     <div className="relative">
// //       <label
// //         htmlFor={id}
// //         className={`
// //     mb-2 block text-sm font-medium text-gray-900 dark:text-white
// //      ${errors ? 'text-red-700 dark:text-red-500' : ''}
// //     `}
// //       >
// //         {label}
// //       </label>
// //       <Datepicker
// //         id={id}
// //         name={name}
// //         // options={options}
// //         // onChange={onChange}
// //         show={showDate}
// //         setShow={handleIssuedClose}
// //         options={{
// //           ...options,
// //           defaultDate: options.defaultDate || null, // Set the default value if it exists
// //         }}
// //         value={options.defaultDate || null} // Pass the default value to the Datepicker
// //         onChange={onChange} // Use
// //       />
// //       <>
// //         {errors && (
// //           <p className="mt-2 text-sm text-red-600 dark:text-red-500">
// //             {errors ? <>{errors}</> : null}
// //           </p>
// //         )}
// //       </>
// //     </div>
// //   );
// // };

// // export default DatePicker;
import React, { useEffect, useRef, useState } from "react";
import Datepicker from "tailwind-datepicker-react";
import moment from "moment";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

export interface IDatePickerProps {
  label?: string;
  errors?: string;
  name: string;
  onChange: (date: Date) => void;
  options?: DatePickerOptions;
  touched?: any;
  value: Date | null;
  defaultDate?: Date;
  id: string;
  disabled?: boolean;
  containerClass?: string;
  labelDir?: "inLine" | "Above";
}

interface DatePickerOptions {
  title?: string;
  autoHide?: boolean;
  todayBtn?: boolean;
  clearBtn?: boolean;
  maxDate?: Date;
  minDate?: Date;
  theme?: {
    background?: string;
    todayBtn?: string;
    clearBtn?: string;
    icons?: string;
    text?: string;
    disabledText?: string;
    input?: string;
    inputIcon?: string;
    selected?: string;
  };
  icons?: {
    prev?: () => React.ReactElement;
    next?: () => React.ReactElement;
  };
  datepickerClassNames?: string;
  defaultDate?: string | Date;
  language?: string;
}

const DatePickerDefault = ({
  id,
  name,
  label,
  errors,
  onChange,
  value,
  disabled,
  labelDir = "Above",
  defaultDate,
  containerClass,
}: IDatePickerProps) => {
  const { t, i18n } = useTranslation();
  const [showDate, setShowDate] = useState<boolean>(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const options = {
    defaultDate: defaultDate,
    language: i18n.language,
  };
  const handleDateChange = (selectedDate: Date) => {
    onChange(selectedDate);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDate(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  const formatDate = (date: Date | null) => {
    return date ? moment(date).format("YYYY-MM-DD") : "";
  };

  const inputClass = classNames(
    "block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500",
    {
      "text-red-700 dark:text-red-500 bg-red-300 dark:bg-red-300": errors,
    }
  );

  return (
    <div
      className={classNames(
        containerClass ?? "",
        labelDir == "Above"
          ? "relative"
          : " relative inline-flex w-full items-baseline  gap-4 "
      )}
      ref={datePickerRef}
    >
      <label
        htmlFor={id}
        className={`
          mb-2 block w-[30%] text-sm font-medium text-gray-900 dark:text-white
          ${errors ? "text-red-700 dark:text-red-500" : ""}
        `}
      >
        {label}
      </label>

      <Datepicker
        disabled={disabled}
        options={options}
        onChange={handleDateChange}
        show={disabled ? false : showDate}
        setShow={setShowDate}
      >
        <div className="relative col-span-2 grid w-full py-2">
          {/* Custom input */}
          <input
            type="text"
            className={inputClass}
            value={formatDate(value)}
            onFocus={() => setShowDate(true)}
            readOnly
          />
        </div>
      </Datepicker>

      {errors && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-500">
          {t(errors)}
        </p>
      )}
    </div>
  );
};

export default DatePickerDefault;
