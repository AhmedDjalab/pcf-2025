import React, { useState } from "react";
import { WidgetIDList } from ".";
import useI18n from "src/hooks/usei18n";

export type WidgetKind = {
  id: WidgetIDList;
  name: string;
  [key: string]: any;
};

type WidgetProps = {
  data: WidgetKind;
  children: React.ReactNode;
};

const Widget: React.FC<WidgetProps> = ({ data, children }) => {
  const { getTranslation } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen((prev) => !prev);

  return (
    <div
      className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl"
      key={data.id}
    >
      {/* Header */}
      <button
        onClick={toggleAccordion}
        className="flex items-center justify-between w-full px-4 py-3 font-medium text-left text-gray-800 transition-colors hover:bg-gray-50"
      >
        <span>{getTranslation("widget", data.id, "name")}</span>

        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Body */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[999px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden bg-red-50`}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Widget;
