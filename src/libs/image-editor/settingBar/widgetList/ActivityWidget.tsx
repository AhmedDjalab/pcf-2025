//@ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from "react";
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
import Select from "react-select";
import Input from "src/components/Input";
import moment from "moment";

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
  const [selectedActivity, setSelectedActivity] = useState<GraphDataType>();
  const stageData = useSelector(stageDataSelector.selectAll);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef<HTMLElement>(null);
  // Convert activities to options format required by react-select
  const activityOptions = activities.map((activity) => ({
    value: activity.id,
    label: activity.activityName,
    activityId: activity.activityId,
    activityUID: activity.activityUID,
  }));

  // Handle the change in selected option
  const onActivityChange = (selectedOption) => {
    handleActivityChange(selectedOption?.value || "");
  };

  useEffect(() => {
    console.warn("🚀 ~ useEffect ~ data.selectedItems:", data.selectedItems);

    if (data.selectedItems[0]) {
      const item = data.selectedItems[0];
      const itemActivityId = item.attrs.activityUID || "";
      console.log("🚀 ~ useEffect ~ itemActivityId:", itemActivityId);
      if (itemActivityId) {
        //setSelectedActivityId(itemActivityId);
        const activity = activities.find(
          (x) => x.activityUID == itemActivityId
        )!;
        setSelectedActivity(activity);
        setSearchTerm(activity.activityName);
      }
    }
  }, [activities, data.selectedItems]);

  const handleActivityChange = (activityId: string) => {
    const activity = activities.find((x) => x.id === activityId)!;
    setSelectedActivity(activity);
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
        stageData,
        selectedActivity
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
          text: selectedActivity?.activityUID,
        });
      } else {
        // Create a new StageData text element
        const newText: StageData = {
          id: Uuid4(),
          attrs: {
            name: "label-target",
            "data-item-type": "text",
            width: selectedActivity?.activityUID?.length * 14,
            height: 20,
            fill: "black",
            x: textPositionX,
            y: textPositionY,
            fontSize: 14,
            fontFamily: "Arial",
            text: selectedActivity?.activityUID,
            textAlign: "center",
            verticalAlign: "middle",
            zIndex: 0,
            brightness: 0,
            activityId: selectedActivity?.activityUID,
            activityUID: selectedActivity?.activityUID,
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
        activityUID: selectedActivity?.activityUID,
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
  const selectValue = useMemo(
    () => activityOptions.find((option) => option.label === searchTerm),
    [activityOptions, searchTerm]
  );
  console.log("🚀 ~ selectValue:", selectValue);

  return (
    <div className="w-full overflow-y-scroll h-40 ">
      {/* Title can be added as needed */}
      {/* <h6>{getTranslation("widget", "activity", "selectActivity")}</h6> */}

      {/* Custom Select with Autocomplete */}
      <div className="mb-4">
        <Select
          className="w-full"
          value={selectValue}
          onInputChange={(inputValue) => setSearchTerm(inputValue)}
          onChange={onActivityChange}
          options={activityOptions}
          isClearable
          filterOption={(option, inputValue) => {
            console.warn("🚀 ~ option, inputValue:", option, inputValue);

            return (
              option.data.activityId == inputValue ||
              option.label.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
        />
      </div>

      {/* Displaying Activity Entity Data */}
      <div className="mt-3 grid grid-cols-1 gap-4 ">
        <Input
          id="id"
          label="Id"
          value={selectedActivity?.activityId}
          readOnly
        />
        <Input
          id="UID"
          label="UID"
          value={selectedActivity?.activityUID}
          readOnly
        />
        <Input
          id="start"
          label="Start"
          value={moment(selectedActivity?.startDate).format("DD-MM-YYYY")}
          readOnly
        />
        <Input
          id="end"
          label="End"
          value={moment(selectedActivity?.finishDate).format("DD-MM-YYYY")}
          readOnly
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-start">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          onClick={saveActivity}
        >
          {getTranslation("widget", "activity", "saveActivity")}
        </button>

        {/* Uncomment and style as needed for the JSON save button */}
        {/* <button
          className="ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none"
          onClick={saveJson}
        >
          {getTranslation("widget", "activity", "saveJson")}
        </button> */}
      </div>
    </div>
  );
};

export default ActivityWidget;
