//@ts-nocheck
import React, { useState, useEffect } from "react";
import { Button, Col, Row, Form } from "react-bootstrap";
import useItem from "src/hooks/useItem";
import useI18n from "src/hooks/usei18n";
import { Layer, Text } from "react-konva";
import { WidgetKind } from "../Widget";
import { SettingBarProps } from "..";
import Konva from "konva";
import { nanoid } from "nanoid";
import { StageData, stageDataSelector } from "src/state/currentStageData";
import { ActivityModel } from "src/types/Project";
import { GraphDataType } from "src/state/slices/graphSlice";
import { v4 as Uuid4 } from "uuid";
import { useSelector } from "react-redux";
// type Activity = {
//   id: string;
//   name: string;
// };
type ActivityWidgetProps = {
  data: WidgetKind & SettingBarProps;
  activities: GraphDataType[]; // List of activities to select from
};

const ActivityWidget: React.FC<ActivityWidgetProps> = ({
  data,
  activities,
}) => {
  const { updateItem, createItem } = useItem();
  const { getTranslation } = useI18n();
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [selectedActivity, setSelectedActivity] = useState<string>();
  const [activityText, setActivityText] = useState<string>("");
  const stageData = useSelector(stageDataSelector.selectAll);
  useEffect(() => {
    if (data.selectedItems[0]) {
      const item = data.selectedItems[0];
      const itemActivityId = item.attrs.activityUID || "";
      setSelectedActivityId(itemActivityId);

      setActivityText(item.attrs.text || itemActivityId);
    }
  }, [data.selectedItems]);

  const handleActivityChange = (activityId: string) => {
    console.log("🚀 ~ handleActivityChange ~ activityId:", activityId);
    setSelectedActivityId(activityId);
  };

  const saveActivity = () => {
    if (data.selectedItems.length === 0) return;

    data.selectedItems.forEach((item) => {
      const activityTextId = `activityId-${item.id()}`;

      var existedItem = stageData.find(
        (x) =>
          x.attrs["data-item-type"] === "text" && x.attrs.shapeId === item.id()
      );
      console.log(
        "🚀 ~ data.selectedItems.forEach ~ existedItem:",
        existedItem,
        stageData
      );

      const textPositionX = item.attrs.x + item.attrs.width / 2;
      const textPositionY = item.attrs.y - 20;

      if (existedItem) {
        // updateItem(
        //   existedItem.id,
        //   (existedItem) => (existedItem.text = selectedActivityId)
        // );

        const existingText = item
          ?.getLayer()
          ?.findOne((node) => node.getAttr("id") === existedItem!.id);

        console.log(
          "🚀 ~ data.selectedItems.forEach ~ existingText:",
          existingText
        );

        existingText?.setAttrs({
          x: textPositionX,
          y: textPositionY,
          text: selectedActivityId,
        });
      } else {
        // Create a new StageData text element
        const newText: StageData = {
          id: Uuid4(),
          attrs: {
            name: "label-target",
            "data-item-type": "text",
            width: selectedActivityId.length * 14,
            height: 20,
            fill: "black",
            x: textPositionX,
            y: textPositionY,
            fontSize: 14,
            fontFamily: "Arial",
            text: selectedActivityId,
            textAlign: "center",
            verticalAlign: "middle",
            zIndex: 0,
            brightness: 0,
            activityId: selectedActivityId,
            activityUID: selectedActivityId,
            updatedAt: Date.now(),
            shapeId: item.id(),
            // id: activityTextId,
          },
          className: "sample-text",
          children: [],
        };

        // Add the text element to the stage via createItem
        createItem(newText);
      }

      // Update the shape's activityId attribute
      item.setAttrs({
        ...item.getAttrs(),
        activityUID: selectedActivityId,
      });

      updateItem(item.id(), () => item.attrs);
    });

    // Redraw the stage to reflect changes
    data.selectedItems[0].getStage()?.batchDraw();
  };

  const saveJson = () => {
    if (data.selectedItems.length === 0) return;
    const savedData = data.selectedItems.map((item) => item.toJSON());
    console.log("Saved JSON:", JSON.stringify(savedData));
    // Save the JSON somewhere, e.g., send to a server, save to local storage, etc.
  };

  return (
    <Col>
      {/* <h6>{getTranslation("widget", "activity", "selectActivity")}</h6> */}
      <Form.Select
        value={selectedActivityId}
        onChange={(e) => handleActivityChange(e.target.value)}
      >
        <option value="">
          {getTranslation("widget", "activity", "selectActivity")}
        </option>
        {activities.map((activity) => (
          <option key={activity.activityUID} value={activity.activityUID}>
            {activity.activityName}
          </option>
        ))}
      </Form.Select>

      <Row className="mt-3">
        <Col>
          <Button variant="primary" onClick={saveActivity}>
            {getTranslation("widget", "activity", "saveActivity")}
          </Button>
        </Col>
        {/* <Col>
          <Button variant="secondary" onClick={saveJson}>
            {getTranslation("widget", "activity", "saveJson")}
          </Button>
        </Col> */}
      </Row>
    </Col>
  );
};

export default ActivityWidget;
