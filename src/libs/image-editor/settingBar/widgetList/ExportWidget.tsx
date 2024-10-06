import React from "react";
import { Button, Col, Figure, Row } from "react-bootstrap";
import { Node, NodeConfig } from "konva/lib/Node";
import { Group } from "konva/lib/Group";
import exportList from "src/config/export.json";
import alignStyles from "../../style/align.module.css";
import fontStyles from "../../style/font.module.css";
import sizeStyles from "../../style/size.module.css";
import { WidgetKind } from "../Widget";
import { SettingBarProps } from "..";
import useSelection from "src/hooks/useSelection";
import useStage from "src/hooks/useStage";
import useI18n from "src/hooks/usei18n";
import Konva from "konva";
import { useSelector } from "react-redux";

import useItem from "src/hooks/useItem";
import { StageData, stageDataSelector } from "src/state/currentStageData";

export type ExportKind = {
  "data-item-type": string;
  id: string;
  icon: string;
  name: string;
  selectedItems: Node<NodeConfig>[];
  clearSelection: ReturnType<typeof useSelection>["clearSelection"];
  stageRef: ReturnType<typeof useStage>["stageRef"];
};

type ExportWidgetProps = {
  data: WidgetKind & SettingBarProps;
};

const ExportWidget: React.FC<ExportWidgetProps> = ({ data }) => {
  const stageData = useSelector(stageDataSelector.selectAll);
  const stageCon = useStage();

  const { alterItems, clearItems, createItem } = useItem();
  const exportShapesAsJson = () => {
    if (!stageData || stageData.length === 0) return;

    const stage = data.stageRef.current;

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

    // Convert the normalized data to JSON
    const shapesData = JSON.stringify(normalizedStageData, null, 2);

    // Create a blob with the JSON data
    const blob = new Blob([shapesData], { type: "application/json" });

    // Create a link element to trigger the download
    const link = document.createElement("a");
    link.download = "shapes.json";
    link.href = URL.createObjectURL(blob);

    // Append the link to the document, click it to start the download, then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importShapesFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      let parsedData: StageData[];

      try {
        // Parse the JSON data
        parsedData = JSON.parse(json);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return;
      }

      if (parsedData && Array.isArray(parsedData)) {
        // Get the "sample-image" dimensions from the imported data
        const sampleImage = parsedData.find(
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

          // Return denormalized shape attributes
          return {
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
        };

        // Dispatch action to clear the current stage items
        clearItems();

        // Denormalize and create items for each shape in the parsed data
        parsedData.forEach((shape) => {
          const denormalizedShape = denormalizeShapeData(shape);

          createItem(denormalizedShape);
        });
      }
    };

    // Read the file content as text
    reader.readAsText(file);
  };

  return (
    <Col
      style={{
        overflow: "scroll",
        maxHeight: 200,
      }}
    >
      <Row>
        {exportList.map((_data) => (
          <ExportThumbnail
            key={`export-thumbnail-${_data.id}`}
            data={{
              id: _data.id,
              icon: _data.icon,
              name: _data.name,
              "data-item-type": "export",
              selectedItems: data.selectedItems,
              clearSelection: data.clearSelection,
              stageRef: data.stageRef,
            }}
          />
        ))}
      </Row>
      <Row className="mt-2">
        <Button onClick={exportShapesAsJson}>Export Shapes as JSON</Button>
        <input
          type="file"
          accept="application/json"
          onChange={importShapesFromJson}
          style={{ display: "none" }}
          id="load-json-input"
        />
        <Button
          onClick={() => document.getElementById("load-json-input")?.click()}
        >
          Load Shapes from JSON
        </Button>
      </Row>
    </Col>
  );
};

export default ExportWidget;

const ExportThumbnail: React.FC<{
  data: ExportKind;
}> = ({ data }) => {
  const { getTranslation } = useI18n();
  const downloadSelected = (targetFrame?: Node<NodeConfig> | Group) => {
    const link = document.createElement("a");
    const frame =
      targetFrame ??
      data.selectedItems.find(
        (item) => item.attrs["data-item-type"] === "frame"
      );
    if (frame) {
      const stage = frame.getStage()!;
      data.clearSelection();
      const uri = stage.toDataURL({
        x: frame.getClientRect().x,
        y: frame.getClientRect().y,
        width: frame.attrs.width * stage.scaleX(),
        height: frame.attrs.height * stage.scaleY(),
        pixelRatio: 1 / stage.scaleX(),
      });
      if (uri) {
        link.download = "export.png";
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const downloadAll = () => {
    const frames = data.stageRef.current
      .getChildren()[0]
      .getChildren((item) => item.attrs.name === "label-group");
    frames
      .map(
        (frame) =>
          (frame as Group).getChildren(
            (item) => item.attrs.name === "label-target"
          )[0]
      )
      .forEach((frame) => {
        downloadSelected(frame as Node<NodeConfig>);
      });
  };

  const onClickDownload = (exportId: string) => () => {
    if (exportId === "export-all-frame") {
      downloadAll();
      return;
    }
    downloadSelected();
  };

  return (
    <Figure
      as={Col}
      onClick={onClickDownload(data.id)}
      className={[alignStyles.absoluteCenter, alignStyles.wrapTrue].join(" ")}
    >
      <i className={`bi-${data.icon}`} style={{ fontSize: 20, width: 25 }} />
      <Figure.Caption
        className={[
          fontStyles.font075em,
          sizeStyles.width100,
          "text-center",
        ].join(" ")}
      >
        {`${getTranslation("widget", "activity", "saveActivity")}`}
      </Figure.Caption>
    </Figure>
  );
};
