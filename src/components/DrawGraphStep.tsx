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
import domtoimage from "dom-to-image";
import logo from "../assets/Logo/logo.png";

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
import { settings } from "firebase/analytics";

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
  const graphSettings = useSelector((state: RootState) => state);
  const shapesData = useSelector((state: RootState) => state.shapes);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const svgContainerRef = useRef<SVGSVGElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomAttr, setZoomAttr] = useState({});

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerSVGRef = useRef<SVGSVGElement | null>(null);
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

  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Function to handle window resize
    const handleResize = () => {
      setContainerWidth(window.innerWidth);

      // Redraw your chart here with the updated dimensions
      drawD3Chart();
    };

    // Add a window resize event listener
    window.addEventListener("resize", handleResize);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  let zoom = d3.zoom().scaleExtent([1, 5]);
  const margin = { top: 40, right: 20, bottom: 100, left: 100 };
  const containerHeight = 1000;
  let width = containerWidth - margin.left - margin.right;
  let height = containerHeight - margin.top - margin.bottom;
  const drawD3Chart = () => {
    const legendContainer = d3.select(legendRef.current!);
    const svg = d3.select(svgRef.current!);
    const containerSVG = d3.select(containerSVGRef.current!);
    svg.selectAll("*").remove();
    const tooltip = d3.select("#tooltip");

    // Set the height attribute of the parent SVG to fit its children

    const xScale = d3
      .scaleLinear()
      .domain([fromDistance, toDistance])
      .range([10, width]);

    const yScale = d3
      .scaleTime()
      .domain([new Date(startDate), new Date(endDate)])
      .range([margin.top, height]);

    const g = svg
      .append("g")
      .attr("width", "100%") // Set the width to 100% of the container
      .attr("height", "100%")
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
      .attr("transform", "translate(5,0)")
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
        if (shape && shape.type === "line") {
          return document.createElementNS("http://www.w3.org/2000/svg", "line");
        } else if (shape && shape.type === "rect") {
          return document.createElementNS("http://www.w3.org/2000/svg", "rect");
        } else if (shape && shape.type === "triangle") {
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
        if (!shape) {
          console.log("🚀 ~ file: DrawGraphStep.tsx:181 ~ shape:", shape, d.id);
          return;
        }
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

    // Create a div for the slots and select it
    const slotsContainer = d3.select("#slots-container"); // Replace with the appropriate selector or use a ref

    // Append slots to the selected div
    g.selectAll(".start-line")
      .data(graphSettings.taskSlots)
      .enter()
      .append("line")
      .attr("class", "start-line")
      .attr("x1", (d) => xScale(d.start))
      .attr("y1", height)
      .attr("x2", (d) => xScale(d.start))
      .attr("y2", (d) => margin.top)
      .attr("stroke", "#857676")
      .attr("stroke-dasharray", "2,2");

    g.selectAll(".end-line")
      .data(graphSettings.taskSlots)
      .enter()
      .append("line")
      .attr("class", "end-line")
      .attr("x1", (d) => xScale(d.end))
      .attr("y1", height)
      .attr("x2", (d) => xScale(d.end))
      .attr("y2", (d) => margin.top)
      .attr("stroke", "#7f7a7a")
      .attr("stroke-dasharray", "2,2");

    // Create rectangles for each task slot
    g.selectAll(".slot-rect")
      .data(graphSettings.taskSlots)
      .enter()
      .append("rect")
      .attr("class", "slot-rect")
      .attr("x", (d) => xScale(d.start))

      .attr("width", (d) => xScale(d.end) - xScale(d.start))
      .attr("height", 20) // Adjust the height as needed
      .style("fill", "none")
      .style("stroke", "gray"); // Gray border

    // Create labels for task slots using foreignObject
    g.selectAll(".slot-label")
      .data(graphSettings.taskSlots)
      .enter()
      .append("foreignObject")
      .attr("class", "slot-label")
      .attr("x", (d) => xScale(d.start))

      .attr("width", (d) => xScale(d.end) - xScale(d.start))
      .attr("height", 20) // Adjust the height as needed
      .append("xhtml:div")
      .style("display", "flex") // Use flexbox for vertical centering
      .style("justify-content", "center") // Center horizontally
      .style("align-items", "center") // Center vertically
      .style("overflow", "hidden")
      .style("white-space", "nowrap")
      .style("text-overflow", "ellipsis")

      .style("padding-bottom", "5px") // Adjust the padding-bottom as needed
      .html((d) => d.name)
      .on("mouseover", function (event: MouseEvent, d: unknown) {
        // Show tooltip on hover
        const slotName = d.name;

        tooltip
          .html(slotName)
          .style("display", "block")
          .style("padding", "10px")
          .style("background-color", "#fa5bd2")
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        // Hide tooltip on mouseout

        tooltip.style("display", "none");
      });

    // Create a zoom behavior
    // Set the minimum and maximum scale levels
    zoom
      .extent([
        [0, 0],
        [containerWidth, containerHeight],
      ])

      .on("zoom", zoomed);

    // Add the zoom behavior to the SVG
    d3.select("#wrapper").on("scroll", scrolled).call(zoom);

    // Define the zoom function
    function zoomed(event) {
      const { transform } = event;

      setZoomLevel(transform.k);

      // Update the xScale and yScale domains
      xScale.domain(transform.rescaleX(xScale).domain());
      yScale.domain(transform.rescaleY(yScale).domain());

      // Apply the transform to the SVG group containing your graph elements
      g.attr("transform", transform);

      // Get the current zoom scale
      const currentScale = transform.k;

      // Define your minimum scale (you can adjust this)
      const minScale = 1;

      // Restrict zooming out beyond the minimum scale
      if (currentScale < minScale) {
        svg.call(
          zoom.transform,
          d3.zoomIdentity.translate(transform.x, transform.y).scale(minScale)
        );
      }

      // Move scrollbars
      const wrapper = d3
        .select("#wrapper")

        .node();
      if (event && currentScale > minScale) {
        wrapper.scrollLeft = -transform.x;
        wrapper.scrollTop = -transform.y;
      }
    }

    svg.on("wheel", (event) => {
      if (event.shiftKey) {
        event.preventDefault();

        // Calculate the zoom scale based on the mousewheel direction
        const scale = event.deltaY > 0 ? 1.2 : 1 / 1.2;

        // Get the current mouse position
        const svgPoint = d3.pointer(event)[0];

        // Calculate the new zoom point
        const zoomPoint = transformPoint(svgPoint, svg);

        // Apply the zoom transformation
        svg.call(
          zoom.transform,
          d3.zoomIdentity.translate(zoomPoint[0], zoomPoint[1]).scale(scale)
        );
      }
    });

    function scrolled() {
      const wrapper = d3.select("#wrapper");
      const x = wrapper.node().scrollLeft + wrapper.node().clientWidth / 2;
      const y = wrapper.node().scrollTop + wrapper.node().clientHeight / 2;
      const scale = d3.zoomTransform(wrapper.node()).k;
      // Update zoom parameters based on scrollbar positions.
      wrapper.call(d3.zoom().translateTo, x / scale, y / scale);
    }
    // Function to transform a point from screen coordinates to SVG coordinates
    function transformPoint(point, svg, zoom) {
      const containerSVG = d3.select<SVGSVGElement, unknown>(svgSelector);
      if (!containerSVG.empty()) {
        const matrix = containerSVG.node()?.getScreenCTM()?.inverse();
        if (matrix) {
          const svgPoint = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg:point"
          );
          svgPoint.x = point[0];
          svgPoint.y = point[1];
          return svgPoint.matrixTransform(matrix);
        }
      }
      return null;
    }

    // Allow horizontal scrolling by adjusting the viewBox
    containerSVG.call(
      zoom.transform,
      d3.zoomIdentity.translate(0, 0).scale(1).translate(margin.left, 0) // Adjust based on your margin: ;
    );
  };
  useEffect(() => {
    drawD3Chart();
    // Gray border
  }, [
    endDate,
    fromDistance,
    graphSettings,
    height,
    margin.left,
    margin.top,
    shapesData.shapesData,
    startDate,
    timeRange,
    toDistance,
    width,
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
  const resetZoom = () => {
    drawD3Chart();
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
  const A4_WIDTH_MM = 270; // A4 width in millimeters
  const A4_HEIGHT_MM = 297; // A4 height in millimeters
  const DPI = 300; // Set the desired DPI (e.g., 300 for high quality)

  const saveAsPdfOrImage = (format) => {
    const svgContainer = document.getElementById("graph-container");
    const myStyle = svgContainer;
    // Calculate the dimensions in pixels, converting mm to pixels using a standard DPI value (e.g., 96 DPI)
    const pageWidthPx = Math.floor(((A4_WIDTH_MM - 40) * 96) / 15.4); // Subtract 4 cm from the width
    const pageHeightPx = Math.floor(((A4_HEIGHT_MM - 40) * 96) / 15.4); // Subtract 4 cm from the height

    domtoimage
      .toPng(svgContainer, {
        width: pageWidthPx,
        height: pageHeightPx,
      })
      .then((dataUrl) => {
        if (format === "pdf") {
          // Create a PDF document with A4 dimensions minus margins
          const pdf = new jsPDF("landscape", "mm", [
            A4_WIDTH_MM - 40,
            A4_HEIGHT_MM - 40,
          ]); // Subtract 4 cm from both width and height

          // Calculate the dimensions and position for the SVG in the PDF
          const imgWidth = A4_WIDTH_MM - 40; // Subtract 4 cm from the width
          const imgHeight = A4_HEIGHT_MM - 40; // Subtract 4 cm from the height
          const xPosition = 20; // 2 cm left margin
          const yPosition = 20; // 2 cm top margin

          pdf.addImage(
            dataUrl,
            "PNG",
            xPosition,
            yPosition,
            imgWidth,
            imgHeight
          );
          pdf.save("graph.pdf");
        } else if (format === "image") {
          // Create a new SVG element with a white background
          const svgWithWhiteBackground = document.createElement("div");
          svgWithWhiteBackground.style.backgroundColor = "white";
          svgWithWhiteBackground.appendChild(svgContainer.cloneNode(true));

          // Convert the modified SVG to an image
          domtoimage
            .toPng(svgWithWhiteBackground, {
              width: pageWidthPx,
              height: pageHeightPx,
            })
            .then((whiteBgDataUrl) => {
              const image = new Image();
              image.src = whiteBgDataUrl;

              // Create a link element for downloading the image
              const downloadLink = document.createElement("a");
              downloadLink.href = whiteBgDataUrl;
              downloadLink.download = "graph.png"; // Specify the file name here

              // Trigger a click event on the link to initiate the download
              downloadLink.click();
            });
        }
      });
  };

  return (
    <div className="flex flex-col">
      <div>
        <button
          className="focus:outline-none mt-5 text-white bg-purple-500 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
          onClick={() => saveAsPdfOrImage("pdf")}
        >
          Save as PDF
        </button>
        {/* <button
          className="focus:outline-none mt-5 text-white bg-purple-500 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
          onClick={() => saveAsPdfOrImage("image")}
        >
          Save as image
        </button> */}
      </div>

      <div className="flex flex-col" id="graph-container">
        {zoomLevel > 1 && (
          <button
            className="focus:outline-none mt-2 text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            onClick={resetZoom}
          >
            Reset Zoom
          </button>
        )}
        <div className="graph-container">
          <div className="flex items-center border m-4">
            <img
              src={logo}
              className="h-20 w-40 mr-4"
              alt={graphSettings.projectSettings.title}
            />
            <div className="flex-grow text-center">
              <p className="text-2xl">{graphSettings.projectSettings.title}</p>
            </div>
            <img
              src={graphSettings.projectSettings.logoImg}
              className="h-20 w-40 "
              alt={graphSettings.projectSettings.title}
            />
          </div>

          <div id="tooltip" className="absolute  text-white"></div>
          <div id="wrapper">
            <svg
              ref={containerSVGRef}
              style={{
                minHeight: containerHeight,
                minWidth: containerWidth,
              }}
            >
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
        <div className="flex w-full justify-center items-center mb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 w-full px-5">
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
