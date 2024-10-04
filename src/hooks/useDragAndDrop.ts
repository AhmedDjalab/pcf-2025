import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { MutableRefObject, useCallback } from "react";

import { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";
import { Group } from "konva/lib/Group";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { v4 as Uuid4 } from "uuid";

import useItem from "./useItem";

import TRIGGER from "../config/trigger";
import { decimalUpToSeven } from "src/libs/image-editor/util/decimalUpToSeven";
import { DropCallback } from "src/libs/image-editor/util/eventHandler/dragAndDrop";
import { getFramePos } from "src/libs/image-editor/view/frame";
import { StageData } from "src/state/currentStageData";
import { Stage } from "konva/lib/Stage";

const useDragAndDrop = (
  stageRef: MutableRefObject<Konva.Stage>,
  dragBackgroudOrigin: MutableRefObject<Vector2d>
) => {
  const { createItem, updateItem } = useItem();

  const insertFrame = (e: DragEvent, data: { [key: string]: any }) => {
    const position = getFramePos(stageRef.current, e, data.width, data.height);
    const newFrame: StageData = {
      id: Uuid4(),
      attrs: {
        name: "label-target",
        "data-item-type": "frame",
        "data-frame-type": data["data-frame-type"],
        width: data.width,
        height: data.height,
        fill: "#ffffff",
        x: position.x,
        y: position.y,
        zIndex: 0,
        brightness: 0,
        updatedAt: Date.now(),
      },
      className: "sample-frame",
      children: [],
    };
    createItem(newFrame);
  };

  const insertImage = (e: DragEvent, data: { [key: string]: any }) => {
    const imageSrc = new Image();
    let source = data.src;

    source = data.src;

    imageSrc.onload = () => {
      let width;
      let height;
      if (imageSrc.width > imageSrc.height) {
        width = decimalUpToSeven(512);
        height = decimalUpToSeven(width * (imageSrc.height / imageSrc.width));
      } else {
        height = decimalUpToSeven(512);
        width = decimalUpToSeven(height * (imageSrc.width / imageSrc.height));
      }
      const position = getFramePos(stageRef!.current!, e, width, height);
      const newImage: StageData = {
        id: Uuid4(),
        attrs: {
          name: "label-target",
          "data-item-type": "image",
          x: position.x,
          y: position.y,
          width,
          height,
          src: data.src,
          zIndex: 0,
          brightness: 0,
          _filters: ["Brighten"],
          updatedAt: Date.now(),
        },
        className: "sample-image",
        children: [],
      };

      createItem(newImage);
    };
    imageSrc.src = source;
  };
  // const insertImageAtCenter = async (imgUrl: string) => {
  //   const imageSrc = new Image();
  //   imageSrc.src = imgUrl;

  //   try {
  //     // Use HTMLImageElement.decode() to load and decode the image
  //     await imageSrc.decode();

  //     // Calculate image dimensions while keeping the aspect ratio
  //     const aspectRatio = imageSrc.width / imageSrc.height;
  //     let width = 800;
  //     let height = 800;

  //     if (aspectRatio > 1) {
  //       // Landscape orientation
  //       height = width / aspectRatio;
  //     } else {
  //       // Portrait or square orientation
  //       width = height * aspectRatio;
  //     }

  //     // Get the stage container dimensions
  //     const stage = stageRef.current;
  //     if (!stage) {
  //       return;
  //     }

  //     const stageWidth = stage.width();
  //     const stageHeight = stage.height();

  //     // Calculate position to center the image on the stage
  //     const position = {
  //       x: (stageWidth - width) / 2,
  //       y: (stageHeight - height) / 2,
  //     };

  //     // Create the new image object
  //     const newImage: StageData = {
  //       id: nanoid(),
  //       attrs: {
  //         name: "label-target",
  //         "data-item-type": "image",
  //         x: position.x,
  //         y: position.y,
  //         width,
  //         height,
  //         src: imgUrl,
  //         draggable: false,
  //         zIndex: 0,
  //         brightness: 0,
  //         _filters: ["Brighten"],
  //         updatedAt: Date.now(),
  //       },
  //       className: "sample-image",
  //       children: [],
  //     };

  //     // Insert the new image in the stage
  //     createItem(newImage);
  //   } catch (error) {
  //     console.error("Failed to load the image:", error);
  //   }
  // };
  const insertImageAtCenter = (data: { [key: string]: any }) => {
    const imageSrc = new Image();
    let source = data.src;

    imageSrc.onload = () => {
      let width;
      let height;

      // Calculate image dimensions while keeping the aspect ratio
      if (imageSrc.width > imageSrc.height) {
        width = decimalUpToSeven(800);
        height = decimalUpToSeven(width * (imageSrc.height / imageSrc.width));
      } else {
        height = decimalUpToSeven(800);
        width = decimalUpToSeven(height * (imageSrc.width / imageSrc.height));
      }

      // Get the stage container dimensions
      const stage = stageRef.current!;
      const stageParent = stageRef.current.parent;
      const stageWidth = stage.width();
      const stageHeight = stage.height();

      // Calculate position to center the image on the stage
      const position = {
        x: (stageWidth - width) / 2,
        y: (stageHeight - height) / 2,
      };

      // Create the new image object
      const newImage: StageData = {
        id: Uuid4(),
        attrs: {
          name: "label-target",
          "data-item-type": "image",
          x: 10, // Centered x position: ;
          y: 10, // Centered y position: ;
          width: width,
          height: height,
          src: data.src,
          draggable: false,
          zIndex: 0,
          brightness: 0,
          _filters: ["Brighten"],
          updatedAt: Date.now(),
        },
        className: "sample-image",
        children: [],
      };

      // Insert the new image in the stage
      createItem(newImage);
    };

    // Set the image source to trigger the onload event
    imageSrc.src = source;
  };

  const insertText = (e: DragEvent, data: { [key: string]: any }) => {
    const position = getFramePos(stageRef.current, e, data.width, data.height);
    var stageId = Uuid4();
    const newText: StageData = {
      id: stageId,
      attrs: {
        id: stageId,
        name: "label-target",
        "data-item-type": "text",
        width: data.text
          .split("")
          .reduce(
            (acc: number, curr: string) =>
              curr.charCodeAt(0) >= 32 && curr.charCodeAt(0) <= 126
                ? acc + data.fontSize * (3 / 5)
                : acc + data.fontSize,
            0
          ),
        height: data.height,
        fill: "#00000",
        x: position.x,
        y: position.y,
        fontSize: data.fontSize,
        fontFamily: data.fontFamily,
        text: data.text,
        textAlign: "left",
        verticalAlign: "top",
        zIndex: 0,
        brightness: 0,
        updatedAt: Date.now(),
      },
      className: "sample-text",
      children: [],
    };
    createItem(newText);
  };

  const insertShape = (e: DragEvent, data: { [key: string]: any }) => {
    const width = Math.sqrt(data.radius);
    const position = getFramePos(stageRef.current, e, width, width);
    var stageId = Uuid4();
    const newShape: StageData = {
      id: stageId,
      attrs: {
        id: stageId,
        name: "label-target",
        "data-item-type": "shape",
        fill: "#00000",
        x: position.x,
        y: position.y,
        width,
        height: width,
        sides: data.sides,
        radius: data.radius,
        zIndex: 0,
        brightness: 0,
        updatedAt: Date.now(),
        scaleX: 1,
        scaleY: 1,
      },
      className: "sample-shape",
      children: [],
    };
    createItem(newShape);
  };

  const insertIcon = (e: DragEvent, data: { [key: string]: any }) => {
    const position = getFramePos(stageRef.current, e, 100, 100);
    const newIcon: StageData = {
      id: Uuid4(),
      attrs: {
        name: "label-target",
        "data-item-type": "icon",
        width: 100,
        height: 100,
        fill: "#00000",
        x: position.x,
        y: position.y,
        icon: data.icon,
        brightness: 0,
        zIndex: 0,
        updatedAt: Date.now(),
        scaleX: 1,
        scaleY: 1,
      },
      className: "sample-icon",
      children: [],
    };
    createItem(newIcon);
  };

  const insertLine = (e: DragEvent, data: { [key: string]: any }) => {
    const position = getFramePos(stageRef.current, e, 100, 100);

    if (data.name.indexOf("polygon") !== -1) {
      const initialPoints = [position.x, position.y];
      console.warn("🚀 ~ insertLine ~ initialPoints:", initialPoints);
      var stageId = Uuid4();
      const newPolyline: StageData = {
        id: stageId,
        attrs: {
          id: stageId,
          name: "label-target",
          "data-item-type": "polygon",
          // stroke: "#00000",
          x: position.x,
          y: position.y,
          radius: 10,
          fill: "#00FF00",
          stroke: "#000000",
          strokeWidth: 2,
          draggable: true,
          zIndex: 0,
          brightness: 0,
          updatedAt: Date.now(),
          scaleX: 1,
          scaleY: 1,
        },
        className: "sample-polygon",
        children: [],
      };

      createItem(newPolyline);
      return;
    }

    const curvePoints =
      data.name.indexOf("curve") !== -1
        ? data.name.indexOf("one") !== -1
          ? [110, -10] // One-curve line
          : [80, -10, 10, 110] // Two-curve line
        : [];

    console.error("🚀 ~ insertLine ~ curvePoints:", curvePoints);
    const newLine: StageData = {
      id: Uuid4(),
      attrs: {
        name: "label-target",
        "data-item-type": "line",
        stroke: "#00000",
        x: position.x,
        y: position.y,
        width: 100,
        height: 100,
        points: [0, 0, ...curvePoints, 100, 100],

        arrow: data.name.indexOf("arrow") !== -1,
        curve:
          data.name.indexOf("curve") !== -1 ||
          data.name.indexOf("u-shape-line") !== -1,
        zIndex: 0,
        brightness: 0,
        updatedAt: Date.now(),
        scaleX: 1,
        scaleY: 1,
      },
      className: "sample-line",
      children: [],
    };
    createItem(newLine);
  };

  const onDropOnStage: DropCallback = (dragSrc, e) => {
    if (!stageRef.current) {
      return;
    }
    const { trigger, ...data } = dragSrc;

    data.id = Uuid4();
    switch (trigger) {
      case TRIGGER.INSERT.FRAME:
        return insertFrame(e, data);
      case TRIGGER.INSERT.IMAGE:
        return insertImage(e, data);
      case TRIGGER.INSERT.TEXT:
        return insertText(e, data);
      case TRIGGER.INSERT.SHAPE:
        return insertShape(e, data);
      case TRIGGER.INSERT.ICON:
        return insertIcon(e, data);
      case TRIGGER.INSERT.LINE:
        return insertLine(e, data);
      default:
    }
  };

  const getItemsInThisFrame = (frame: Node<NodeConfig>) => {
    const stage = frame.getStage();
    if (!stage) {
      return;
    }
    const items = stage
      .getChildren()[0]
      .getChildren(
        (_item) =>
          _item.attrs.name === "label-target" &&
          _item.attrs["data-item-type"] !== "frame"
      )
      .filter((_item) => isInFrame(frame, _item));
    return items;
  };

  const checkIsInFrame = (item: Node<NodeConfig>) => {
    const stage = item.getStage();
    if (!stage) {
      return;
    }
    const frameGroups = stage
      .getChildren()[0]
      .getChildren((_item) => _item.attrs.name === "label-group");
    const frame = frameGroups.find((_item) => {
      const targetFrame = (_item as Group).findOne("Rect");
      if (!targetFrame) {
        return false;
      }
      return isInFrame(targetFrame, item);
    });
    if (frame) {
      (frame as Group).add(item as Shape<ShapeConfig>);
      (frame as Group).getLayer()?.batchDraw();
      return true;
    }
    return false;
  };

  const moveToLayer = (item: Shape<ShapeConfig>) => {
    const newParent = item.getLayer();
    item.getParent().children =
      (item.getParent().children as Node<NodeConfig>[])?.filter(
        (_item) => _item.id() !== item.id()
      ) ?? item.getParent().children;
    if (newParent) {
      newParent.add(item);
    }
    item.getLayer()?.batchDraw();
  };

  const onDragMoveFrame = useCallback((e: KonvaEventObject<DragEvent>) => {
    if (checkIsInFrame(e.target)) {
      console.log(
        "🚀 ~ onDragMoveFrame ~ checkIsInFrame:",
        checkIsInFrame(e.target)
      );
      return;
    }
    if (e.target.getLayer() !== e.target.getParent()) {
      moveToLayer(e.target as Shape<ShapeConfig>);
      console.log(
        "🚀 ~ onDragMoveFrame ~ checkIsInFrame:",
        checkIsInFrame(e.target)
      );
    }
  }, []);

  const onDragEndFrame = (e: KonvaEventObject<DragEvent>) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
    console.log("this is event onDragEndFrame", e.target.attrs);
    updateItem(e.target.id(), () => ({
      ...e.target.attrs,
    }));
    e.target.getLayer()?.batchDraw();
  };

  return {
    onDropOnStage,
    checkIsInFrame,
    getItemsInThisFrame,
    onDragMoveFrame,
    onDragEndFrame,
    moveToLayer,
    insertImageAtCenter,
  };
};

