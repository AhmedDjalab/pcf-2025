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
  readOnly: boolean;
}>;

const PolygonItem: React.FC<PolygonItemProps> = ({
  data,
  e,
  transformer,
  onSelect,
  readOnly,
}) => {
  const { attrs } = data;
  const shapeRef = useRef() as RefObject<LineType>;
  const stage = useStage();
  const { onDragMoveFrame, onDragEndFrame, checkIsInFrame } = useDragAndDrop(
    stage.stageRef,
    stage.dragBackgroundOrigin
  );

  const { updateItem } = useItem();

  const [points, setPoints] = useState<number[]>(
    attrs.points || [attrs.x, attrs.y]
  );
  const [isDrawing, setIsDrawing] = useState(!attrs.points?.length);
  const [isClosed, setIsClosed] = useState(attrs.isClosed ?? false);

  function isShapeClosed(points: number[] | undefined): boolean {
    if (!points || points.length < 4) return false;
    const [startX, startY] = points;
    const [endX, endY] = points.slice(-2);
    return Math.abs(startX - endX) < 10 && Math.abs(startY - endY) < 10;
  }

  const handleStageClick = (e: any) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    const stagePoint = transform.point(pointerPos);
    const { x, y } = stagePoint;

    if (
      points.length >= 4 &&
      Math.abs(x - points[0]) < 10 &&
      Math.abs(y - points[1]) < 10
    ) {
      completeShape(true);
    } else {
      setPoints((prevPoints) => [...prevPoints, x, y]);
    }
  };

  const handleRightClick = useCallback(
    (e: any) => {
      e.evt.preventDefault();

      if (isDrawing) {
        if (points.length > 2) {
          setPoints((prevPoints) => prevPoints.slice(0, -2));
        } else {
          completeShape(false);
        }
      }
    },
    [points, isDrawing]
  );

  const completeShape = (closePath: boolean) => {
    setIsDrawing(false);
    if (closePath) {
      setPoints((prevPoints) => [...prevPoints, prevPoints[0], prevPoints[1]]);
      setIsClosed(true);
    } else {
      setIsClosed(false);
    }
    //@ts-nocheck
    updateItem(attrs.id, () => ({
      ...attrs,
      points: points,
      isClosed: closePath,
    }));
  };

  useEffect(() => {
    if (shapeRef.current) {
      stage.setStageRef(shapeRef.current.getStage()!);
      checkIsInFrame(shapeRef.current);
    }
  }, [data]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f" && isDrawing) {
        const lastIndex = points.length - 2;
        const isNearStart =
          Math.abs(points[lastIndex] - points[0]) < 10 &&
          Math.abs(points[lastIndex + 1] - points[1]) < 10;
        completeShape(isNearStart);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isDrawing, points]);

  return (
    <>
      <Line
        ref={shapeRef as RefObject<LineType>}
        onClick={onSelect}
        onContextMenu={handleRightClick}
        name="label-target"
        data-item-type="polygon"
        id={attrs.id}
        points={points}
        stroke={attrs.stroke || "#000"}
        strokeWidth={attrs.strokeWidth || 2}
        fill={isClosed ? attrs.fill || "red" : "transparent"}
        closed={isClosed}
        opacity={attrs.opacity ?? 1}
        rotation={attrs.rotation ?? 0}
        draggable={!readOnly}
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
            width={Math.round(window.innerWidth * 0.7)}
            height={Math.round(window.innerHeight * 0.7)}
            fill="transparent"
            onClick={handleStageClick}
          />
        </>
      )}
    </>
  );
};

export default PolygonItem;
