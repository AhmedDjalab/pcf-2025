import { Line as LineType } from "konva/lib/shapes/Line";
import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Circle, Line, Rect } from "react-konva";
import useItem, { OverrideItemProps } from "src/hooks/useItem";
import useTransformer from "src/hooks/useTransformer";
import useDragAndDrop from "src/hooks/useDragAndDrop";
import useStage from "src/hooks/useStage";
import { StageData } from "src/state/currentStageData";
import { KonvaEventObject } from "konva/lib/Node";

export type PolygonItemProps = OverrideItemProps<{
  data: StageData;
  transformer: ReturnType<typeof useTransformer>;
  e?: DragEvent;
}>;

const PolygonItem: React.FC<PolygonItemProps> = ({
  data,
  e,
  transformer,
  onSelect,
}) => {
  const { attrs } = data;
  const shapeRef = useRef() as RefObject<LineType>;
  const stage = useStage();
  const { onDragMoveFrame, onDragEndFrame, checkIsInFrame } = useDragAndDrop(
    stage.stageRef,
    stage.dragBackgroundOrigin
  );

  const { updateItem } = useItem();

  const initialPoints = attrs.points?.length
    ? attrs.points
    : [attrs.x, attrs.y];
  const [points, setPoints] = useState<number[]>(initialPoints);
  const [isDrawing, setIsDrawing] = useState(!attrs.points?.length);

  const draw = () => {
    var i = 0;
    while (i < attrs.points.length) {
      const x = attrs.points[i];
      const y = attrs.points[i + 1];

      if (
        attrs.points.length >= 4 &&
        Math.abs(x - points[0]) < 10 &&
        Math.abs(y - points[1]) < 10
      ) {
        completePolygon();
        break;
      } else {
        setPoints((prevPoints) => [...prevPoints, x, y]);
        i += 2;
      }
    }
  };

  const handleStageClick = (e: any) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const { x, y } = pointerPos;

    // Check if the click is close to the starting point
    if (
      points.length >= 4 &&
      Math.abs(x - points[0]) < 10 &&
      Math.abs(y - points[1]) < 10
    ) {
      completePolygon();
    } else {
      setPoints((prevPoints) => [...prevPoints, x, y]);
    }
  };

  const completePolygon = () => {
    setIsDrawing(false);
    // Close the polygon by adding the first point again
    setPoints((prevPoints) => [...prevPoints, prevPoints[0], prevPoints[1]]);
  };

  useEffect(() => {
    if (shapeRef.current) {
      stage.setStageRef(shapeRef.current.getStage()!);
      checkIsInFrame(shapeRef.current);
    }
  }, [data]);

  return (
    <>
      <Line
        ref={shapeRef as RefObject<LineType>}
        onClick={onSelect}
        name="label-target"
        data-item-type="polygon"
        id={attrs.id}
        points={points}
        stroke={attrs.stroke ? attrs.stroke : "#000"}
        strokeWidth={attrs.strokeWidth ? attrs.strokeWidth : 2}
        fill={isDrawing ? "transparent" : attrs.fill ? attrs.fill : "red"}
        // stroke={attrs.stroke ?? "#000"}
        // strokeWidth={attrs.stroke ? 5 : undefined}
        // fill={isDrawing ? "transparent" : "red"}
        closed={!isDrawing}
        opacity={attrs.opacity ?? 1}
        rotation={attrs.rotation ?? 0}
        activityUID={attrs.activityUID}
        draggable
        onDragMove={onDragMoveFrame}
        onDragEnd={onDragEndFrame}
      />

      {isDrawing && (
        <>
          {points.map(
            (point, index) =>
              index % 2 === 0 && (
                <Circle
                  key={`anchor-${index / 2}`}
                  x={points[index]}
                  y={points[index + 1]}
                  radius={5}
                  stroke="black"
                  fill="green"
                  strokeWidth={2}
                />
              )
          )}

          <Rect
            x={0}
            y={0}
            width={window.innerWidth}
            height={window.innerHeight}
            fill="transparent"
            onClick={handleStageClick}
          />
        </>
      )}
    </>
  );
};

export default PolygonItem;
