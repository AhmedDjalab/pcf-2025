import React, { useEffect } from "react";
import ImageEditorModule from "src/libs/image-editor/ImageEditorModule";

import { XIcon } from "@heroicons/react/outline";
import { ClockIcon, XCircleIcon } from "@heroicons/react/24/solid";
import ImageEditor from "./libs/image-editor/ImageEditor";
import { useTranslation } from "react-i18next";
function PlanSelectEditor({
  isOpen,
  initialData,
  exportToJson,
  closeModal,
  imgUrl,
  imgBlob,
  activities,
  setIsOpen,
}) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark fixed mt-20 inset-0 z-50 mx-auto flex items-center shadow-sm justify-center w-[90%] h-[90%] my-auto bg-opacity-50">
      <div className="relative w-full h-full overflow-auto bg-white rounded-lg shadow-sm dark:bg-boxdark-2 dark:text-bodydark">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-300">
          <h2 className="text-lg font-bold text-black text-gray-800 dark:text-white">
            {t("PlanEditorPopUp")}
          </h2>

          <XCircleIcon
            className="w-6 h-6"
            onClick={closeModal}
            height="2rem"
            width="2rem"
          />
        </div>

        {/* Modal Body */}
        <div className="p-4">
          <ImageEditor
            imgUrl={imgUrl}
            onSaveState={exportToJson}
            initialStageData={initialData}
            // imgBlob={imgBlob}
            activities={activities}
            setIsOpen={setIsOpen}
          />
        </div>
      </div>
    </div>
  );
}

export default PlanSelectEditor;
