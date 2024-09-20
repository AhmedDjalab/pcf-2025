import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  OverlayTrigger,
  Tooltip,
  Form,
} from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import { ColorResult, SketchPicker } from "react-color";
import useItem from "src/hooks/useItem";
import useI18n from "src/hooks/usei18n";
import borderStyles from "../../style/border.module.css";
import displayStyles from "../../style/display.module.css";
import sizeStyles from "../../style/size.module.css";
import spaceStyles from "../../style/space.module.css";
import alignStyles from "../../style/align.module.css";
import { WidgetKind } from "../Widget";
import { SettingBarProps } from "..";
import { Rect } from "react-konva";

type BorderWidgetProps = {
  data: WidgetKind & SettingBarProps;
};

const BorderWidget: React.FC<BorderWidgetProps> = ({ data }) => {
  const { updateItem } = useItem();
  const { getTranslation } = useI18n();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [borderColor, setBorderColor] = useState<string>("#000000");
  const [borderWidth, setBorderWidth] = useState<number>(1);
  const [borderStyle, setBorderStyle] = useState<string>("solid");

  const borderStylesOptions = {
    solid: [],
    dashed: [5, 5],
    dotted: [2, 2],
    double: [20, 10, 5, 10],
  };

  const toggleColorPicker = () => {
    setShowColorPicker((prev) => !prev);
  };

  const changeBorderColor = (color: typeof ColorResult) => {
    setBorderColor(color.hex);
    updateBorders();
  };

  const changeBorderWidth = (width: number) => {
    setBorderWidth(width);
    updateBorders();
  };

  const changeBorderStyle = (style: string) => {
    setBorderStyle((pr) => (pr = style));
    updateBorders(style);
  };

  const updateBorders = (style?: string) => {
    if (data.selectedItems.length === 0) return;

    data.selectedItems.forEach((item) => {
      item.setAttrs({
        ...item.getAttrs(),
        stroke: borderColor,
        strokeWidth: borderWidth,
        dash: borderStylesOptions[style ?? borderStyle],
      });
      console.warn(
        "🚀 ~ data.selectedItems.forEach ~ borderStylesOptions[borderStyle]:",
        borderStylesOptions[borderStyle]
      );
      updateItem(item.id(), () => item.attrs);
    });

    data.selectedItems[0].getStage()?.batchDraw();
  };

  useEffect(() => {
    const item = data.selectedItems[0];
    if (item) {
      setBorderColor(item.attrs.stroke || "#000000");
      setBorderWidth(item.attrs.strokeWidth || 1);
      setBorderStyle(
        Object.keys(borderStylesOptions).find(
          (style) =>
            JSON.stringify(borderStylesOptions[style]) ===
            JSON.stringify(item.attrs.dash)
        ) || "solid"
      );
    }
  }, [data.selectedItems]);

  return (
    <Col>
      <h6>
        {getTranslation("widget", "border", "color")}
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="tooltip-add-border-color">
              {getTranslation("widget", "border", "addColor")}
            </Tooltip>
          }
        >
          <div
            style={{
              width: 10,
              height: 15,
              backgroundColor: borderColor,
            }}
            className={[
              borderStyles.none,
              displayStyles["inline-block"],
              sizeStyles.width10,
              spaceStyles.p0,
              spaceStyles.ml1rem,
              alignStyles["text-left"],
            ].join(" ")}
            onClick={toggleColorPicker}
          ></div>
        </OverlayTrigger>
      </h6>

      {showColorPicker && (
        <SketchPicker
          color={borderColor}
          onChange={changeBorderColor}
          className="border-picker"
        />
      )}

      <Row>
        <Col>
          <h6>{getTranslation("widget", "border", "width")}</h6>
          <input
            type="number"
            value={borderWidth}
            min={0}
            max={20}
            onChange={(e) => changeBorderWidth(parseInt(e.target.value))}
            style={{
              width: 50,
            }}
          />
        </Col>
        <Col>
          <h6>{getTranslation("widget", "border", "style")}</h6>
          <Form.Select
            value={borderStyle}
            onChange={(e) => changeBorderStyle(e.target.value)}
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
          </Form.Select>
        </Col>
      </Row>
    </Col>
  );
};

export default BorderWidget;
