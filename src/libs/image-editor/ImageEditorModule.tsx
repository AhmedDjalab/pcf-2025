// ImageEditorModule.tsx
import React from "react";

import ImageEditor from "./ImageEditor";
import { StageData } from "src/state/currentStageData";

interface ImageEditorModuleProps {
  imgUrl: string;
  initialStageData: StageData[];
  onSaveState: (data: StageData[]) => void;
  userPreferredLanguage?: string;
}

const ImageEditorModule: React.FC<ImageEditorModuleProps> = ({
  imgUrl,
  initialStageData,
  onSaveState,
  userPreferredLanguage = "en",
}) => {
  return (
    // <ImageEditor
    //   imgUrl={imgUrl}
    //   onSaveState={onSaveState}
    //   initialStageData={initialStageData}
    // />
    <></>
  );
};

export default ImageEditorModule;
