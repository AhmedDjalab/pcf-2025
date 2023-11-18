import React, { useEffect, useState } from "react";
import "./Modal.css";
import { useTranslation } from "react-i18next";

interface DeleteConfirmationModalProps {
  onDelete: any;
  onCancel: any;
  isOpen: boolean;
  textContent?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  onDelete,
  onCancel,
  isOpen,
  textContent,
}) => {
  const [modalClass, setModalClass] = useState("modal-hide");
  const { t } = useTranslation();

  useEffect(() => {
    setModalClass((prev) => (prev ? "modal-show" : "modal-hide"));
  }, [isOpen]);

  return (
    <div
      id="popup-modal"
      tabIndex={-1}
      className={`fixed left-0 right-0 top-0 z-50 flex h-full w-full items-center justify-center bg-gray-800 bg-opacity-75 ${modalClass}`}
    >
      <div className=" my-auto mx-auto mt-30 w-80 rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            {textContent ? t(textContent) : t("DeleteModal.confirmDelete")}
          </h3>
          <button
            onClick={onDelete}
            type="button"
            className="mr-2 inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
          >
            {t("DeleteModal.yes")}
          </button>
          <button
            onClick={onCancel}
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-600"
          >
            {t("DeleteModal.no")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
