import React from "react";
import { Accordion, Button } from "react-bootstrap";
import { Node, NodeConfig } from "konva/lib/Node";
import Widget, { WidgetKind } from "./Widget";

import FrameWidget from "./widgetList/FrameWidget";
import ImageWidget from "./widgetList/ImageWidget";
import ColorPaletteWidget from "./widgetList/ColorPaletteWidget";
import TextWidget from "./widgetList/TextWidget";
import AlignWidget from "./widgetList/AlignWidget";
import ExportWidget from "./widgetList/ExportWidget";
import ShapeWidget from "./widgetList/ShapeWidget";
import IconWidget from "./widgetList/IconWidget";
import LineWidget from "./widgetList/LineWidget";
import BorderWidget from "./widgetList/BorderWidget";
import ActivityWidget from "./widgetList/ActivityWidget";
import useI18n from "src/hooks/usei18n";
import useSelection from "src/hooks/useSelection";
import useStage from "src/hooks/useStage";
import widgetList from "src/config/widget.json";

interface ShapeConfig extends Node<NodeConfig> {
  activityId?: string;
}
export type SettingBarProps = {
  selectedItems: ShapeConfig[];
  clearSelection: ReturnType<typeof useSelection>["clearSelection"];
  stageRef: ReturnType<typeof useStage>["stageRef"];
  activities?: {
    id: string;
    name: string;
  }[];
  saveChanges?: () => void;
};

const Widgets = {
  colorPalette: (data: WidgetKind & SettingBarProps) => (
    <ColorPaletteWidget data={data} />
  ),
  align: (data: WidgetKind & SettingBarProps) => <AlignWidget data={data} />,
  image: (data: WidgetKind & SettingBarProps) => <ImageWidget />,
  //frame: (data: WidgetKind & SettingBarProps) => <FrameWidget />,
  shape: (data: WidgetKind & SettingBarProps) => <ShapeWidget />,
  border: (data: WidgetKind & SettingBarProps) => <BorderWidget data={data} />,
  text: (data: WidgetKind & SettingBarProps) => <TextWidget />,
  line: (data: WidgetKind & SettingBarProps) => <LineWidget />,
  icon: (data: WidgetKind & SettingBarProps) => <IconWidget />,
  activity: (data: WidgetKind & SettingBarProps) => (
    <ActivityWidget data={data} activities={data.activities ?? []} />
  ),
  // export: (data: WidgetKind & SettingBarProps) => (
  //   <Button onClick={() => data.saveChanges()}>Export Shapes as JSON</Button>
  // ),
};

export type WidgetIDList = keyof typeof Widgets;

const SettingBar: React.FC<SettingBarProps> = (settingProps: any) => {
  const { getTranslation } = useI18n();

  return (
    <aside>
      <Accordion>
        {(widgetList as WidgetKind[]).map((data) => (
          <Widget key={`widget-${data.id}`} data={{ ...data, ...settingProps }}>
            {Widgets[data.id] && Widgets[data.id]({ ...data, ...settingProps })}
          </Widget>
        ))}
      </Accordion>
      <Button
        onClick={() => settingProps!.saveChanges()}
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "10px auto",
          paddingInline: "20px",
        }}
      >
        {`${getTranslation("widget", "activity", "saveActivity")}`}
      </Button>
    </aside>
  );
};

export default SettingBar;
