import React, { useState, useEffect } from "react";
import { Button, Col, Row, Form } from "react-bootstrap";
import useItem from "src/hooks/useItem";
import useI18n from "src/hooks/usei18n";
import { Layer, Text } from "react-konva";
import { WidgetKind } from "../Widget";
import { SettingBarProps } from "..";
import Konva from "konva";
import { nanoid } from "nanoid";
import { StageData } from "src/state/currentStageData";

type Activity = {
  id: string;
  name: string;
};
type ActivityWidgetProps = {
  data: WidgetKind & SettingBarProps;
  activities: Activity[]; // List of activities to select from
};

const ActivityWidget: React.FC<ActivityWidgetProps> = ({
  data,
  activities,
}) => {
  const { updateItem, createItem } = useItem();
  const { getTranslation } = useI18n();
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [activityText, setActivityText] = useState<string>("");

  useEffect(() => {
    if (data.selectedItems[0]) {
      const item = data.selectedItems[0];
      const itemActivityId = item.attrs.activityId || "";
      setSelectedActivityId(itemActivityId);
      setActivityText(item.attrs.text || itemActivityId);
    }
  }, [data.selectedItems]);

  const handleActivityChange = (activityId: string) => {
    setSelectedActivityId(activityId);
  };
  const saveActivity = () => {
    if (data.selectedItems.length === 0) return;

    data.selectedItems.forEach((item) => {
      const activityTextId = `activityId-${item.id}`;

      // Check if the item already has a text element for the activityId
      const existingText = item
        ?.getLayer()
        ?.findOne((node) => node.getAttr("id") === activityTextId);

      const textPositionX = item.attrs.x + item.attrs.width / 2;
      const textPositionY = item.attrs.y - 20; // Position the text near the shape

      if (existingText) {
        // Update the existing text if found
        existingText.setAttrs({
          x: textPositionX,
          y: textPositionY,
          text: selectedActivityId,
        });
      } else {
        // Create a new StageData text element
        const newText: StageData = {
          id: nanoid(),
          attrs: {
            name: "label-target",
            "data-item-type": "text",
            width: selectedActivityId.length * 14, // Example: Adjust width based on text length
            height: 20, // Example height for the text element
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
            activityId: selectedActivityId, // Add activityId as an attribute
            updatedAt: Date.now(),
            id: activityTextId,
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
        activityId: selectedActivityId,
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
          <option key={activity.id} value={activity.id}>
            {activity.name}
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
