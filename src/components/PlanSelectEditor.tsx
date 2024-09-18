import React from "react";

function PlanSelectEditor({
  isOpen,
  initialData,
  exportToJson,
  closeModal,
}: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed mt-20 inset-0 z-50 flex items-center shadow-sm justify-center  bg-opacity-50">
      <div className=" relative mx-auto bg-white rounded-lg shadow-sm w-[95vh] max-w-6xl min-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="flex flex-col justify-between items-center p-4 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-800 text-black">
            Image Editor
          </h2>

          {/* <XIcon
            className="w-6 h-6"
            onClick={closeModal}
            height="2rem"
            width="2rem"
          /> */}
        </div>

        {/* Modal Body */}
        <div className="p-4">
          {/* <ImageEditorModule
            imgUrl="https://fastly.picsum.photos/id/9/5000/3269.jpg?hmac=cZKbaLeduq7rNB8X-bigYO8bvPIWtT-mh8GRXtU3vPc"
            onSaveState={(data: any) => {
              exportToJson(data);
            }}
            initialStageData={initialData}
          /> */}
        </div>
      </div>
    </div>
  );
}

export default PlanSelectEditor;
