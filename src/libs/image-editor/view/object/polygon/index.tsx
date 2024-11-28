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

  const [initPoints, setInitPoints] = useState<number[]>(
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
    console.log("🚀 ~ handleStageClick ~ e:", e, pointerPos, stage);
    if (!pointerPos || points.length === 0) return onSelect?.(e);

    // Only perform selection if not currently drawing
    if (isDrawing) {
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
    } else {
      // If not drawing, call onSelect
      onSelect?.(e);
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

  const handleDragStart = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      // Store initial points when drag starts
      setInitPoints([...points]);
    },
    [points]
  );

  const handleDragMove = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const { x, y } = e.target.attrs;

      // Translate points based on drag movement

      const translatedPoints = points.map((coord, index) => {
        return index % 2 === 0
          ? //@ts-ignore
            parseFloat(initPoints[index]) + parseFloat(x)
          : //@ts-ignore
            parseFloat(initPoints[index]) + parseFloat(y);
      });

      // Update local points state
      setPoints(translatedPoints);

      // Call the original drag move handler
      onDragMoveFrame(e);
    },
    [points, initPoints, onDragMoveFrame]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      // Update the item with new points
      updateItem(attrs.id, () => ({
        ...attrs,
        points: points,
      }));

      // Reset the shape position
      e.target.position({ x: 0, y: 0 });

      // Call the original drag end handler
      onDragEndFrame(e);
    },
    [points, attrs, updateItem, onDragEndFrame]
  );

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
        draggable
        dash={attrs.dash ?? undefined}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        activityUID={attrs.activityUID}
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
