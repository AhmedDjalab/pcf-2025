import { RegularPolygon as RegularPolygonType } from "konva/lib/shapes/RegularPolygon";
import { Rect as RectType } from "konva/lib/shapes/Rect";
import React, { RefObject, useEffect, useRef } from "react";
import { Rect, RegularPolygon } from "react-konva";
import { OverrideItemProps } from "src/hooks/useItem";
import useTransformer from "src/hooks/useTransformer";

import useDragAndDrop from "src/hooks/useDragAndDrop";
import useStage from "src/hooks/useStage";
import { StageData } from "src/state/currentStageData";

export type ShapeItemKind = {
  "data-item-type": string;
  id: string;
  icon: string;
  x: number;
  y: number;
  sides: number;
  radius: number;
};

export type ShapeItemProps = OverrideItemProps<{
  data: StageData;
  transformer: ReturnType<typeof useTransformer>;
  e?: DragEvent;
  readOnly: boolean;
}>;

const ShapeItem: React.FC<ShapeItemProps> = ({
  data,
  e,
  transformer,
  onSelect,
  readOnly,
}) => {
  const { attrs } = data;
  console.log("🚀 ~ data:RegularPolygon ", data, attrs.sides);

  const shapeRef = useRef() as RefObject<RegularPolygonType | RectType>;
  const stage = useStage();
  const { onDragMoveFrame, onDragEndFrame, checkIsInFrame } = useDragAndDrop(
    stage.stageRef,
    stage.dragBackgroundOrigin
  );

  useEffect(() => {
    if (shapeRef.current) {
      stage.setStageRef(shapeRef.current.getStage()!);
      checkIsInFrame(shapeRef.current);
    }
  }, [data]);

  if (attrs.sides === 4) {
    return (
      <Rect
        ref={shapeRef as RefObject<RectType>}
        onClick={onSelect}
        name="label-target"
        data-item-type="shape"
        id={attrs.id}
        x={attrs.x}
        y={attrs.y}
        width={Math.sqrt(attrs.radius * 2)}
        height={Math.sqrt(attrs.radius * 2)}
        sides={attrs.sides}
        radius={attrs.radius}
        scaleX={attrs.scaleX}
        scaleY={attrs.scaleY}
        fill={attrs.fill ?? "#000000"}
        stroke={attrs.stroke ?? null}
        strokeWidth={attrs.strokeWidth ? 5 : undefined}
        dash={attrs.dash ?? undefined}
        opacity={attrs.opacity ?? 1}
        rotation={attrs.rotation ?? 0}
        activityUID={attrs.activityUID}
        draggable={!readOnly}
        onDragMove={onDragMoveFrame}
        onDragEnd={onDragEndFrame}
      />
    );
  }

  return (
    <RegularPolygon
      ref={shapeRef as RefObject<RegularPolygonType>}
      onClick={onSelect}
      name="label-target"
      data-item-type="shape"
      id={attrs.id}
      x={attrs.x}
      y={attrs.y}
      sides={attrs.sides}
      radius={attrs.radius}
      scaleX={attrs.scaleX}
      scaleY={attrs.scaleY}
      fill={attrs.fill ?? "#000000"}
      stroke={attrs.stroke ?? null}
      strokeWidth={attrs.stroke ? 5 : undefined}
      opacity={attrs.opacity ?? 1}
      rotation={attrs.rotation ?? 0}
      draggable
      onDragMove={onDragMoveFrame}
      onDragEnd={onDragEndFrame}
    />
  );
};

export default ShapeItem;