export default useDragAndDrop;

const isInFrame = (targetFrame: Node<NodeConfig>, item: Node<NodeConfig>) => {
  const x = item.position().x;
  const y = item.position().y;
  const width = item.size().width;
  const height = item.size().height;
  const position = {
    x,
    y,
  };
  const size = {
    width: width * item.scaleX(),
    height: height * item.scaleY(),
  };
  return (
    (position.x >= targetFrame.x() &&
      position.x <= targetFrame.x() + targetFrame.width() &&
      position.y >= targetFrame.y() &&
      position.y <= targetFrame.y() + targetFrame.height()) ||
    (position.x + size.width >= targetFrame.x() &&
      position.x + size.width <= targetFrame.x() + targetFrame.width() &&
      position.y + size.height >= targetFrame.y() &&
      position.y + size.height <= targetFrame.y() + targetFrame.height()) ||
    (position.x >= targetFrame.x() &&
      position.x <= targetFrame.x() + targetFrame.width() &&
      position.y + size.height >= targetFrame.y() &&
      position.y + size.height <= targetFrame.y() + targetFrame.height()) ||
    (position.x + size.width >= targetFrame.x() &&
      position.x + size.width <= targetFrame.x() + targetFrame.width() &&
      position.y >= targetFrame.y() &&
      position.y <= targetFrame.y() + targetFrame.height()) ||
    (position.x + size.width / 2 >= targetFrame.x() &&
      position.x + size.width / 2 <= targetFrame.x() + targetFrame.width() &&
      position.y + size.height / 2 >= targetFrame.y() &&
      position.y + size.height / 2 <= targetFrame.y() + targetFrame.height())
  );
};
