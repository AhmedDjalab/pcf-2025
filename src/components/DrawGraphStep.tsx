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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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

  const svgRef = useRef<SVGSVGElement | null>(null);
  const legendRef = useRef<HTMLDivElement | null>(null);
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
  // const handleDateChange = (dates) => {
  //   const [start, end] = dates;
  //   setStartDate(start);
  //   setEndDate(end);
  // };
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
            .attr("x1", (d: unknown) =>
              xScale((d as GraphDataType).startChainage)
            )
            .attr("x2", (d) => xScale((d as GraphDataType).finishChainage))
            .attr("y1", (d) => yScale(new Date((d as GraphDataType).startDate)))
            .attr("y2", (d) =>
              yScale(new Date((d as GraphDataType).finishDate))
            )

            .attr("marker-end", `url(#${lineStyleAttr.markerEndId}${shape.id})`)
            .attr(
              "marker-start",
              `url(#${lineStyleAttr.markerStartId}${shape.id})`
            )
            .attr("stroke", shapeStroke)
            .attr("stroke-width", () =>
              lineStyleAttr.style ? lineStyleAttr.style["stroke-width"] : 2
            )
            .attr(
              "stroke-dasharray",
              lineStyleAttr.style ? lineStyleAttr.style["stroke-dasharray"] : ""
            );
        } else if (shape.type === "rect") {
          shapeInCanvas
            .attr("x", (d) => xScale((d as GraphDataType).startChainage))
            .attr("y", (d) => yScale(new Date((d as GraphDataType).startDate)))
            .attr("stroke", shapeStroke)
            .attr(
              "width",
              (d) =>
                xScale((d as GraphDataType).finishChainage) -
                xScale((d as GraphDataType).startChainage)
            )
            .attr(
              "height",
              (d) =>
                yScale(new Date((d as GraphDataType).finishDate)) -
                yScale(new Date((d as GraphDataType).startDate))
            );
        } else if (shape.type === "triangle") {
          // Define the points for the triangle (adjust as needed)
          const trianglePoints = `${xScale(
            (d as GraphDataType).startChainage
          )},${yScale(new Date((d as GraphDataType).startDate))}
                                  ${xScale(
                                    (d as GraphDataType).finishChainage
                                  )},${yScale(
            new Date((d as GraphDataType).finishDate)
          )}
                                  ${xScale(
                                    (d as GraphDataType).startChainage
                                  )},${yScale(
            new Date((d as GraphDataType).finishDate)
          )}`;

          shapeInCanvas
            .attr("points", trianglePoints)
            .attr("stroke", shapeStroke);
        } else {
          shapeInCanvas
            .attr("cx", (d) => xScale((d as GraphDataType).startChainage))
            .attr("cy", (d) => yScale(new Date((d as GraphDataType).startDate)))
            .attr("r", 5);
        }

        // shapeInCanvas.style("stroke", shape.color);
        // .style("fill", textureConfig?.configuration.url());
        if (textureConfig) {
          svg.call(textureConfig?.configuration.stroke(shape.color));
          shapeInCanvas.style("fill", textureConfig?.configuration.url());
        }
        shapeInCanvas.attr("id", `shape-${(d as GraphDataType).id}`);

        shapeInCanvas
          .on("mouseover", function (event: MouseEvent, d: unknown) {
            // Show the tooltip and position it
            tooltip.style("display", "block");
            tooltip.style("padding", "10px");
            tooltip.style("background-color", shape.color);
            tooltip.style("left", event.pageX + "px");
            tooltip.style("top", event.pageY + "px");

            // Display shape data in the tooltip
            tooltip.html(generateTooltipContent(d as GraphDataType));
          })
          .on("mouseout", function () {
            // Hide the tooltip on mouseout
            tooltip.style("display", "none");
          })

          .on("click", function (event, d) {
            setSelectedShapeData(d as ActivityData);
          });
      });

    // Create horizontal guidelines from y-axis ticks
    const yAxisTicks = g.selectAll(".y-axis text").nodes();
    const yGuidelines = g
      .selectAll(".y-guideline")
      .data(yAxisTicks.map((node) => d3.select(node).text()))
      .enter()
      .append("line")
      .attr("class", "y-guideline")
      .attr("x1", 0)
      .attr("x2", width + margin.left)
      .attr("y1", (d) => yScale(moment(d, "ddd MM/DD/YYYY")))
      .attr("y2", (d) => yScale(moment(d, "ddd MM/DD/YYYY")))
      .attr("stroke", "#dbd9d9")
      .attr("stroke-dasharray", "2,2");

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
        const labelWidth = label!.node()!.getBBox().width;

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

  // const createTexture = async (shape, shapeElement) => {
  //   // Check if there's a texture defined for the shape
  //   const textureConfig = texturesData.find(
  //     (x) => x.id === shape.backgroundTexture
  //   );

  //   if (textureConfig) {
  //     try {
  //       shapeElement.call(textureConfig.configuration.url());
  //       shapeElement
  //         .select("rect")
  //         .style("fill", `url(${textureConfig.configuration.url()})`);
  //     } catch (error) {
  //       console.error("Error loading texture:", error);
  //     }
  //   }
  // };

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
  const A4_WIDTH_MM = 270; // A4 width in millimeters
  const A4_HEIGHT_MM = 297; // A4 height in millimeters
  const DPI = 300; // Set the desired DPI (e.g., 300 for high quality)

  const saveAsPdfOrImage = (format) => {
    const svgContainer = document.getElementById("graph-container");

    // Calculate the scale factors for width and height
    const scaleWidth = (A4_WIDTH_MM * DPI) / (svgContainer.offsetWidth * 25.4);
    const scaleHeight =
      (A4_HEIGHT_MM * DPI) / (svgContainer.offsetHeight * 25.4);

    // Use the minimum of the two scale factors to ensure the entire graph fits
    const scale = Math.min(scaleWidth, scaleHeight);

    html2canvas(svgContainer, {
      scale: scale,
      dpi: DPI,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      if (format === "pdf") {
        // Create a PDF document with A4 dimensions
        const pdf = new jsPDF("landscape", "mm", [A4_WIDTH_MM, A4_HEIGHT_MM]);
        const imgWidth = A4_WIDTH_MM;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("graph.pdf");
      }
    });
  };
  return (
    <div className="flex flex-col">
      <div>
        <button onClick={() => saveAsPdfOrImage("pdf")}>Save as PDF</button>
        <button onClick={() => saveAsPdfOrImage("image")}>Save as Image</button>
      </div>
      <div className="flex flex-col" id="graph-container">
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
        <div className="flex justify-center items-center mb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 max-w-[500px]">
            {createLegend()}
          </div>
        </div>
      </div>

      <div className="mb-10 mx-auto sm:w-[70%] lg:w-[50%]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
      </div>
    </div>
  );
}

export default DrawGraphStep;
