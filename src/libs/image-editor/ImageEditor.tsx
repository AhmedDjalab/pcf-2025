//@ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { Transformer } from "react-konva";
import { Node, NodeConfig } from "konva/lib/Node";
import { useHotkeys } from "react-hotkeys-hook";
import { nanoid } from "nanoid";
import { Button, Col, Modal, Row } from "react-bootstrap";
import Layout from "src/libs/image-editor/layout";
import SettingBar from "./settingBar";
import workModeList from "src/config/workMode.json";
import NavBar from "./navBar";
import NavBarButton from "./navBar/NavBarButton";
import View from "./view";
import Frame, { FrameProps } from "./view/frame";
import useItem from "src/hooks/useItem";

import ImageItem, { ImageItemProps } from "./view/object/image";
import useSelection from "src/hooks/useSelection";
import useTab from "src/hooks/useTab";
import useTransformer from "src/hooks/useTransformer";
import useStage from "src/hooks/useStage";
import useTool from "src/hooks/useTool";
import TextItem, { TextItemProps } from "./view/object/text";
import ShapeItem, { ShapeItemProps } from "./view/object/shape";
import IconItem, { IconItemProps } from "./view/object/icon";
import LineItem, { LineItemProps } from "./view/object/line";
import useModal from "src/hooks/useModal";
import hotkeyList from "src/config/hotkey.json";
import useHotkeyFunc from "src/hooks/useHotkeyFunc";
import useWorkHistory from "src/hooks/useWorkHistory";
import useI18n from "src/hooks/usei18n";
import useDragAndDrop from "src/hooks/useDragAndDrop";
import { useSelector } from "react-redux";
import {
  StageActivity,
  StageData,
  stageDataSelector,
} from "src/state/currentStageData";
import useStageDataList from "src/hooks/useStageDataList";
import { StageDataListItem } from "src/state/stageDataList";
import { initialStageDataList } from "src/state/initilaStageDataList";
// import "bootstrap/dist/css/bootstrap.min.css";
import { ActivityModel } from "src/types/Project";
import { GraphDataType } from "src/state/slices/graphSlice";
import { v4 as Uuid4 } from "uuid";
import ActivityTable from "./view/object/Activity/ActivityTable";
import ReadLayout from "./layout/ReadLayout";
import PolygonItem, { PolygonItemProps } from "./view/object/polygon";
import Konva from "konva";
export type FileKind = {
  "file-id": string;
  title: string;
  data: Record<string, any>[];
};
// const activities = [
//   {
//     id: "1",
//     name: "text1",
//   },
//   {
//     id: "2",
//     name: "text2",
//   },
//   {
//     id: "3",
//     name: "text3",
//   },
// ];
export type FileData = Record<string, FileKind>;

