//@ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state";
import {
  GraphDataType,
  TaskSlot,
  removeActivity,
  updateGraphSettingsValue,
} from "../state/slices/graphSlice";
import texturesData from "../const/texturesArray";
import moment from "moment";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image";
import logo from "../assets/Logo/logo.png";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import * as XLSX from "xlsx";

import { LineStyle, lineStyles } from "../const/linesArray";
import {
  MarkerConfig,
  PatternConfig,
  markersConfig,
} from "../const/markerAndPatternsConfig";
import { useTranslation } from "react-i18next";
import ActivityTableForm from "./ActivityTableForm";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import DefaultLayout from "./DefaultLayout";
import StyleForm from "./ShapesPopup";
import { useLocation, useNavigate } from "react-router-dom";

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
  let graphSettings = useSelector((state: RootState) => state);
  let graphData = useSelector((state: RootState) => state.settings.graphData);
  let startDate = useSelector((state: RootState) => state.settings.fromDate);
  let endDate = useSelector((state: RootState) => state.settings.toDate);
  let rawData = useSelector((state: RootState) => state.rawGraphDataFromFile);
  const fromDistance = useSelector(
    (state: RootState) => state.settings.fromDistance
  );
  const toDistance = useSelector(
    (state: RootState) => state.settings.toDistance
  );
  const timeRange = useSelector((state: RootState) => state.settings.timeRange);
  const distanceRange = useSelector(
    (state: RootState) => state.settings.distanceRange
  );
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();

  const [graphSize, setGraphSize] = useState(graphData.length);
  const shapesData = useSelector((state: RootState) => state.shapes);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomAttr, setZoomAttr] = useState({});
  const [selectedShapeType, setSelectedShapeType] = useState(null);
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStyleModalOpen, setStyleModalOpen] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const svgRef2 = useRef<SVGSVGElement | null>(null);
  const containerSVGRef = useRef<SVGSVGElement | null>(null);
  const legendRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  let zoom = d3.zoom().scaleExtent([1, 5]);
  const margin = { top: 100, right: 20, bottom: 100, left: 100 };
  const rawcontainerHeight = 1000;
  const rawcontainerWidth = window.innerWidth;
  let width = rawcontainerHeight - margin.left - margin.right;
  let height = rawcontainerWidth - margin.top - margin.bottom;
  const navigate = useNavigate();
  const location = useLocation();

  const [containerWidth, setContainerWidth] = useState(rawcontainerWidth);
  const [containerHeight, setContainerHeight] = useState(height);

  // State to manage the selected date range

  let startDateObject = useMemo(() => new Date(startDate), [startDate]);
  let endDateObject = useMemo(() => new Date(endDate), [endDate]);

  startDateObject.setDate(1);
  endDateObject.setDate(1);
  if (timeRange === "Yearly") {
    if (startDateObject.getFullYear() === endDateObject.getFullYear()) {
      startDateObject.setMonth(0);
      endDateObject.setMonth(0);
      endDateObject.setFullYear(startDateObject.getFullYear() + 1);
    }
  }

  const [selectedShapeData, setSelectedShapeData] = useState<GraphDataType>();
  const [patternsData, setPatternsData] = useState<any[]>([]);
  const sanitizeClassName = (key: string): string => {
    // Replace any characters that are not letters, numbers, hyphens, or underscores with hyphens
    return key.replace(/[^a-zA-Z0-9-_]/g, "-");
  };

  const generateTooltipContent = (data: GraphDataType) => {
    return `
    <strong>ID:</strong> ${data.id}<br>
    <strong>${t("drawGraph.activityDetails.activityNameLabel")}:</strong> ${
      data.activityName
    }<br>
    <strong>${t("drawGraph.activityDetails.startDateLabel")}:</strong> ${moment(
      data.startDate
    ).format("DD/MM/YYYY")}<br>
    <strong>${t(
      "drawGraph.activityDetails.finishDateLabel"
    )}:</strong> ${moment(data.finishDate).format("DD/MM/YYYY")}<br>
    <strong>${t("drawGraph.activityDetails.startChainageLabel")}:</strong> ${
      data.startChainage
    }<br>
    <strong>${t("drawGraph.activityDetails.finishChainageLabel")}:</strong> ${
      data.finishChainage
    }<br>
    <strong>${t("drawGraph.activityDetails.styleLabel")}:</strong> ${data.style}
  `;
  };
  // const handleDateChange = (dates) => {
  //   const [start, end] = dates;
  //   setStartDate(start);
  //   setEndDate(end);
  // };
  const DrawXScale = (distanceAxisWidth: number) => {
    return d3
      .scaleLinear()
      .domain([fromDistance, toDistance])
      .range([10, distanceAxisWidth]);
  };

  useEffect(() => {
    // Function to handle window resize
    const handleResize = () => {
      // setContainerWidth(window.innerWidth);

      // Redraw your chart here with the updated dimensions
      drawD3Chart();
    };

    // Add a window resize event listener
    window.addEventListener("resize", handleResize);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [startDateObject, endDateObject]);

  //? drawing D3 graph
  const drawAxises = useCallback(
    (
      xScale: d3.ScaleLinear<number, number, never>,
      yScale: d3.ScaleTime<number, number, never>,
      g: d3.Selection<SVGGElement, unknown, null, undefined>
    ) => {
      const xAxis = d3
        .axisBottom(xScale)
        .ticks((toDistance - fromDistance) / distanceRange);

      let yAxis = d3.axisLeft(yScale);
      let tickSpacing = 20;
      let totalHeight = 1 * tickSpacing;

      if (timeRange === "Yearly") {
        // Generate an array of tick values for yearly intervals
        tickSpacing *= 2;
        const ticks = d3.timeYear
          .every(1)
          .range(startDateObject, endDateObject);

        // Ensure there's at least one tick for the start date
        if (ticks[0] > startDateObject) {
          ticks.unshift(startDateObject);
        }

        // Set the tick values
        yAxis.tickValues(ticks);

        // Calculate the total height based on the number of ticks and tickSpacing
        const ticksCount = ticks.length;

        totalHeight =
          ticksCount * tickSpacing < window.innerHeight
            ? ticksCount * 200
            : ticksCount * tickSpacing;
        //yScale.range([margin.top, margin.top + totalHeight]);
      } else if (timeRange === "Monthly") {
        // Adjust the spacing between ticks as needed

        // Generate an array of tick values for monthly intervals
        const ticks = d3.timeMonth
          .every(1)
          .range(startDateObject, endDateObject);

        // Ensure there's at least one tick for the start date
        if (ticks[0] > startDateObject) {
          ticks.unshift(startDateObject);
        }

        // Set the tick values
        yAxis.tickValues(ticks);

        // Calculate the total height based on the number of ticks and tickSpacing
        const ticksCount = ticks.length;
        const adjustedTicksCount = Math.max(2, ticksCount); // Ensure a minimum of 2 ticks

        totalHeight =
          adjustedTicksCount * tickSpacing < 200
            ? adjustedTicksCount * 200
            : adjustedTicksCount * tickSpacing;
      } else if (timeRange === "Weekly") {
        const ticksCount = d3.timeWeek.count(
          new Date(startDate),
          new Date(endDate)
        );
        yAxis.ticks(d3.timeWeek.every(1));
        // this is only for test
        // Calculate the total height required for the ticks
        var ticksHeight = ticksCount * tickSpacing;
        totalHeight =
          ticksHeight < rawcontainerHeight ? rawcontainerHeight : ticksHeight;
      } else if (timeRange.includes("Daily")) {
        const ticksCount = d3.timeDay.count(startDateObject, endDateObject);

        yAxis.ticks(d3.timeDay.every(1));

        // Calculate the total height required for the ticks
        totalHeight = ticksCount * tickSpacing;
      }

      yScale.range([margin.top, totalHeight]);
      setContainerHeight(totalHeight + margin.top);
      g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${totalHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "middle")
        .attr("dy", "1em");

      g.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(5,0)")
        .call(yAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.5em")
        .text((d) => d3.timeFormat("%a %d/%m/%Y")(d));
    },
    [
      distanceRange,
      endDate,
      endDateObject,
      fromDistance,
      margin.top,
      startDate,
      startDateObject,
      timeRange,
      toDistance,
    ]
  );

  const drawShapes = useCallback(
    (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
      xScale: d3.ScaleLinear<number, number, never>,
      yScale: d3.ScaleTime<number, number, never>,
      tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>
    ) => {
      const shapes = g
        .selectAll(".activity-rectangle")
        .data(graphData, (d: GraphDataType) => d.id);

      shapes
        .enter()
        .append((d) => {
          let shape = shapesData.shapesData.find((x) => x.id === d.style)!;

          if (shape && shape.type === "line") {
            return document.createElementNS(
              "http://www.w3.org/2000/svg",
              "line"
            );
          } else if (shape && shape.type === "rect") {
            return document.createElementNS(
              "http://www.w3.org/2000/svg",
              "rect"
            );
          } else if (shape && shape.type === "triangle") {
            return document.createElementNS(
              "http://www.w3.org/2000/svg",
              "polygon"
            );
          }
          return document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
        })
        .attr("class", "activity-rectangle")
        .each(function (d: GraphDataType) {
          const defs = svg.select("defs");
          const shapeInCanvas = d3.select(this);
          let shape = shapesData.shapesData.find((x) => x.id === d.style)!;

          if (!shape) {
            return;
          }
          // Define boundaries
          const minStartDate = startDateObject;

          const maxEndDate = endDateObject;

          const minStartChainage = fromDistance;
          const maxFinishChainage = toDistance;

          // Calculate the adjusted coordinates
          let x1 = xScale(d.startChainage);
          let x2 = xScale(d.finishChainage);
          let y1 = yScale(new Date(d.startDate));
          let y2 = yScale(new Date(d.finishDate));

          // Adjust the coordinates to stay within the boundaries
          x1 = Math.max(x1, xScale(minStartChainage));
          x2 = Math.min(x2, xScale(maxFinishChainage));
          y1 = Math.max(y1, yScale(minStartDate));
          y2 = Math.min(y2, yScale(maxEndDate));
          const textureConfig = texturesData.find(
            (x) => x.id === shape.backgroundTexture
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
                .attr("id", `${markerConfig.id}${textureConfig.id}`)
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
              .attr("x1", x1)
              .attr("x2", x2)
              .attr("y1", y1)
              .attr("y2", y2)

              .attr(
                "marker-end",
                `url(#${lineStyleAttr.markerEndId}${shape.id})`
              )
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
                lineStyleAttr.style
                  ? lineStyleAttr.style["stroke-dasharray"]
                  : ""
              );
          } else if (shape.type === "rect") {
            x1 = Math.min(x1, x2); // Adjust x1 if it's greater than x2
            y1 = Math.min(y1, y2); // Adjust y1 if it's greater than y2
            x2 = Math.max(x1, x2);
            y2 = Math.max(y1, y2);
            shapeInCanvas
              .attr("x", x1)
              .attr("y", y1)
              .attr("stroke", shapeStroke)

              .attr("width", x2 - x1)
              .attr("height", y2 - y1);
          } else if (shape.type === "triangle") {
            // Define the points for the triangle (adjust as needed)
            const trianglePoints = `${x1},${y1} ${x2},${y2} ${x1},${y2}`;

            shapeInCanvas
              .attr("points", trianglePoints)
              .attr("stroke", shapeStroke);
          } else {
            shapeInCanvas
              .attr("cx", (x1 + x2) / 2)
              .attr("cy", (y1 + y2) / 2)
              .attr("r", 5);
          }
          let textureId = "";
          if (textureConfig) {
            textureId = sanitizeClassName(shape.id + textureConfig.id);

            // svg.call(
            //   textureConfig?.configuration.id(shape.id).stroke(shapeStroke)
            // );
            shapeInCanvas.style(
              "fill",
              textureConfig?.configuration.id(textureId).url()
            );
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

      shapes.exit().remove();
    },
    [
      endDateObject,
      fromDistance,
      generateTooltipContent,
      graphData,
      shapesData.shapesData,
      startDateObject,
      toDistance,
    ]
  );

  const drawTaskSlot = useCallback(
    (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      xScale: d3.ScaleLinear<number, number, never>,
      yScale: d3.ScaleLinear<number, number, never>,
      tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
      taskSlots: TaskSlot[],
      slotClassName: "Task1" | "Task2"
    ) => {
      const minStartDate = startDateObject;

      const maxEndDate = endDateObject;

      // let x1 = xScale(new Date(d.startDate));
      // let x2 = xScale(new Date(d.finishDate));
      // x1 = Math.max(x1, xScale(minStartDate));
      // x2 = Math.min(x2, xScale(maxEndDate));

      const startSlot = g
        .selectAll(".start-" + slotClassName)
        .data(taskSlots)
        .enter();

      startSlot
        .append("line")
        .attr("class", "start-" + slotClassName)
        .attr("x1", (d) => xScale(d.start))
        .attr("y1", (d) => yScale(endDateObject))
        .attr("x2", (d) => xScale(d.start))
        .attr("y2", () => (slotClassName === "Task1" ? 45 : 0))
        .attr("stroke", slotClassName === "Task1" ? "#ed9b9b" : "#6c9ae8")
        .attr("stroke-dasharray", "2,2");

      const endslot = g
        .selectAll(".end-" + slotClassName)
        .data(taskSlots)
        .enter();

      endslot
        .append("line")
        .attr("class", "end-" + slotClassName)
        .attr("x1", (d) => xScale(d.end))
        .attr("y1", (d) => yScale(endDateObject))
        .attr("x2", (d) => xScale(d.end))
        .attr("y2", () => (slotClassName === "Task1" ? 45 : 0))
        .attr("stroke", slotClassName === "Task1" ? "#ed9b9b" : "#6c9ae8")
        .attr("stroke-dasharray", "2,2");

      // Create rectangles for each task slot
      const slotsvg = g
        .selectAll(".slot-rect-" + slotClassName)
        .data(taskSlots);

      slotsvg
        .enter()
        .append("rect")
        .attr("class", "slot-rect-" + slotClassName)
        .attr("x", (d) => xScale(d.start))
        .attr("y", () => (slotClassName === "Task1" ? 45 : 0))

        .attr("width", (d) => xScale(d.end) - xScale(d.start))
        .attr("height", 35)

        .style("fill", "none")
        .style("stroke", slotClassName === "Task1" ? "#ed9b9b" : "#6c9ae8");

      // Create labels for task slots using foreignObject
      const labels = g
        .selectAll(".slot-label-" + slotClassName)
        .data(taskSlots)
        .enter();

      labels
        .append("foreignObject")
        .attr("class", "slot-label-" + slotClassName)
        .attr("x", (d) => xScale(d.start))
        .attr("y", () => (slotClassName === "Task1" ? 45 : 0))
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
            .style(
              "background-color",
              slotClassName === "Task1" ? "#ed9b9b" : "#6c9ae8"
            )
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          // Hide tooltip on mouseout
          tooltip.style("display", "none");
        });

      startSlot.exit().remove();
      endslot.exit().remove();
      slotsvg.exit().remove();
      labels.exit().remove();
    },
    [containerHeight, endDateObject, margin.top, startDateObject]
  );

  const callTextureData = useCallback(() => {
    const svg = d3.select(svgRef2.current);
    svg.selectAll("*").remove();

    shapesData.shapesData.forEach((shape) => {
      let selectedTexture = texturesData.find(
        (x) => x.id === shape.backgroundTexture
      );

      if (selectedTexture) {
        const optionTexture = selectedTexture.configuration
          .id(sanitizeClassName(shape.id + selectedTexture.id))
          .stroke(shape.color);
        svg.call(optionTexture);
      }
    });
  }, [shapesData.shapesData]);

  const drawD3Chart = useCallback(() => {
    // Set the height attribute of the parent SVG to fit its children

    const svg = d3.select(svgRef.current!);
    const containerSVG = d3.select(containerSVGRef.current!);

    svg.selectAll("*").remove();

    const tooltip = d3.select("#tooltip");

    const distanceAxisWidth =
      50 * ((toDistance - fromDistance) / distanceRange) < window.innerWidth
        ? window.innerWidth
        : 50 * ((toDistance - fromDistance) / distanceRange);

    setContainerWidth(distanceAxisWidth);
    const xScale = DrawXScale(distanceAxisWidth);

    const yScale = d3.scaleTime().domain([startDateObject, endDateObject]);

    const g = svg
      .append("g")
      .attr("width", "100%") // Set the width to 100% of the container
      .attr("height", "100%")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    //?? x axis
    drawAxises(xScale, yScale, g);

    drawShapes(g, svg, xScale, yScale, tooltip);

    // Create horizontal guidelines from y-axis ticks
    //const yAxisTicks = g.selectAll(".y-axis text").nodes();

    // Create a div for the slots and select it

    drawTaskSlot(
      g,
      xScale,
      yScale,
      tooltip,
      graphSettings.taskSlotsLevelTwo,
      "Task2"
    );
    // Append slots to the selected div
    drawTaskSlot(g, xScale, yScale, tooltip, graphSettings.taskSlots, "Task1");

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
    function transformPoint(point, svg) {
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
  }, [
    toDistance,
    fromDistance,
    distanceRange,
    DrawXScale,
    startDateObject,
    endDateObject,
    margin.left,
    margin.top,
    drawAxises,
    drawShapes,
    drawTaskSlot,
    graphSettings.taskSlotsLevelTwo,
    graphSettings.taskSlots,
    zoom,
    containerWidth,
    containerHeight,
    shapesData,
  ]);

  useEffect(() => {
    drawD3Chart();
    // Gray border
  }, [graphData]);

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

  useEffect(() => {
    callTextureData();
  }, [callTextureData, shapesData.shapesData, svgRef2]);

  const resetZoom = () => {
    // const svg = d3.select(svgRef.current); // Ensure svgRef.current is defined
    // const g = svg.select("g"); // Adjust the selector to match your chart structure

    // if (g) {
    //   // Reset the zoom transform to its initial state
    //   g.transition().duration(500).call(zoom().transform, zoomIdentity);
    // }
    drawD3Chart();
  };

  useEffect(() => {
    // Check if any shape name is clicked
    const isShapeNameClicked = selectedShapes.length > 0;

    d3.selectAll(".activity-rectangle")
      .transition()
      .duration(200)
      .attr("opacity", (d: GraphDataType) => {
        if (isShapeNameClicked) {
          // If a shape name is clicked, set opacity to 0.2 for all shapes except the selected one
          return selectedShapes.includes(d.style) ? 1 : 0.2;
        } else {
          // If no shape name is clicked, set opacity to 1 for all shapes
          return 1;
        }
      });
  }, [selectedShapes]);

  const createLegend = () => {
    let lineStyleAttr: LineStyle = {};

    return shapesData.shapesData.map((shape, index) => {
      if (shape.lineType !== "") {
        lineStyleAttr = lineStyles.find((x) => x.id === shape.lineType) || {};
      }
      const textureConfig = texturesData.find(
        (x) => x.id === shape.backgroundTexture
      );

      const textureId = sanitizeClassName(shape.id + textureConfig.id);

      // const handleMouseOver = () => {
      //   // Select all shapes and fade them out except the one being hovered over
      //   d3.selectAll(".activity-rectangle")
      //     .transition()
      //     .duration(200)
      //     .attr("opacity", (d: GraphDataType) => {
      //       console.log("this is ", d.style, shape.name);
      //       if (d.style) {
      //         return d.style.trim() === shape.name.trim() ? 1 : 0.2;
      //       } else {
      //         return 1;
      //       }
      //     });
      // };

      // const handleMouseOut = () => {
      //   // Restore opacity for all shapes
      //   d3.selectAll(".activity-rectangle")
      //     .transition()
      //     .duration(200)
      //     .attr("opacity", 1);
      // };
      const isSelected = selectedShapes.includes(shape.name);
      const handleLegendItemClick = (shape) => {
        // Toggle the selected shape
        if (selectedShapes.includes(shape.name)) {
          setSelectedShapes(
            selectedShapes.filter((selected) => selected !== shape.name)
          );
        } else {
          setSelectedShapes([...selectedShapes, shape.name]);
        }
      };

      return (
        <div
          key={index}
          className="legend-item"
          // onMouseOver={handleMouseOver}
          // onMouseOut={handleMouseOut}
          onClick={() => handleLegendItemClick(shape)}
        >
          <div className="shape-container">
            {shape.type === "line" && (
              <svg width="40" height="20" ref={svgRef2}>
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
                  fill={textureConfig?.configuration.id(textureId).url()}
                  stroke={shape.color}
                />
              </svg>
            )}
            {shape.type === "triangle" && (
              <svg width="40" height="20" ref={svgRef2}>
                <polygon
                  points="10,18 40,2 40,18"
                  fill={textureConfig?.configuration.id(textureId).url()}
                  stroke={shape.color}
                />
              </svg>
            )}
            {shape.type === "circle" && (
              <svg width="40" height="20" ref={svgRef2}>
                <circle cx="20" cy="10" r="8" fill={shape.color} />
              </svg>
            )}
          </div>
          <div className="text-container">
            <span
              style={{
                color: isSelected ? "blue" : "black",
                cursor: "pointer",
              }}
            >
              {shape.name}
            </span>
          </div>
        </div>
      );
    });
  };
  const A4_WIDTH_MM = 270; // A4 width in millimeters
  const A4_HEIGHT_MM = 297; // A4 height in millimeters

  const saveAsPdfOrImage = (format) => {
    const svgContainer = document.getElementById("graph-container");
    // Save the current zoom transform
    //drawD3Chart();

    // Calculate the dimensions in pixels based on the user's device DPI
    const dpi = window.devicePixelRatio || 1; // Get the device DPI

    const pageWidthPx = Math.floor((A4_WIDTH_MM * dpi) / 25.4); // Convert mm to pixels
    const pageHeightPx = Math.floor((A4_HEIGHT_MM * dpi) / 25.4);

    // // Adjust the chart container's dimensions using CSS
    // svgContainer.style.width = `${pageWidthPx}px`;
    // svgContainer.style.height = `${pageHeightPx}px`;

    domtoimage
      .toPng(svgContainer, {
        width: pageWidthPx,
        height: pageHeightPx,
      })
      .then((dataUrl) => {
        if (format === "pdf") {
          // Create a PDF document with A4 dimensions minus margins
          const pdf = new jsPDF("portrait", "mm", [A4_WIDTH_MM, A4_HEIGHT_MM]); // Subtract 4 cm from both width and height

          const imgWidth = A4_WIDTH_MM; // Width without margins
          const imgHeight = A4_HEIGHT_MM; // Height without margins
          const xPosition = 10; // 1 cm left margin
          const yPosition = 10; // 1 cm top margin

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

  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && zoomLevel > 1) {
        resetZoom();
      }
    };

    // Add event listener when the component mounts
    document.addEventListener("keydown", handleEscapeKey);

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [zoomLevel, resetZoom]);

  //! hadle add and edit

  const handleDeleteClick = () => {
    dispatch(removeActivity({ activityId: selectedShapeData?.id }));
  };
  const handleAddClick = () => {
    setSelectedShapeData(null);
    setIsModalOpen(true);
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedShapeData(null);
  };
  const closeStyleModal = () => {
    setStyleModalOpen(false);
    setSelectedShapeData(null);
    navigate("/refresh");
    navigate(-1);
  };
  const submitStyleModal = () => {
    setStyleModalOpen(false);
    setSelectedShapeData(null);
  };

  // export logic
  const handleExportGraphClick = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      graphData.map(({ styleId, ...rest }) => rest) // Exclude styleID
    );

    // Format the headers to uppercase
    worksheet["A1"].v = "ID";
    worksheet["B1"].v = "ACTIVITY NAME";
    worksheet["C1"].v = "START DATE";
    worksheet["D1"].v = "FINISH DATE";
    worksheet["E1"].v = "START CHAINAGE";
    worksheet["F1"].v = "FINISH CHAINAGE";
    worksheet["G1"].v = "STYLE";

    // Iterate through the data and trim field values
    for (let i = 2; i <= graphData.length + 1; i++) {
      worksheet["A" + i].v = (worksheet["A" + i].v || "").trim();
      worksheet["B" + i].v = (worksheet["B" + i].v || "").trim();

      worksheet["G" + i].v = (worksheet["G" + i].v || "").trim();
    }

    // Create a new workbook and add the worksheet to it
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Graph Data");

    // Export the workbook to an XLSX file
    XLSX.writeFile(workbook, "graphData.xlsx");
  };
  const handleExportAllClick = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      rawData.map(({ styleId, ...rest }) => rest) // Exclude styleID
    );

    // Format the headers to uppercase
    worksheet["A1"].v = "ID";
    worksheet["B1"].v = "ACTIVITY NAME";
    worksheet["C1"].v = "START DATE";
    worksheet["D1"].v = "FINISH DATE";
    worksheet["E1"].v = "START CHAINAGE";
    worksheet["F1"].v = "FINISH CHAINAGE";
    worksheet["G1"].v = "STYLE";

    // Iterate through the data and trim field values
    for (let i = 2; i <= rawData.length + 1; i++) {
      worksheet["A" + i].v = (worksheet["A" + i].v || "").trim();
      worksheet["B" + i].v = (worksheet["B" + i].v || "").trim();

      worksheet["G" + i].v = (worksheet["G" + i].v || "").trim();
    }

    // Create a new workbook and add the worksheet to it
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Graph Data");

    // Export the workbook to an XLSX file

    // Export the workbook to an XLSX file
    XLSX.writeFile(workbook, "pcfallData.xlsx");
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col dark:bg-boxdark">
        <div className="flex gap-2">
          <button
            // disabled
            className="focus:outline-none mt-5  text-white bg-purple-500 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 flex items-center"
            onClick={() => saveAsPdfOrImage("pdf")}
          >
            <span className="mr-2">
              <LockClosedIcon className="w-4 h-4" /> {/* Lock icon */}
            </span>
            PDF
          </button>
          <button
            type="button"
            onClick={() => navigate("/create-project")} // Handle going back to the previous step
            className=" mt-5 bg-gray-400 text-white  hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-300 disabled:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 flex items-center"
          >
            {t("shapesForm.backButton")}
          </button>
          {/* <button
          className="focus:outline-none mt-5 text-white bg-purple-500 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
          onClick={() => saveAsPdfOrImage("image")}
        >
          Save as image
        </button> */}
        </div>
        {zoomLevel > 1 && (
          <button
            className="focus:outline-none mt-2 text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
            onClick={resetZoom}
          >
            {t("drawGraph.cancelZoomButtonLabel")}
          </button>
        )}
        <div className="flex flex-col " id="graph-container">
          <div className="graph-container">
            <div className="flex items-center border m-4">
              <img
                src={logo}
                className="h-20 w-40 mr-4"
                alt={graphSettings.projectSettings.title}
              />
              <div className="flex-grow text-center">
                <p className="text-2xl">
                  {graphSettings.projectSettings.title}
                </p>
              </div>
              <img
                src={graphSettings.projectSettings.logoImg}
                className="h-20 w-40 object-fill "
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

          <div className="my-4 flex justify-center gap-2 ">
            {/* Add the "Back" button */}
            {/* <button
          type="button"
          disabled={!selectedShapeData}
          className="px-10 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 focus:outline-none focus:ring focus:ring-red-300 disabled:bg-gray-600"
          onClick={handleEditClick}
        >
          {t("importFileForm.delete")}
        </button> */}
            <button
              type="button"
              disabled={!selectedShapeData}
              className="px-10 py-2 bg-green-400 text-white rounded-lg hover:bg-green-500 focus:outline-none focus:ring focus:ring-green-300 disabled:bg-gray-600"
              onClick={handleEditClick}
            >
              {t("importFileForm.edit")}
            </button>
            <button
              type="button"
              className="px-10 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-600"
              onClick={handleAddClick}
            >
              {t("importFileForm.add")}
            </button>
            <button
              type="button"
              className="px-10 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 disabled:bg-gray-600"
              onClick={handleDeleteClick}
              disabled={!selectedShapeData}
            >
              {t("importFileForm.delete")}
            </button>
            <button
              type="button"
              className="px-10 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring focus:ring-orbg-orange-300 disabled:bg-gray-600"
              onClick={handleExportAllClick}
            >
              {/* {"Export All Data"} */}
              {t("drawGraph.exportAllData")}
            </button>

            <button
              type="button"
              className="px-10 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring focus:ring-orbg-orange-300 disabled:bg-gray-600"
              onClick={handleExportGraphClick}
            >
              {/* {"Export Graph Data"} */}
              {t("drawGraph.exportGraphData")}
            </button>
            <button
              type="button"
              disabled={!selectedShapeData}
              className="px-10 py-2 bg-slate-600 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring focus:ring-orbg-orange-300 disabled:bg-gray-600"
              onClick={() => setStyleModalOpen(true)}
            >
              {t("drawGraph.changeStyle")}
            </button>
          </div>

          <div className="mb-10 mx-auto sm:w-[70%] lg:w-[50%]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="border border-gray-700 p-2 bg-slate-500">
                {t("drawGraph.activityDetails.activityNameLabel")}
              </div>
              <div className="border border-gray-700 p-2">
                {selectedShapeData?.activityName}
              </div>

              <div className="border border-gray-700 p-2 bg-slate-500">
                {t("drawGraph.activityDetails.styleLabel")}
              </div>
              <div className="border border-gray-700 p-2">
                {selectedShapeData?.style}
              </div>

              <div className="border border-gray-700 p-2 bg-slate-500">
                {t("drawGraph.activityDetails.startDateLabel")}
              </div>
              <div className="border border-gray-700 p-2">
                {moment(selectedShapeData?.startDate).format("DD/MM/YYYY")}
              </div>

              <div className="border border-gray-700 p-2 bg-slate-500">
                {t("drawGraph.activityDetails.finishDateLabel")}
              </div>
              <div className="border border-gray-700 p-2">
                {moment(selectedShapeData?.finishDate).format("DD/MM/YYYY")}
              </div>

              <div className="border border-gray-700 p-2 bg-slate-500">
                {t("drawGraph.activityDetails.startChainageLabel")}
              </div>
              <div className="border border-gray-700 p-2">
                {selectedShapeData?.startChainage}
              </div>

              <div className="border border-gray-700 p-2 bg-slate-500">
                {t("drawGraph.activityDetails.finishChainageLabel")}
              </div>
              <div className="border border-gray-700 p-2">
                {selectedShapeData?.finishChainage}
              </div>
            </div>
          </div>
          <div className="flex w-full justify-center items-center mb-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 w-full px-5">
              {createLegend()}
            </div>
          </div>
        </div>

        {isModalOpen && (
          <ActivityTableForm
            initialValues={selectedShapeData || undefined}
            onSubmit={closeModal}
            handleClose={closeModal}
            minDistance={parseFloat(fromDistance)}
            maxDistance={parseFloat(toDistance)}
          />
        )}
        {isStyleModalOpen && (
          <StyleForm
            id={selectedShapeData?.style}
            onSubmit={submitStyleModal}
            handleClose={closeStyleModal}
          />
        )}
      </div>
    </DefaultLayout>
  );
}

export default DrawGraphStep;
