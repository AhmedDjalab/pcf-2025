//@ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useSelector } from "react-redux";
import { RootState } from "../state";
import { GraphDataType, ShapeType } from "../state/slices/graphSlice";
import texturesData from "../const/texturesArray";
import textures from "textures";
import moment from "moment";
import { zoom } from "d3-zoom";
import {
  LineStyle,
  PatternAndMarkerMap,
  lineStyles,
} from "../const/linesArray";
import {
  MarkerConfig,
  PatternConfig,
  markersConfig,
} from "../const/markerAndPatternsConfig";

export interface ActivityData {
  id: string;
  activityName: string;
  startDate: string;
  finishDate: string;
  startChainage: number;
  finishChainage: number;
  style: string; // Shape type (line, rectangle, circle, triangle, etc.)
}
function DrawGraphStep() {
  const graphSettings = useSelector((state: RootState) => state.graph);
  const shapesData = useSelector((state: RootState) => state.graph.shapes);

  const svgRef = useRef();
  const legendRef = useRef();
  const tableRef = useRef();
  // State to manage the selected date range
  const [startDate, setStartDate] = useState(graphSettings.settings.fromDate);
  const [endDate, setEndDate] = useState(graphSettings.settings.toDate);
  const [fromDistance, setFromDistance] = useState(
    graphSettings.settings.fromDistance
  );
  const [toDistance, setToDistance] = useState(
    graphSettings.settings.toDistance
  );
  const [timeRange, setTimeRange] = useState<
    "Yearly" | "Monthly" | "Weekly" | "Daily"
  >(graphSettings.settings.timeRange);

  const [selectedShapeData, setSelectedShapeData] = useState<ActivityData>();
  const [patternsData, setPatternsData] = useState<any[]>([]);
  const generateTooltipContent = (data: GraphDataType) => {
    return `
      <strong>ID:</strong> ${data.id}<br>
      <strong>Activity Name:</strong> ${data.activityName}<br>
      <strong>Start Date:</strong> ${moment(data.startDate).format(
        "MM/DD/YYYY"
      )}<br>
      <strong>Finish Date:</strong> ${moment(data.finishDate).format(
        "MM/DD/YYYY"
      )}<br>
      <strong>Start Chainage:</strong> ${data.startChainage}<br>
      <strong>Finish Chainage:</strong> ${data.finishChainage}<br>
      <strong>Style:</strong> ${data.style}
    `;
  };
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };
  const margin = { top: 40, right: 20, bottom: 100, left: 100 };
  const containerWidth = 1200;
  const containerHeight = 1000;
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  useEffect(() => {
    const legendContainer = d3.select(legendRef.current!);
    const svg = d3.select(svgRef.current!);
    const tooltip = d3.select("#tooltip");

    console.error("this is data ", toDistance);
    const xScale = d3
      .scaleLinear()
      .domain([fromDistance, toDistance])
      .range([margin.left, width]);

    const yScale = d3
      .scaleTime()
      .domain([new Date(startDate), new Date(endDate)])
      .range([margin.top, height]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    //?? x axis
    const xAxis = d3.axisBottom(xScale);
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("dy", "1em");

    let yAxis = d3.axisLeft(yScale);

    if (timeRange === "Yearly") {
      yAxis.ticks(d3.timeYear.every([new Date(startDate)])); // Show yearly ticks
    } else if (timeRange === "Monthly") {
      yAxis.ticks(d3.timeMonth.every(1)); // Show monthly ticks
    } else if (timeRange === "Weekly") {
      yAxis.ticks(d3.timeWeek.every(1)); // Show weekly ticks
    } else if (timeRange.includes("Daily")) {
      yAxis.ticks(d3.timeDay.every(1)); // Show daily ticks
    }

    g.append("g")
      .attr("class", "y-axis")
      .attr("transform", "translate(30,0)")
      .call(yAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-0.5em")
      .text((d) => d3.timeFormat("%a %m/%d/%Y")(d));

    const defs = svg.select("defs");

    g.selectAll(".activity-rectangle")
      .data(graphSettings.settings.graphData)
      .enter()
      .append((d) => {
        let shape = shapesData.shapesData.find((x) =>
          x.activityId?.includes(d.id)
        )!;
        if (shape.type === "line") {
          return document.createElementNS("http://www.w3.org/2000/svg", "line");
        } else if (shape.type === "rect") {
          return document.createElementNS("http://www.w3.org/2000/svg", "rect");
        } else if (shape.type === "triangle") {
          return document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
          );
        }
        return document.createElementNS("http://www.w3.org/2000/svg", "circle");
      })

      .attr("class", "activity-rectangle")

      .each(function (d: GraphDataType) {
        const defs = svg.select("defs");
        const shapeInCanvas = d3.select(this);
        let shape = shapesData.shapesData.find((x) =>
          x.activityId?.includes(d.id)
        )!;

        const textureConfig = texturesData.find(
          (x) => x.id == shape.backgroundTexture
        );
        let shapeStroke = shape.color;
        if (shape.type === "line") {
          let lineStyleAttr: LineStyle;
          if (shape.lineType !== "") {
            lineStyleAttr =
              lineStyles.find((x) => x.id === shape.lineType) || {};
          }

          if (lineStyleAttr.markerStartName) {
            // addding markers to the defs
            const markerConfig: MarkerConfig =
              markersConfig[lineStyleAttr.markerStartName];
            const endArrowMarker = defs
              .append("marker")
              .attr("id", `${markerConfig.id}${shape.id}`)
              .attr("viewBox", markerConfig.config.viewBox)
              .attr("markerWidth", markerConfig.config.markerWidth)
              .attr("markerHeight", markerConfig.config.markerHeight)
              .attr("refX", markerConfig.config.refX)
              .attr("refY", markerConfig.config.refY)
              .attr("orient", markerConfig.config.orient);

            endArrowMarker
              .append("path")
              .attr("d", markerConfig.config.d)
              .attr("fill", shapeStroke);
          }
          if (lineStyleAttr.markerEndName) {
            // addding markers to the defs
            const markerConfig: MarkerConfig =
              markersConfig[lineStyleAttr.markerEndName];
            const endArrowMarker = defs
              .append("marker")
              .attr("id", `${markerConfig.id}${shape.id}`)
              .attr("viewBox", markerConfig.config.viewBox)
              .attr("markerWidth", markerConfig.config.markerWidth)
              .attr("markerHeight", markerConfig.config.markerHeight)
              .attr("refX", markerConfig.config.refX)
              .attr("refY", markerConfig.config.refY)
              .attr("orient", markerConfig.config.orient)
              .attr("stroke", "context-stroke")
              .attr("fill", "context-fill");

            endArrowMarker
              .append("path")
              .attr("d", markerConfig.config.d)
              .attr("fill", shapeStroke);
          }

          shapeInCanvas
            .attr("x1", (d) => xScale(d.startChainage))
            .attr("x2", (d) => xScale(d.finishChainage))
            .attr("y1", (d) => yScale(new Date(d.startDate)))
            .attr("y2", (d) => yScale(new Date(d.finishDate)))

            .attr("marker-end", `url(#${lineStyleAttr.markerEndId}${shape.id})`)
            .attr(
              "marker-start",
              `url(#${lineStyleAttr.markerStartId}${shape.id})`
            )
            .attr("stroke", shapeStroke)
            .attr("stroke-width", () =>
              lineStyleAttr.style ? lineStyleAttr.style["stroke-width"] : 2
            )
            .attr("stroke-dasharray", () =>
              lineStyleAttr.style ? lineStyleAttr.style["stroke-dasharray"] : ""
            );
        } else if (shape.type === "rect") {
          shapeInCanvas
            .attr("x", (d) => xScale(d.startChainage))
            .attr("y", (d) => yScale(new Date(d.startDate)))
            .attr("stroke", shapeStroke)
            .attr(
              "width",
              (d) => xScale(d.finishChainage) - xScale(d.startChainage)
            )
            .attr(
              "height",
              (d) =>
                yScale(new Date(d.finishDate)) - yScale(new Date(d.startDate))
            );
        } else if (shape.type === "triangle") {
          // Define the points for the triangle (adjust as needed)
          const trianglePoints = `${xScale(d.startChainage)},${yScale(
            new Date(d.startDate)
          )}
                                  ${xScale(d.finishChainage)},${yScale(
            new Date(d.finishDate)
          )}
                                  ${xScale(d.startChainage)},${yScale(
            new Date(d.finishDate)
          )}`;

          shapeInCanvas
            .attr("points", trianglePoints)
            .attr("stroke", shapeStroke);
        } else {
          shapeInCanvas
            .attr("cx", (d) => xScale(d.startChainage))
            .attr("cy", (d) => yScale(new Date(d.startDate)))
            .attr("r", 5);
        }

        // shapeInCanvas.style("stroke", shape.color);
        // .style("fill", textureConfig?.configuration.url());
        if (textureConfig) {
          svg.call(textureConfig?.configuration.stroke(shape.color));
          shapeInCanvas.style("fill", textureConfig?.configuration.url());
        }
        shapeInCanvas.attr("id", `shape-${d.id}`);

        shapeInCanvas
          .on("mouseover", function (event, d) {
            // Show the tooltip and position it
            tooltip.style("display", "block");
            tooltip.style("padding", "10px");
            tooltip.style("background-color", shape.color);
            tooltip.style("left", event.pageX + "px");
            tooltip.style("top", event.pageY + "px");

            // Display shape data in the tooltip
            tooltip.html(generateTooltipContent(d));
          })
          .on("mouseout", function () {
            // Hide the tooltip on mouseout
            tooltip.style("display", "none");
          })

          .on("click", function (event, d) {
            setSelectedShapeData(d as ActivityData);
          });
      });

    // Draw vertical lines at the start and end positions
    g.selectAll(".start-line")
      .data(graphSettings.taskSlots)
      .enter()
      .append("line")
      .attr("class", "start-line")
      .attr("x1", (d) => xScale(d.start))
      .attr("y1", height)
      .attr("x2", (d) => xScale(d.start))
      .attr("y2", (d) => margin.top - 10)
      .attr("stroke", "#7f7a7a")
      .attr("stroke-dasharray", "2,2");

    g.selectAll(".end-line")
      .data(graphSettings.taskSlots)
      .enter()
      .append("line")
      .attr("class", "end-line")
      .attr("x1", (d) => xScale(d.end))
      .attr("y1", height)
      .attr("x2", (d) => xScale(d.end))
      .attr("y2", (d) => margin.top - 10)
      .attr("stroke", "#7f7a7a")
      .attr("stroke-dasharray", "2,2");

    g.selectAll(".slot-label")
      .data(graphSettings.taskSlots)
      .enter()
      .append("text")
      .attr("class", "slot-label")
      .attr("x", (d) => (xScale(d.start) + xScale(d.end)) / 2) // X-coordinate is the midpoint between start and end
      .attr("y", margin.top - 10)
      .attr("dy", "-0.5em") // Adjust vertical alignment as needed
      .style("text-anchor", "middle")
      .text((d) => d.name)
      .each(function (d) {
        const label = d3.select(this);
        const labelWidth = label.node().getBBox().width;

        if (labelWidth > xScale(d.end) - xScale(d.start)) {
          const label = d3.select(this);
          label
            .attr("glyph-orientation-vertical", `90`)
            .style("writing-mode", "tb");
        }
      });
  }, [
    endDate,
    fromDistance,
    graphSettings,
    shapesData.shapesData,
    startDate,
    toDistance,
  ]);

  const createTexture = async (shape, shapeElement) => {
    // Check if there's a texture defined for the shape
    const textureConfig = texturesData.find(
      (x) => x.id === shape.backgroundTexture
    );

    if (textureConfig) {
      try {
        shapeElement.call(textureConfig.configuration.url());
        shapeElement
          .select("rect")
          .style("fill", `url(${textureConfig.configuration.url()})`);
      } catch (error) {
        console.error("Error loading texture:", error);
      }
    }
  };

  const patterns = useMemo(() => {
    const calculatedPatterns = [];

    for (let index = 0; index < shapesData.shapesData.length; index++) {
      const shape = shapesData.shapesData[index];
      const linetype = lineStyles.find((l) => l.id === shape.lineType);
      if (shape.lineType !== "" && linetype) {
        const markerStartName = markersConfig[linetype.markerStartName] ?? null;
        const markerEndName = markersConfig[linetype.markerEndName] ?? null;

        if (markerStartName) {
          const markerStartId = `marker-start-${shape.lineType}-${shape.id}`;

          const pattern: PatternConfig = {
            ...markerStartName,
            id: markerStartId,
            width: shape.markerWidth || 10, // Customize width as needed
            height: shape.markerHeight || 10,
          };

          calculatedPatterns.push(pattern);
        }
        if (markerEndName) {
          const markerEndId = `marker-end-${shape.lineType}-${shape.id}`;

          const pattern: PatternConfig = {
            ...markerEndName,
            id: markerEndId,
            width: shape.markerWidth || 10, // Customize width as needed
            height: shape.markerHeight || 10,
          };

          calculatedPatterns.push(pattern);
        }
      }
    }

    return calculatedPatterns;
  }, [shapesData]);

  useEffect(() => {
    console.log("patters", patterns);
  }, [patterns]);

  const createLegend = () => {
    let lineStyleAttr: LineStyle = {};

    return shapesData.shapesData.map((shape, index) => {
      if (shape.lineType !== "") {
        lineStyleAttr = lineStyles.find((x) => x.id === shape.lineType) || {};
      }
      const textureConfig = texturesData.find(
        (x) => x.id == shape.backgroundTexture
      );
      return (
        <div key={index} className="legend-item">
          <div className="shape-container">
            {shape.type === "line" && (
              <svg width="40" height="20">
                <line
                  x1="10"
                  y1="10"
                  x2="30"
                  y2="10"
                  stroke={shape.color}
                  markerEnd={`url(#${lineStyleAttr.markerEndId}${shape.id})`}
                  markerStart={`url(#${lineStyleAttr.markerStartId}${shape.id})`}
                  strokeWidth={
                    lineStyleAttr.style
                      ? lineStyleAttr.style["stroke-width"]
                      : "2"
                  }
                  strokeDasharray={
                    lineStyleAttr.style
                      ? lineStyleAttr.style["stroke-dasharray"]
                      : "0"
                  }
                />
              </svg>
            )}
            {shape.type === "rect" && (
              <svg width="40" height="20">
                <rect
                  x="10"
                  y="2"
                  width="30"
                  height="16"
                  fill={textureConfig?.configuration.url()}
                  stroke={shape.color}
                />
              </svg>
            )}
            {shape.type === "triangle" && (
              <svg width="40" height="20">
                <polygon
                  points="10,18 40,2 40,18"
                  fill={textureConfig?.configuration.url()}
                  stroke={shape.color}
                />
              </svg>
            )}
            {shape.type === "circle" && (
              <svg width="40" height="20">
                <circle cx="20" cy="10" r="8" fill={shape.color} />
              </svg>
            )}
          </div>
          <div className="text-container">
            <span>{shape.name}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col">
      <div></div>
      <div className="flex">
        <div className="graph-container">
          <div id="tooltip" className="absolute  text-white"></div>
          <svg width={containerWidth} height={containerHeight}>
            <defs>
              {/* {patterns.map((pattern) => {
                return pattern.content(
                  pattern.width,
                  pattern.height,
                  pattern.id
                );
              })} */}
            </defs>
            <g ref={svgRef}></g>
          </svg>
        </div>
      </div>

      <div className="mb-10 w-[70%] mx-auto grid grid-cols-4 gap-2 ">
        <div className="border border-gray-700 p-2 bg-slate-500">
          Activity Name
        </div>
        <div className="border border-gray-700 p-2">
          {selectedShapeData?.activityName}
        </div>

        <div className="border border-gray-700 p-2 bg-slate-500">Style</div>
        <div className="border border-gray-700 p-2">
          {selectedShapeData?.style}
        </div>

        <div className="border border-gray-700 p-2 bg-slate-500">
          Start Date
        </div>
        <div className="border border-gray-700 p-2">
          {moment(selectedShapeData?.startDate).format("MM/DD/YYYY")}
        </div>

        <div className="border border-gray-700 p-2 bg-slate-500">
          Finish Date
        </div>
        <div className="border border-gray-700 p-2">
          {moment(selectedShapeData?.finishDate).format("MM/DD/YYYY")}
        </div>

        <div className="border border-gray-700 p-2 bg-slate-500">
          Start Chainage
        </div>
        <div className="border border-gray-700 p-2">
          {selectedShapeData?.startChainage}
        </div>

        <div className="border border-gray-700 p-2 bg-slate-500">
          Finish Chainage
        </div>
        <div className="border border-gray-700 p-2">
          {selectedShapeData?.finishChainage}
        </div>
      </div>

      <div className="flex justify-center items-center">
        <div className="grid grid-cols-2 gap-4 max-w-[500px]">
          {createLegend()}
        </div>
      </div>
    </div>
  );
}

export default DrawGraphStep;