export type ImageEditorType = {
  imgUrl: string;
  onSaveState: (stageData: StageData[]) => void;
  initialStageData?: StageData[] | any;
  activities: GraphDataType[];
  readOnly?: boolean;
  stageActivities?: StageActivity[] | undefined;
};
function ImageEditor({
  imgUrl,
  initialStageData,
  onSaveState,
  activities,
  stageActivities,
  readOnly,
}: ImageEditorType) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/bootstrap/dist/css/bootstrap.min.css";
    document.head.appendChild(link);

    // Clean up to remove the Bootstrap styles when the component unmounts
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  const stageDataLsit = useSelector(stageDataSelector.selectAll);

  const [past, setPast] = useState<StageData[][]>([]);
  const [future, setFuture] = useState<StageData[][]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [image, setImage] = useState<{ [key: string]: any } | null>(null);

  const { goToFuture, goToPast, recordPast, clearHistory } = useWorkHistory(
    past,
    future,
    setPast,
    setFuture
  );
  const transformer = useTransformer();
  const { selectedItems, onSelectItem, setSelectedItems, clearSelection } =
    useSelection(transformer);
  const { tabList, onClickTab, onCreateTab, onDeleteTab } = useTab(
    transformer,
    clearHistory
  );
  const { stageData } = useItem();
  const { initializeFileDataList, updateFileData } = useStageDataList();
  const stage = useStage();
  const modal = useModal();
  const {
    deleteItems,
    copyItems,
    selectAll,
    pasteItems,
    duplicateItems,
    layerDown,
    layerUp,
    flipHorizontally,
    flipVertically,
  } = useHotkeyFunc();
  const { getTranslation } = useI18n();
  const [clipboard, setClipboard] = useState<StageData[]>([]);
  const createStageDataObject = (item: Node<NodeConfig>): StageData => {
    const { id } = item.attrs;
    const target =
      item.attrs["data-item-type"] === "frame" ? item.getParent() : item;
    return {
      id: Uuid4(),
      attrs: {
        ...(stageData.find((_item) => _item.attrs.id === id)?.attrs ?? {}),
      },
      className: target.getType(),
      children: [],
    };
  };
  const { getClickCallback } = useTool(
    stage,
    modal,
    selectedItems,
    setSelectedItems,
    transformer,
    createStageDataObject,
    onSelectItem
  );

  const currentTabId = useMemo(
    () => tabList.find((tab) => tab.active)?.id ?? null,
    [tabList]
  );

  const sortedStageData = useMemo(
    () =>
      stageData.sort((a, b) => {
        if (a.attrs.zIndex === b.attrs.zIndex) {
          if (a.attrs.zIndex < 0) {
            return b.attrs.updatedAt - a.attrs.updatedAt;
          }
          return a.attrs.updatedAt - b.attrs.updatedAt;
        }
        return a.attrs.zIndex - b.attrs.zIndex;
      }),
    [stageData]
  );

  const stageCon = useStage();

  const { alterItems, clearItems, createItem } = useItem();
  const exportShapesAsJson = () => {
    if (!stageData || stageData.length === 0) return;

    const stage = stageCon.stageRef.current;

    // Find the "sample-image" shape to use as the reference
    const sampleImage = stageData.find(
      (shape) => shape.className === "sample-image"
    );
    if (!sampleImage) {
      console.error("No 'sample-image' found for normalization.");
      return;
    }

    const imageWidth = sampleImage.attrs.width;
    const imageHeight = sampleImage.attrs.height;

    // Normalize function to adjust positions, sizes, and scales based on the "sample-image"
    const normalizeShapeData = (shape: StageData) => {
      const { x, y, width, height, scaleX, scaleY, ...restAttrs } = shape.attrs;

      if (shape.className === "sample-image") {
        // No need to normalize the "sample-image" itself
        return shape;
      }

      // Normalize position and size based on the "sample-image"
      const normalizedX = x / imageWidth;
      const normalizedY = y / imageHeight;
      const normalizedWidth = width / imageWidth;
      const normalizedHeight = height / imageHeight;

      // Normalize scale
      const normalizedScaleX = scaleX ? scaleX / (imageWidth / imageHeight) : 1;
      const normalizedScaleY = scaleY ? scaleY / (imageHeight / imageWidth) : 1;
      console.warn(
        "🚀 ~ normalizeShapeData ~ normalizedScaleX:",
        scaleX,
        scaleY,
        normalizedScaleX,
        normalizedScaleY
      );

      // Return normalized shape attributes
      return {
        ...shape,
        attrs: {
          ...restAttrs,
          x: normalizedX,
          y: normalizedY,
          width: normalizedWidth,
          height: normalizedHeight,
          scaleX: normalizedScaleX,
          scaleY: normalizedScaleY,
        },
      };
    };

    // Normalize all shapes in stageData
    const normalizedStageData = stageData.map(normalizeShapeData);
    onSaveState(normalizedStageData);
    //return normalizedStageData;
  };

  const importShapesFromJson = () => {
    if (initialStageData && Array.isArray(initialStageData)) {
      // Get the "sample-image" dimensions from the imported data
      const sampleImage = initialStageData.find(
        (shape) => shape.className === "sample-image"
      );
      if (!sampleImage) {
        console.error("No 'sample-image' found in the imported data.");
        return;
      }

      const imageWidth = sampleImage.attrs.width;
      const imageHeight = sampleImage.attrs.height;

      // Function to denormalize the shape data relative to the "sample-image"
      const denormalizeShapeData = (shape: StageData) => {
        const { x, y, width, height, scaleX, scaleY, ...restAttrs } =
          shape.attrs;
        console.warn("this is attris ", shape);
        if (shape.className === "sample-image") {
          // No need to denormalize the "sample-image" itself
          return shape;
        }

        // Denormalize position and size relative to the "sample-image"
        const denormalizedX = x * imageWidth;
        const denormalizedY = y * imageHeight;
        const denormalizedWidth = width * imageWidth;
        const denormalizedHeight = height * imageHeight;

        // Denormalize scale
        const denormalizedScaleX = scaleX
          ? scaleX * (imageWidth / imageHeight)
          : 1;
        const denormalizedScaleY = scaleY
          ? scaleY * (imageHeight / imageWidth)
          : 1;

        console.warn(
          "🚀 ~ DnormalizeShapeData ~ DnormalizedScaleX:",
          scaleX,
          scaleY,
          denormalizedScaleX,
          denormalizedScaleY
        );

        // Return denormalized shape attributes
        const newShape = {
          ...shape,
          attrs: {
            ...restAttrs,
            x: denormalizedX,
            y: denormalizedY,
            width: denormalizedWidth,
            height: denormalizedHeight,
            scaleX: denormalizedScaleX,
            scaleY: denormalizedScaleY,
          },
        };
        console.warn("🚀 ~ denormalizeShapeData ~ newShape:", newShape);

        return newShape;
      };

      // Dispatch action to clear the current stage items
      /// clearItems();

      // Denormalize and create items for each shape in the parsed data
      initialStageData.forEach((shape) => {
        const denormalizedShape = denormalizeShapeData(shape);

        createItem(denormalizedShape);
      });
    }
  };

  //? img load
  const { insertImageAtCenter } = useDragAndDrop(
    stage.stageRef,
    stage.dragBackgroundOrigin
  );
  useEffect(() => {
    setLoading(true);

    if (initialStageData) {
      setLoading(false);
      return;
    }
    // Create a new Image object
    const img = new window.Image();
    img.src = imgUrl;

    // Once the image loads, set the image in the state
    img.onload = () => {
      const result = {
        type: "image",
        id: Uuid4(),
        name: "imported image",
        src: imgUrl, // Use the passed image URL directly
      };
      insertImageAtCenter(result);
      setImage(result);
    };

    // Handle image loading errors
    img.onerror = (error) => {
      console.error("Error loading image:", error);
    };

    setLoading(false);
  }, [imgUrl, setLoading]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     insertImageAtCenter(image);
  //   };
  //   if (!image) {
  //     return;
  //   }
  //   console.warn("this is windows scae");
  //   stage.stageRef?.current.remove();
  //   // Call the function once to insert at center initially

  //   // Add the event listener for window resize
  //   window.addEventListener("resize", handleResize);
  //   stage.stageRef.current.batchDraw();
  //   // Cleanup the event listener when component unmounts
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, [image, window.innerWidth, window.innerHeight]);
  //?----

  const header = <></>;

  const navBar = (
    <NavBar>
      {workModeList.map((data) => (
        <NavBarButton
          key={`navbar-${data.id}`}
          data={data}
          stage={stage}
          onClick={getClickCallback(data.id)}
        />
      ))}
    </NavBar>
  );

  const hotkeyModal = (
    <Modal show={modal.displayModal} onHide={modal.closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Keyboard Shortcut</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {hotkeyList.map((hotkey) => (
          <Col key={hotkey.name}>
            <h6>{getTranslation("hotkey", hotkey.id, "name")}</h6>
            <Row className="justify-content-end" xs={4}>
              {hotkey.keys.map((key, idx) => (
                <React.Fragment key={hotkey.name + key}>
                  {idx !== 0 && "+"}
                  <Col xs="auto" className="align-items-center">
                    <Button disabled>{key}</Button>
                  </Col>
                </React.Fragment>
              ))}
            </Row>
          </Col>
        ))}
      </Modal.Body>
    </Modal>
  );

  const settingBar = (
    <SettingBar
      selectedItems={selectedItems}
      clearSelection={clearSelection}
      stageRef={stage.stageRef}
      activities={activities}
      saveChanges={exportShapesAsJson}
    />
  );

  const activityTable = <ActivityTable activities={stageActivities!} />;

  const renderObject = (item: StageData) => {
    switch (item.attrs["data-item-type"]) {
      case "frame":
        return (
          <Frame
            key={`frame-${item.id}`}
            data={item as FrameProps["data"]}
            onSelect={!readOnly && onSelectItem}
            readOnly={readOnly}
          />
        );
      case "image":
        return (
          <ImageItem
            key={`image-${item.id}`}
            data={item as ImageItemProps["data"]}
            onSelect={() => {}}
          />
        );
      case "text":
        return (
          <TextItem
            key={`image-${item.id}`}
            data={item as TextItemProps["data"]}
            transformer={transformer}
            onSelect={!readOnly && onSelectItem}
            readOnly={readOnly}
          />
        );
      case "shape":
        return (
          <ShapeItem
            key={`shape-${item.id}`}
            data={item as ShapeItemProps["data"]}
            transformer={transformer}
            onSelect={!readOnly && onSelectItem}
            readOnly={readOnly}
          />
        );
      case "icon":
        return (
          <IconItem
            key={`icon-${item.id}`}
            data={item as IconItemProps["data"]}
            transformer={transformer}
            onSelect={!readOnly && onSelectItem}
            readOnly={readOnly}
          />
        );
      case "line":
        return (
          <LineItem
            key={`line-${item.id}`}
            data={item as LineItemProps["data"]}
            transformer={transformer}
            onSelect={!readOnly && onSelectItem}
            readOnly={readOnly}
          />
        );
      case "polygon":
        return (
          <PolygonItem
            key={`polygon-${item.id}`}
            data={item as PolygonItemProps["data"]}
            transformer={transformer}
            onSelect={!readOnly && onSelectItem}
            readOnly={readOnly}
          />
        );
      default:
        return null;
    }
  };

  useHotkeys(
    "shift+up",
    (e) => {
      e.preventDefault();
      layerUp(selectedItems);
    },
    {},
    [selectedItems]
  );

  useHotkeys(
    "shift+down",
    (e) => {
      e.preventDefault();
      layerDown(selectedItems);
    },
    {},
    [selectedItems]
  );

  useHotkeys(
    "ctrl+d",
    (e) => {
      e.preventDefault();
      duplicateItems(selectedItems, createStageDataObject);
    },
    {},
    [selectedItems, stageData]
  );

  useHotkeys(
    "ctrl+c",
    (e) => {
      e.preventDefault();
      copyItems(selectedItems, setClipboard, createStageDataObject);
    },
    {},
    [selectedItems, stageData, clipboard]
  );

  useHotkeys(
    "ctrl+a",
    (e) => {
      e.preventDefault();
      selectAll(stage, onSelectItem);
    },
    {},
    [selectedItems]
  );

  useHotkeys(
    "ctrl+v",
    (e) => {
      e.preventDefault();
      pasteItems(clipboard);
    },
    {},
    [clipboard]
  );

  useHotkeys(
    "ctrl+z",
    (e) => {
      e.preventDefault();
      goToPast();
    },
    {},
    [goToPast]
  );

  useHotkeys(
    "ctrl+y",
    (e) => {
      e.preventDefault();
      goToFuture();
    },
    {},
    [goToFuture]
  );

  useHotkeys(
    "shift+h",
    (e) => {
      e.preventDefault();
      flipHorizontally(selectedItems);
    },
    {},
    [selectedItems]
  );

  useHotkeys(
    "shift+v",
    (e) => {
      e.preventDefault();
      flipVertically(selectedItems);
    },
    {},
    [selectedItems]
  );

  useHotkeys(
    "backspace",
    (e) => {
      e.preventDefault();
      deleteItems(selectedItems, setSelectedItems, transformer.transformerRef);
    },
    { enabled: Boolean(selectedItems.length) },
    [selectedItems, transformer.transformerRef.current]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", (e) => {
      e.preventDefault();
      e.returnValue = "";
    });
    onCreateTab(undefined, initialStageDataList[0] as StageDataListItem);
    initializeFileDataList([]);
    stage.stageRef.current.setPosition({
      x: Math.max(Math.ceil(stage.stageRef.current.width() - 1280) / 2, 0),
      y: Math.max(Math.ceil(stage.stageRef.current.height() - 760) / 2, 0),
    });
    if (initialStageData) importShapesFromJson();
    stage.stageRef.current.batchDraw();
  }, []);

  useEffect(() => {
    if (currentTabId) {
      updateFileData({
        id: currentTabId,
        data: stageData,
      });
    }
    recordPast(stageData);
  }, [stageData]);

  useEffect(() => {
    if (stage.stageRef?.current) {
      stage.stageRef.current.batchDraw(); // Redraw the stage
    }
  }, [selectedItems, transformer]);

  return loading ? (
    <div>....loading</div>
  ) : readOnly ? (
    <ReadLayout settingBar={activityTable}>
      {/* {hotkeyModal} */}
      <View onSelect={() => {}} stage={stage}>
        {stageData.length
          ? sortedStageData.map((item) => renderObject(item))
          : null}

        {/* <Transformer
          ref={transformer.transformerRef}
          keepRatio
          shouldOverdrawWholeArea
          boundBoxFunc={(_, newBox) => newBox}
          onTransformEnd={transformer.onTransformEnd}
        /> */}
      </View>
    </ReadLayout>
  ) : (
    <Layout header={header} navBar={navBar} settingBar={settingBar}>
      {hotkeyModal}
      <View onSelect={onSelectItem} stage={stage}>
        {stageData.length
          ? sortedStageData.map((item) => renderObject(item))
          : null}

        <Transformer
          ref={transformer.transformerRef}
          keepRatio
          shouldOverdrawWholeArea
          boundBoxFunc={(_, newBox) => newBox}
          onTransformEnd={transformer.onTransformEnd}
        />
      </View>
    </Layout>
  );
}

export default ImageEditor;
