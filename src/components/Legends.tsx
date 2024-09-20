//@ts-nocheck
import React, {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import { LineStyle } from "src/const/linesArray";
import { MarkerConfig } from "src/const/markerAndPatternsConfig";
import { ShapesSettings, ShapeType } from "src/state/slices/graphSlice";

interface LegendProps {
  shapesData: ShapesSettings;
  texturesData: any[];
  lineStyles: LineStyle[];
  markersConfig: { [key: string]: MarkerConfig };
  setSelectedShapes: SetStateAction;
  selectedShapes: string[];
}

const sanitizeClassName = (key: string): string => {
  // Replace invalid characters with hyphens
  let sanitized = key.replace(/[^a-zA-Z0-9-_]/g, "-");
  // Ensure it does not start with a number
  if (/^\d/.test(sanitized)) {
    sanitized = `_${sanitized}`;
  }
  // Remove any leading or trailing hyphens
  return sanitized.replace(/^-+|-+$/g, "");
};

const LegendComponent: React.FC<LegendProps> = ({
  shapesData,
  texturesData,
  lineStyles,
  markersConfig,
  setSelectedShapes,
  selectedShapes,
}) => {
  const textureLegendDefsRef = useRef<SVGDefsElement>(null);

  const callTextureData = useCallback(() => {
    const svg = d3.select("legend-item");
    const svgTexture = d3.select(textureLegendDefsRef.current!);
    //svgTexture.selectAll("*").remove();

    shapesData.shapesData.forEach((shape) => {
      let selectedTexture = texturesData.find(
        (x) => x.id === shape.backgroundTexture
      );

      //   if (selectedTexture) {
      //     const optionTexture = selectedTexture.configuration
      //       .id(sanitizeClassName(shape.name + selectedTexture.id))
      //       .stroke(shape.color);
      //     svgTexture.call(optionTexture);
      //   }

      // add markers
      const shapeStroke = shape.color;
      if (shape.lineType !== "") {
        let lineStyleAttr =
          lineStyles.find((x) => x.id === shape.lineType) || {};

        if (lineStyleAttr.markerStartName) {
          const markerConfig = markersConfig[lineStyleAttr.markerStartName];
          const startMarker = svgTexture
            .append("marker")
            .attr("id", `${markerConfig.id}-${sanitizeClassName(shape.name)}`)
            .attr("viewBox", markerConfig.config.viewBox)
            .attr("markerWidth", markerConfig.config.markerWidth)
            .attr("markerHeight", markerConfig.config.markerHeight)
            .attr("refX", markerConfig.config.refX)
            .attr("refY", markerConfig.config.refY)
            .attr("orient", markerConfig.config.orient);

          if (markerConfig.markerType && markerConfig.markerType !== "path") {
            startMarker
              .append(markerConfig.markerType)
              .attr("x", markerConfig.config.x)
              .attr("fill", shapeStroke)
              .attr("y", markerConfig.config.y)
              .attr("width", markerConfig.config.width)
              .attr("height", markerConfig.config.height)
              .attr("cx", markerConfig.config.cx)
              .attr("cy", markerConfig.config.cy)
              .attr("r", markerConfig.config.r)
              .attr("refX", markerConfig.config.refX)
              .attr("refY", markerConfig.config.refY);
          } else {
            startMarker
              .append(markerConfig.markerType ?? "path")
              .attr("d", markerConfig.config.d)
              .attr("y", markerConfig.config.y)
              .attr("width", markerConfig.config.width)
              .attr("height", markerConfig.config.height)
              .attr("cx", markerConfig.config.cx)
              .attr("cy", markerConfig.config.cy)
              .attr("r", markerConfig.config.r)
              .attr("refX", markerConfig.config.refX)
              .attr("refY", markerConfig.config.refY)
              .attr("fill", shapeStroke);
          }
        }

        if (lineStyleAttr.markerEndName) {
          const markerConfig = markersConfig[lineStyleAttr.markerEndName];
          const endMarker = svgTexture
            .append("marker")
            .attr("id", `${markerConfig.id}-${sanitizeClassName(shape.name)}`)
            .attr("viewBox", markerConfig.config.viewBox)
            .attr("markerWidth", markerConfig.config.markerWidth)
            .attr("markerHeight", markerConfig.config.markerHeight)
            .attr("refX", markerConfig.config.refX)
            .attr("refY", markerConfig.config.refY)
            .attr("orient", markerConfig.config.orient)
            .attr("stroke", "context-stroke")
            .attr("fill", "context-fill");

          if (markerConfig.markerType && markerConfig.markerType !== "path") {
            endMarker
              .append(markerConfig.markerType)
              .attr("x", markerConfig.config.x)
              .attr("fill", shapeStroke)
              .attr("y", markerConfig.config.y)
              .attr("width", markerConfig.config.width)
              .attr("height", markerConfig.config.height)
              .attr("cx", markerConfig.config.cx)
              .attr("cy", markerConfig.config.cy)
              .attr("r", markerConfig.config.r)
              .attr("refX", markerConfig.config.refX)
              .attr("refY", markerConfig.config.refY);
          } else {
            endMarker
              .append(markerConfig.markerType ?? "path")
              .attr("d", markerConfig.config.d)
              .attr("y", markerConfig.config.y)
              .attr("width", markerConfig.config.width)
              .attr("height", markerConfig.config.height)
              .attr("cx", markerConfig.config.cx)
              .attr("cy", markerConfig.config.cy)
              .attr("r", markerConfig.config.r)
              .attr("refX", markerConfig.config.refX)
              .attr("refY", markerConfig.config.refY)
              .attr("fill", shapeStroke);
          }
        }
      }
    });
  }, [lineStyles, markersConfig, shapesData.shapesData, texturesData]);

  useEffect(() => {
    callTextureData();
  }, [callTextureData, shapesData.shapesData, textureLegendDefsRef]);

  const createLegend = useCallback(() => {
    const svgTexture = d3.select(textureLegendDefsRef.current);

    shapesData.shapesData.forEach((shape) => {
      let lineStyleAttr: LineStyle | {} = {};
      let startConfig, endConfig;

      if (shape.lineType !== "") {
        lineStyleAttr = lineStyles.find((x) => x.id === shape.lineType) || {};

        if (lineStyleAttr.markerStartName) {
          startConfig = markersConfig[lineStyleAttr.markerStartName];
        }
        if (lineStyleAttr.markerEndName) {
          endConfig = markersConfig[lineStyleAttr.markerEndName];
        }
      }

      const textureConfig = texturesData.find(
        (x) => x.id === shape.backgroundTexture
      );

      if (textureConfig) {
        const textureId = sanitizeClassName(shape.name + textureConfig.id);

        // Remove previous texture definition if it exists
        svgTexture?.select(`#${textureId}`).remove();
        const optionTexture = textureConfig.configuration
          .id(textureId)
          .stroke(shape.color);

        // Ensure `optionTexture` is a valid function or selection
        if (typeof optionTexture === "function") {
          svgTexture.call(optionTexture);
        }
      }
    });
  }, [shapesData, texturesData, lineStyles, markersConfig]);

  useEffect(() => {
    createLegend();
  }, [createLegend]);

  const [itemsPerRow, setItemsPerRow] = useState(
    getItemsPerRow(window.innerWidth)
  );
  const itemWidth = 200; // Width of each item
  const itemHeight = 100; // Height of each item

  function getItemsPerRow(width) {
    if (width < 600) return 2; // Small screens (sm)
    if (width < 960) return 4; // Medium screens (md)
    if (width < 1080) return 6; // Medium screens (md)
    if (width < 2040) return 8; // Medium screens (md)
    return 10; // Large screens
  }

  useEffect(() => {
    const handleResize = () => {
      setItemsPerRow(getItemsPerRow(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <svg
      width="100%"
      style={{
        alignSelf: "center",
        //paddingTop: 20,
        margin: "10 10",
      }}
      height={
        Math.ceil(shapesData.shapesData.length / itemsPerRow) * itemHeight
      }
    >
      <defs ref={textureLegendDefsRef}></defs>
      {shapesData.shapesData.map((shape, index) => {
        let lineStyleAttr: LineStyle | {} = {};
        let startConfig, endConfig;

        if (shape.lineType !== "") {
          lineStyleAttr = lineStyles.find((x) => x.id === shape.lineType) || {};

          if (lineStyleAttr.markerStartName) {
            startConfig = markersConfig[lineStyleAttr.markerStartName];
          }
          if (lineStyleAttr.markerEndName) {
            endConfig = markersConfig[lineStyleAttr.markerEndName];
          }
        }

        const textureConfig = texturesData.find(
          (x) => x.id === shape.backgroundTexture
        );

        const textureId = sanitizeClassName(shape.name + textureConfig?.id);
        const isSelected = selectedShapes.includes(shape.name);
        const handleLegendItemClick = (shape: Shape) => {
          setSelectedShapes((prevSelectedShapes) =>
            prevSelectedShapes.includes(shape.name)
              ? prevSelectedShapes.filter((name) => name !== shape.name)
              : [...prevSelectedShapes, shape.name]
          );
        };

        const x = (index % itemsPerRow) * itemWidth;
        const y = Math.floor(index / itemsPerRow) * itemHeight;

        return (
          <g
            key={index}
            className="legend-item"
            onClick={() => handleLegendItemClick(shape)}
            transform={`translate(${x}, ${y})`}
            style={{ cursor: "pointer" }}
          >
            <defs>
              {endConfig &&
                endConfig.content(
                  shape.color,
                  endConfig.id + sanitizeClassName(shape.name)
                )}
              {startConfig &&
                startConfig.content(
                  shape.color,
                  startConfig.id + sanitizeClassName(shape.name)
                )}
            </defs>
            {shape.type === "line" && (
              <polyline
                points="5,10 35,10"
                stroke={shape.color}
                markerEnd={`url(#${
                  lineStyleAttr.markerEndId
                }${sanitizeClassName(shape.name)})`}
                markerStart={`url(#${
                  lineStyleAttr.markerStartId
                }${sanitizeClassName(shape.name)})`}
                markerMid={`url(#${
                  lineStyleAttr.markerMidId
                }${sanitizeClassName(shape.name)})`}
                strokeWidth={
                  lineStyleAttr.style
                    ? lineStyleAttr.style["stroke-width"] || "2"
                    : "2"
                }
                strokeDasharray={
                  lineStyleAttr.style
                    ? lineStyleAttr.style["stroke-dasharray"] || "0"
                    : "0"
                }
              />
            )}
            {shape.type === "rect" && (
              <rect
                x="10"
                y="2"
                width="30"
                height="16"
                fill={textureConfig?.configuration.id(textureId).url()}
                stroke={shape.color}
              />
            )}
            {shape.type === "triangle" && (
              <polygon
                points="10,18 40,2 40,18"
                fill={textureConfig?.configuration.id(textureId).url()}
                stroke={shape.color}
              />
            )}
            {shape.type === "circle" && (
              <circle cx="20" cy="10" r="8" fill={shape.color} />
            )}
            <foreignObject x="10" y="20" width="150" height="100">
              <div
                style={{
                  color: isSelected ? "blue" : "black",
                  cursor: "pointer",
                  textAlign: "start",
                  textOverflow: "ellipsis",
                  wordWrap: "break-word",
                }}
              >
                {shape.name}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
};

export default LegendComponent;
