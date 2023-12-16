import React, { useEffect, useState } from "react";

export interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpenTrigger: boolean;
}
const Accordion = ({ title, children, isOpenTrigger }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(isOpenTrigger);
  }, [isOpenTrigger]);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="rounded-none border border-l-0 border-r-0 border-t-0 border-neutral-200 bg-white dark:border-strokedark dark:bg-boxdark">
      <h2 className="mb-0">
        <button
          className={`overflow-anchor-none hover:z-2 focus:z-3 group relative flex w-full items-center rounded-none border-0 bg-white px-5 py-4 text-left text-base text-neutral-800 transition focus:outline-none dark:border-strokedark dark:bg-boxdark dark:text-white ${
            isOpen
              ? "box-shadow:inset_0_-1px_0_rgba(229,231,235) dark:box-shadow:inset_0_-1px_0_rgba(75,85,99) bg-white text-primary dark:border-strokedark dark:bg-boxdark dark:text-primary-400"
              : "dark:box-shadow:inset_0_-1px_0_rgba(75,85,99)  text-primary dark:border-strokedark dark:bg-boxdark dark:text-primary-400"
          }`}
          type="button"
          onClick={toggleAccordion}
        >
          {title}
          <span
            className={`-mr-1 ml-auto h-5 w-5 shrink-0 transition-transform duration-200 ease-in-out group-${
              isOpen
                ? "mr-0 rotate-0  dark:rotate-0 dark:fill-blue-300"
                : "rotate-[-180deg] fill-[#336dec] dark:rotate-0 dark:fill-blue-300"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </button>
      </h2>
      {isOpen && (
        <div
          className="border-0"
          data-te-collapse-item
          aria-labelledby="flush-headingOne"
        >
          <div className="px-5 py-4">{children}</div>
        </div>
      )}
    </div>
  );
};

export default Accordion;
