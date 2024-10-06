import { Group } from "konva/lib/Group";
import { Node, NodeConfig } from "konva/lib/Node";
import { nanoid } from "nanoid";
import React from "react";
import { v4 as Uuid4 } from "uuid";

import useItem from "./useItem";
import useLocalStorage from "./useLocalStorage";
import useSelection from "./useSelection";
import useStage, { STAGE_POSITION, STAGE_SCALE } from "./useStage";
import useTransformer from "./useTransformer";
import { StageData } from "src/state/currentStageData";
import Konva from "konva";

const useHotkeyFunc = () => {
  const { removeItem, createItem, updateItem } = useItem();
  const { setValue } = useLocalStorage();

  const selectAll = (
    stage: ReturnType<typeof useStage>,
    onSelectItem: ReturnType<typeof useSelection>["onSelectItem"]
  ) => {
    const frameGroups = stage.stageRef.current
      .getChildren()[0]
      .getChildren((_item) => _item.attrs.name === "label-group")
      .map((_item) => [...((_item as Group).children ?? [])])
      .flat();
    const items = stage.stageRef.current
      .getChildren()[0]
      .getChildren(
        (_item) =>
          _item.attrs.name === "label-target" &&
          _item.attrs["data-item-type"] !== "frame"
      );
    const newSelections = [...frameGroups, ...items];
    onSelectItem(undefined, newSelections);
  };

  const copyItems = (
    selectedItems: Node<NodeConfig>[],
    setClipboard: (value: React.SetStateAction<StageData[]>) => void,
    createStageDataObject: (item: Node<NodeConfig>) => StageData
  ) => {
    const newClips = selectedItems
      .map((item) => createStageDataObject(item))
      .sort((a, b) => {
        if (a.attrs.zIndex === b.attrs.zIndex) {
          if (a.attrs.zIndex < 0) {
            return b.attrs.updatedAt - a.attrs.updatedAt;
          }
          return a.attrs.updatedAt - b.attrs.updatedAt;
        }
        return a.attrs.zIndex - b.attrs.zIndex;
      });

    setClipboard(newClips);
  };

  const pasteItems = (clipboard: StageData[]) => {
    clipboard.forEach((item) => {
      if (Object.keys(item.attrs).length === 0) {
        return;
      }
      createItem({
        id: Uuid4(),
        attrs: {
          ...item.attrs,
        },
        className: item.className,
        children: item.children,
      });
    });
  };

  const duplicateItems = (
    selectedItems: Node<NodeConfig>[],
    createStageDataObject: (item: Node<NodeConfig>) => StageData
  ) => {
    selectedItems
      .map((item) => createStageDataObject(item))
      .sort((a, b) => {
        if (a.attrs.zIndex === b.attrs.zIndex) {
          if (a.attrs.zIndex < 0) {
            return b.attrs.updatedAt - a.attrs.updatedAt;
          }
          return a.attrs.updatedAt - b.attrs.updatedAt;
        }
        return a.attrs.zIndex - b.attrs.zIndex;
      })
      .forEach((item) => {
        createItem({
          ...item,
          attrs: {
            ...item.attrs,
            x: item.attrs.x + selectedItems[0].scaleX() * 50,
            y: item.attrs.y + selectedItems[0].scaleY() * 50,
          },
        });
      });
    if (selectedItems.length > 0) {
      selectedItems[0].getStage()?.batchDraw();
    }
  };

  const deleteItems = (
    selectedItems: Node<NodeConfig>[],
    setSelectedItems: (value: React.SetStateAction<Node<NodeConfig>[]>) => void,
    transformerRef: ReturnType<typeof useTransformer>["transformerRef"]
  ) => {
    setSelectedItems([]);
    transformerRef.current?.nodes([]);
    removeItem(selectedItems.map((item) => item.id()));
  };

  const layerUp = (selectedItems: Node<NodeConfig>[]) => {
    selectedItems.forEach((item) => {
      item.moveUp();
      updateItem(item.id(), (prevData) => ({
        ...item.attrs,
        zIndex: 1,
        updatedAt: Date.now(),
      }));
    });
  };

  const layerDown = (selectedItems: Node<NodeConfig>[]) => {
    selectedItems.forEach((item) => {
      item.moveDown();

      updateItem(item.id(), (prevData) => ({
        ...item.attrs,
        zIndex: -1,
        updatedAt: Date.now(),
      }));
    });
  };

  const flipHorizontally = (selectedItems: Node<NodeConfig>[]) => {
    selectedItems.forEach((item) => {
      item.scaleX(-1 * item.scaleX());
      updateItem(item.id(), (prevData) => ({
        ...item.attrs,
        scaleX: item.scaleX(),
        updatedAt: Date.now(),
      }));
    });
  };

  const flipVertically = (selectedItems: Node<NodeConfig>[]) => {
    selectedItems.forEach((item) => {
      item.scaleY(-1 * item.scaleY());
      updateItem(item.id(), (prevData) => ({
        ...item.attrs,
        scaleY: item.scaleY(),
        updatedAt: Date.now(),
      }));
    });
  };

  const resetZoom = (stage: ReturnType<typeof useStage>) => {
    stage.stageRef.current.scale({ x: 1, y: 1 });
    stage.stageRef.current.position({ x: 0, y: 0 });
    setValue(STAGE_POSITION, { x: 0, y: 0 });
    setValue(STAGE_SCALE, { x: 1, y: 1 });
  };

  const updateImageQuality = (stage: Konva.Stage, newScale: number) => {
    stage.find("Image").forEach((imageNode: any) => {
      const image = imageNode.image() as HTMLImageElement;

      if (image.src.startsWith("data:")) {
        // For base64 images, we need to recreate the image at a higher resolution
        const width = image.width * newScale;
        const height = image.height * newScale;

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx!.drawImage(image, 0, 0, width, height);

        const newImageSrc = canvas.toDataURL("image/png", 1.0);
        const newImage = new Image();
        newImage.onload = () => {
          imageNode.image(newImage);
          imageNode.cache();
          stage.batchDraw();
        };
        newImage.src = newImageSrc;
      } else {
        // For regular images, we can simply update the scale
        imageNode.scale({ x: 1 / newScale, y: 1 / newScale });
        imageNode.cache();
      }
    });
  };

  // Debounce function to limit how often updateImageQuality is called
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Debounced version of updateImageQuality
  const debouncedUpdateImageQuality = debounce(updateImageQuality, 200);

  const zoom = (stage: ReturnType<typeof useStage>, zoomDirection: 1 | -1) => {
    const stageRef = stage.stageRef.current;
    const scaleBy = 1.1;
    const oldScale = stageRef.scaleX();

    const pointer = stageRef.getPointerPosition();

    if (!pointer) {
      return;
    }

    const mousePointTo = {
      x: (pointer.x - stageRef.x()) / oldScale,
      y: (pointer.y - stageRef.y()) / oldScale,
    };

    const newScale =
      zoomDirection > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stageRef.scale({ x: newScale, y: newScale });
    setValue(STAGE_SCALE, { x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stageRef.position(newPos);
    setValue(STAGE_POSITION, newPos);
    // Call the debounced function to update image quality
    //debouncedUpdateImageQuality(stageRef, newScale);
  };

  const undo = () => {
    // workHistory.goToPast();
  };

  const redo = () => {
    // workHistory.goToFuture();
  };

  return {
    pasteItems,
    selectAll,
    copyItems,
    deleteItems,
    duplicateItems,
    layerUp,
    layerDown,
    flipHorizontally,
    flipVertically,
    zoom,
    resetZoom,
    undo,
    redo,
  };
};

export default useHotkeyFunc;
