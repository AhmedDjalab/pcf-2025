import Konva from "konva";
import { Filter } from "konva/lib/Node";
import React, { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import useDragAndDrop from "src/hooks/useDragAndDrop";
import { OverrideItemProps } from "src/hooks/useItem";
import useStage from "src/hooks/useStage";
import { decimalUpToSeven } from "src/libs/image-editor/util/decimalUpToSeven";

import { StageData } from "src/state/currentStageData";

export type ImageItemKind = {
  "data-item-type": string;
  id: string;
  name: string;
  src: string;
  image: typeof Image;
};

export type ImageItemProps = OverrideItemProps<{
  data: StageData;
  e?: DragEvent;
}>;

export const filterMap: { [name: string]: Filter } = {
  Brighten: Konva.Filters.Brighten,
  Grayscale: Konva.Filters.Grayscale,
};

const ImageItem: React.FC<ImageItemProps> = ({ data, e, onSelect }) => {
  const { attrs } = data;
  const imageRef = useRef() as RefObject<Konva.Image>;
  const [imageSrc, setImageSrc] = useState<CanvasImageSource>(new Image());

  const stage = useStage();
  const { onDragMoveFrame, onDragEndFrame, checkIsInFrame } = useDragAndDrop(
    stage.stageRef,
    stage.dragBackgroundOrigin
  );

  const filters = useMemo(() => {
    if (!data.attrs._filters) {
      return [Konva.Filters.Brighten];
    }
    return data.attrs._filters.map(
      (filterName: string) => filterMap[filterName]
    );
  }, [data.attrs]);

  useEffect(() => {
    const loadImage = async () => {
      const newImage = new Image();
      newImage.crossOrigin = "Anonymous";

      let source = attrs.src.startsWith("find:") ? attrs.src : attrs.src;

      if (source.startsWith("data:")) {
        const imageNode = await new Promise<Konva.Image>((resolve) => {
          Konva.Image.fromURL(source, (img: Konva.Image) => resolve(img));
        });

        const { width, height } = calculateDimensions(imageNode);

        imageNode.width(width);
        imageNode.height(height);

        const newBase64 = imageNode.toDataURL({
          x: 0,
          y: 0,
          width,
          height,
          pixelRatio: 2,
          quality: 1.0,
        });

        newImage.src = newBase64;
      } else {
        newImage.src = source;
      }

      newImage.onload = () => {
        setImageSrc(newImage);
      };
    };

    loadImage();
  }, [attrs.src]);

  useEffect(() => {
    if (imageRef.current) {
      stage.setStageRef(imageRef.current.getStage()!);
      imageRef.current.brightness(data.attrs.brightness);
      checkIsInFrame(imageRef.current);
      imageRef.current.cache({ pixelRatio: 5 });
    }
  }, [imageSrc, data, stage, checkIsInFrame]);

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.cache();
    }
  }, []);

  const calculateDimensions = (imageNode: Konva.Image) => {
    const maxSize = 2800; // Increase max size for better quality
    let width, height;

    if (imageNode.width() > imageNode.height()) {
      width = Math.min(imageNode.width(), maxSize);
      height = (width / imageNode.width()) * imageNode.height();
    } else {
      height = Math.min(imageNode.height(), maxSize);
      width = (height / imageNode.height()) * imageNode.width();
    }

    return { width: decimalUpToSeven(width), height: decimalUpToSeven(height) };
  };

  return (
    <KonvaImage
      ref={imageRef}
      image={imageSrc}
      name="label-target"
      data-item-type="image"
      data-frame-type="image"
      id={data.id}
      x={attrs.x}
      y={attrs.y}
      width={attrs.width}
      height={attrs.height}
      scaleX={attrs.scaleX}
      scaleY={attrs.scaleX}
      fill={attrs.fill ?? "transparent"}
      opacity={attrs.opacity ?? 1}
      rotation={attrs.rotation ?? 0}
      filters={filters ?? [Konva.Filters.Brighten]}
      draggable={false}
      perfectDrawEnabled={true}
      imageSmoothingEnabled={false}
      webkitImageSmoothingEnabled={false}
      mozImageSmoothingEnabled={false}
      transformsEnabled="all"
    />
  );
};

export default ImageItem;
