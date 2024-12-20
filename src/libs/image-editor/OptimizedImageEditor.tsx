import React, { useEffect, useMemo, useState, useCallback } from "react";
import { v4 as Uuid4 } from "uuid";
import { StageData } from "src/state/currentStageData";
import ImageEditor, { ImageEditorType } from "./ImageEditor";
import useDragAndDrop from "src/hooks/useDragAndDrop";
import useStage from "src/hooks/useStage";

function OptimizedImageEditor({
  imgUrl,
  initialStageData,
  onSaveState,
  activities,
  stageActivities,
  readOnly,
  setIsOpen,
  selectedDate, // Add this prop to track date changes
}: ImageEditorType) {
  // Memoize image loading to prevent unnecessary reloads
  const [imageData, setImageData] = useState<{
    type: string;
    id: string;
    name: string;
    src: string;
  } | null>(null);
  const stage = useStage();
  // Memoize image loading with useCallback to prevent unnecessary re-renders
  const loadImage = useCallback(() => {
    return new Promise<{ type: string; id: string; name: string; src: string }>(
      (resolve, reject) => {
        const img = new window.Image();
        img.src = imgUrl;
        img.onload = () => {
          const result = {
            type: "image",
            id: Uuid4(),
            name: "imported image",
            src: imgUrl,
          };
          resolve(result);
        };
        img.onerror = (error) => reject(error);
      }
    );
  }, [imgUrl]);

  // Use useDragAndDrop hook
  const { insertImageAtCenter } = useDragAndDrop(
    stage.stageRef,
    stage.dragBackgroundOrigin
  );

  // Optimize image loading effect
  useEffect(() => {
    // Only load image if not already loaded or imgUrl changes
    if (!imageData || imageData.src !== imgUrl) {
      loadImage()
        .then((result) => {
          setImageData(result);
          // insertImageAtCenter(result);
        })
        .catch((error) => console.error("Error loading image:", error));
    }
  }, [imgUrl, loadImage, insertImageAtCenter]);

  // Memoize initial stage data to prevent unnecessary re-renders
  const memoizedInitialStageData = useMemo(() => {
    if (!initialStageData) return null;

    // Create a normalized version of initial stage data
    return initialStageData.map((shape: StageData) => ({
      ...shape,
      key: `${shape.id}-${selectedDate?.toISOString()}`, // Add unique key based on date
    }));
  }, [initialStageData, selectedDate]);

  // Render method with optimized rendering logic
  return (
    <ImageEditor
      key={`image-editor-${selectedDate?.toISOString()}`} // Force re-render only on date change
      imgUrl={imgUrl}
      initialStageData={memoizedInitialStageData}
      onSaveState={onSaveState}
      activities={activities}
      stageActivities={stageActivities}
      readOnly={readOnly}
      setIsOpen={setIsOpen}
    />
  );
}

export default OptimizedImageEditor;
