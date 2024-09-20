import React from "react";
import ImageEditorModule from "src/libs/image-editor/ImageEditorModule";

import { XIcon } from "@heroicons/react/outline";
import { ClockIcon, XCircleIcon } from "@heroicons/react/24/solid";
function PlanSelectEditor({ isOpen, initialData, exportToJson, closeModal }) {
  if (!isOpen) return null;

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark fixed mt-20 inset-0 z-50 mx-auto flex items-center shadow-sm justify-center w-[90%] h-[90%] my-auto bg-opacity-50">
      <div className=" dark:bg-boxdark-2 dark:text-bodydark relative  bg-white rounded-lg shadow-sm  w-full h-full  overflow-auto">
        {/* Modal Header */}
        <div className="flex  justify-between items-center p-2 border-b border-gray-300">
          <h2 className="text-lg font-bold dark:text-white  text-gray-800 text-black">
            Plan Editor
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
          <ImageEditorModule
            imgUrl="https://fastly.picsum.photos/id/9/5000/3269.jpg?hmac=cZKbaLeduq7rNB8X-bigYO8bvPIWtT-mh8GRXtU3vPc"
            onSaveState={(data) => {
              exportToJson(data);
            }}
            initialStageData={initialData}
          />
        </div>
      </div>
    </div>
  );
}

export default PlanSelectEditor;
