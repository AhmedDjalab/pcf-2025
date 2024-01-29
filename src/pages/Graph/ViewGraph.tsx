//@ts-nocheck
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/state";
import {
  CommentsType,
  GraphDataType,
  ShapeType,
  TaskSlot,
  applyFilter,
  fetchCommentsThunk,
  removeActivity,
  saveCommentDataThunk,
  saveProjectThunk,
  updateComment,
  updateCommentsList,
  updateGraphSettingsValue,
} from "src/state/slices/graphSlice";
import texturesData from "src/const/texturesArray";
import { renderToStaticMarkup } from "react-dom/server";

import jsPDF from "jspdf";
import domtoimage from "dom-to-image";
import logo from "src/assets/Logo/logo.png";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import * as XLSX from "xlsx";

import { LineStyle, lineStyles } from "src/const/linesArray";
import {
  MarkerConfig,
  PatternConfig,
  markersConfig,
} from "src/const/markerAndPatternsConfig";
import { useTranslation } from "react-i18next";
import ActivityTableForm from "src/components/ActivityTableForm";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import DefaultLayout from "src/components/DefaultLayout";
import StyleForm from "src/components/ShapesPopup";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "src/context/UserContext";
import { siteName } from "src/variables/Urls";
import Spinner from "src/components/Spinner";
import { fetchProjectByIdThunk } from "src/state/slices/graphSlice";
import CommentsPannel from "src/components/CommentsPannel";
import Accordion from "src/components/shared/Accordian";
import { deleteComment, saveComment } from "src/Services/CommentService";
import Checkbox from "src/components/Checkbox";
import moment from "moment-timezone";
import { ActivityModel, ActivityStyleModel } from "src/types/Project";
import { saveActivityStyle } from "src/Services/ActivityStylesService";
import { getActivitiesByActivityId } from "src/Services/ActivityService";
import { useQuery } from "@tanstack/react-query";
export interface ActivityData {
  id: string;
  activityName: string;
  startDate: string;
  finishDate: string;
  startChainage: number;
  finishChainage: number;
  style: string; // Shape type (line, rectangle, circle, triangle, etc.)
}
function ViewGraph() {
  const userTimeZone = moment.tz.guess();
  const timeZoneString = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { id } = useParams();
  const { canWrite, isAdmin } = useAuth();
  const [showCritical, setShowCritical] = useState(false);
  const [scrollToActivityId, setScrollToActivityId] = useState(1);
  const tooltipContainerRef = useRef(null);
  const commentsData = useSelector((state: RootState) => state.graph.comments);

  // const [commentsData, setCommentsData] = useState(commentsData1);
  const dispatch: ThunkDispatch<RootState, any, AnyAction> = useDispatch();
  let graphSettings = useSelector((state: RootState) => state.graph);
  let graphData = useSelector(
    (state: RootState) => state.graph.rawGraphDataFromFile
  );
  let startDate = useSelector(
    (state: RootState) => state.graph.settings.fromDate
  );
  let endDate = useSelector((state: RootState) => state.graph.settings.toDate);
  let rawData = useSelector(
    (state: RootState) => state.graph.rawGraphDataFromFile
  );
  useEffect(() => {
    dispatch(fetchProjectByIdThunk(id));
    dispatch(fetchCommentsThunk(id));
  }, [dispatch, id]);
  const fromDistance = useSelector(
    (state: RootState) => state.graph.settings.fromDistance
  );
  const { user } = useAuth();
  const toDistance = useSelector(
    (state: RootState) => state.graph.settings.toDistance
  );
  const timeRange = useSelector(
    (state: RootState) => state.graph.settings.timeRange
  );
  const distanceRange = useSelector(
    (state: RootState) => state.graph.settings.distanceRange
  );

  const isDevelopment = process.env.REACT_APP_ENV === "development";

  const url = useMemo(
    () =>
      isDevelopment
        ? siteName + graphSettings.projectSettings.logoImg
        : graphSettings.projectSettings.logoImg,
    [graphSettings.projectSettings.logoImg]
  );
  const [graphSize, setGraphSize] = useState(graphData.length);
  const shapesData = useSelector((state: RootState) => state.graph.shapes);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomAttr, setZoomAttr] = useState({});
  const [selectedShapeType, setSelectedShapeType] = useState(null);
  const [selectedShapes, setSelectedShapes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStyleModalOpen, setStyleModalOpen] = useState(false);
  const [hideComments, setHideComments] = useState(false);
  const [commentsDetails, setCommentsDetails] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const textureDefsRef = useRef<SVGSVGElement | null>(null);
  const svgRefِContiner = useRef<SVGSVGElement | null>(null);
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
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [selectedActivityTooltip, setSelectedActivityTooltip] = useState(null);

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

  //? this is the tooltip query

  const { data: activitiesData, refetch: refetchActivities } = useQuery({
    queryKey: ["acitivtiesTooltio", selectedActivityTooltip?.id],
    queryFn: async () =>
      await getActivitiesByActivityId({
        projectId: id,
        activityId: selectedActivityTooltip.id,
      }),

    refetchOnWindowFocus: false,
    staleTime: 6000,
    enabled: false,
  });

  // useEffect(() => {
  //   if (selectedActivityTooltip) {
  //     refetchActivities();
  //   }
  // }, [selectedActivityTooltip, refetchActivities]);
  // useLayoutEffect(() => {
  //   const closeButton = document.getElementById("closeTooltipButton");
  //   if (closeButton === null) return;
  //   const closeTooltipOnClick = () => {
  //     console.log("it iscalling ");
  //     // Close the tooltip when the button is clicked
  //     const tooltip = d3.select("#tooltip");
  //     tooltip.style("display", "none");
  //   };

  //   // Attach the click event listener
  //   closeButton.addEventListener("click", closeTooltipOnClick);

  //   // Clean up the event listener when the component unmounts
  //   return () => {
  //     closeButton.removeEventListener("click", closeTooltipOnClick);
  //   };
  // }, []);
  window.closeTooltip = () => {
    const tooltip = d3.select("#tooltip");
    tooltip.style("display", "none");
  };
  window.handleTooltipClick = (event) => {
    const activityId = event.currentTarget.getAttribute("data-activity-id");
    const activity = graphData?.filter((x) => x.activityId === activityId)[0];
    if (activity) {
      setSelectedShapeData(activity as ActivityData);
    }
  };
  const generateTooltipContent = useCallback(
    (
      dataArray: ActivityModel[],
      tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, any>
    ) => {
      const closeButton = `
      <button style="background-color: transparent; position: absolute; top: 5px; right: 5px; cursor: pointer; z-index: 1;" onClick="closeTooltip()">X</button>
  `;
      const content = dataArray
        .map((data, index) => {
          const shape = shapesData.shapesData.find(
            (x) => x.name === data.style
          );
          const color = shape ? shape.color : "black"; // Default color if not found

          return `
            <div key="${index}"   onClick="handleTooltipClick(event)" data-activity-id="${
            data.activityId
          }" style="padding: 5px; ${
            index < dataArray.length - 1
              ? "border-bottom: 1px dotted #ccc;"
              : ""
          } background-color: ${color};">
              <strong>ID:</strong> ${data.activityId}<br>
              <strong>${t(
                "drawGraph.activityDetails.activityNameLabel"
              )}:</strong> ${data.name}<br>
              <strong>${t(
                "drawGraph.activityDetails.startDateLabel"
              )}:</strong> ${moment(data.startDate).format("DD/MM/YYYY")}<br>
              <strong>${t(
                "drawGraph.activityDetails.finishDateLabel"
              )}:</strong> ${moment(data.endDate).format("DD/MM/YYYY")}<br>
              <strong>${t("drawGraph.activityDetails.duration")}:</strong> ${
            data.duration
          }<br>
              <strong>${t("drawGraph.activityDetails.calendar")}:</strong> ${
            data.calendar
          }<br/>
              <strong>${t(
                "drawGraph.activityDetails.startChainageLabel"
              )}:</strong> ${data.startPk}<br>
              <strong>${t(
                "drawGraph.activityDetails.finishChainageLabel"
              )}:</strong> ${data.endPk}<br>
              <strong>${t("drawGraph.activityDetails.styleLabel")}:</strong> ${
            data.style
          }
            </div>
          `;
        })
        .join("");

      // Check if scrollToIndex is provided and the container ref is available
      // if (scrollToIndex !== null && tooltipContainerRef.current) {
      //   // Scroll to the desired index
      //   const scrollToElement =
      //     tooltipContainerRef.current.children[scrollToIndex];
      //   if (scrollToElement) {
      //     scrollToElement.scrollIntoView({
      //       behavior: "smooth",
      //       block: "start",
      //     });
      //   }
      // }

      return `
      <div  style="position: relative; max-height: 300px; overflow-y: auto; margin: 0; padding: 0;">
      ${closeButton}
      <div id="tooltipContainer"  style="overflow-y: auto; max-height: 300px; padding-right: 0px;"> <!-- Adjust padding-right to accommodate the close button width -->
          ${content}
      </div>
  </div>
     
        
        `;
    },
    [t, shapesData]
  );

  useEffect(() => {
    // Check if scrollToActivityId is provided and the container ref is available
    const tooltipContainer = document.getElementById("tooltipContainer");

    if (scrollToActivityId && tooltipContainer) {
      // Find the element with the matching data-activity-id attribute
      const scrollToElement = Array.from(tooltipContainer.children).find(
        (element) =>
          element.getAttribute("data-activity-id") === scrollToActivityId
      );

      if (scrollToElement) {
        // Scroll to the desired element
        scrollToElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [scrollToActivityId]);
  // const handleDateChange = (dates) => {
  //   const [start, end] = dates;
  //   setStartDate(start);
  //   setEndDate(end);
  // };
  const DrawXScale = (distanceAxisWidth: number) => {
    return d3
      .scaleLinear()
      .domain([fromDistance, toDistance])
      .range([10, distanceAxisWidth])
      .clamp(true);
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
      let yAxisRight = d3.axisRight(yScale);
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
        yAxisRight.tickValues(ticks);

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
        yAxisRight.tickValues(ticks);
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
        yAxisRight.tickValues(d3.timeWeek.every(1));
        // this is only for test
        // Calculate the total height required for the ticks
        var ticksHeight = ticksCount * tickSpacing;
        totalHeight =
          ticksHeight < rawcontainerHeight ? rawcontainerHeight : ticksHeight;
      } else if (timeRange.includes("Daily")) {
        const ticksCount = d3.timeDay.count(startDateObject, endDateObject);

        yAxis.ticks(d3.timeDay.every(1));
        yAxisRight.tickValues(d3.timeWeek.every(1));
        // Calculate the total height required for the ticks
        totalHeight = ticksCount * tickSpacing;
      }

      yScale.range([margin.top, totalHeight]);
      setContainerHeight(totalHeight + margin.top);
      const xAxisElement = g
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${totalHeight})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end") // Align text to the end of the label
        .attr("dy", "1em")
        .attr("transform", function () {
          return "translate(-12, 4)rotate(-80)";
        })
        .style("font-size", "12px");

      g.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(5,0)")
        .call(yAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-0.5em")
        .text((d) => d3.timeFormat("%a %d/%m/%Y")(d));

      // Set the margin for the right y-axis

      const containerWidth2 = containerWidth;

      // Calculate the position for the right y-axis
      const yAxisRightPosition =
        containerWidth2 - margin.left - margin.right - 90;

      // Append the right y-axis using the calculated position
      g.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${yAxisRightPosition}, 0)`)
        .call(yAxisRight)
        .selectAll("text")
        .style("text-anchor", "start")
        .attr("dx", "1em")
        .text((d) => d3.timeFormat("%a %d/%m/%Y")(d));
    },
    [
      containerWidth,
      distanceRange,
      endDate,
      endDateObject,
      fromDistance,
      margin.left,
      margin.right,
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
          let shape = shapesData.shapesData.find((x) => x.name === d.style)!;

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
        .merge(shapes)
        .attr("class", "activity-rectangle")
        .each(function (d: GraphDataType) {
          const defs = svg.select("defs");
          const shapeInCanvas = d3.select(this);
          let shape = shapesData.shapesData.find((x) => x.name === d.style)!;

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
                .attr("id", `${markerConfig.id}${shape.name}`)
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
                `url(#${lineStyleAttr.markerEndId}${shape.name})`
              )
              .attr(
                "marker-start",
                `url(#${lineStyleAttr.markerStartId}${shape.name})`
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
            //!error is here , don't froget writes soultion for this

            // x1 = Math.min(x1, x2);
            // y1 = Math.min(y1, y2);
            // x2 = Math.max(x1, x2);
            // y2 = Math.max(y1, y2);

            shapeInCanvas
              .attr("x", d.finishChainage < d.startChainage ? x2 : x1)
              .attr("y", y1)
              .attr("stroke", shapeStroke)

              .attr("width", Math.abs(x2 - x1))
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
            textureId = sanitizeClassName(shape.name + textureConfig.id);

            // svg.call(
            //   textureConfig?.configuration.id(shape.name).stroke(shapeStroke)
            // );
            shapeInCanvas.style(
              "fill",
              textureConfig?.configuration.id(textureId).url()
            );
          }
          shapeInCanvas.attr("id", `shape-${(d as GraphDataType).id}`);

          shapeInCanvas
            .on("mouseover", function (event: MouseEvent, d: GraphDataType) {
              // tooltip.style("display", "block");
              // tooltip.style("padding", "10px");
              // tooltip.style("z-index", "50");
              // tooltip.style("background-color", shape.color);
              // tooltip.style("left", event.pageX + "px");
              // tooltip.style("top", event.pageY + "px");
              // setSelectedActivityTooltip(d as ActivityData);
              // var uniqueShapes = [activitiesData.activities];
              // // Display shape data in the tooltip
              // tooltip.html(generateTooltipContent(activitiesData.activities));
              // event.stopPropagation();
              // var m = d3.pointer(event);
              // var txt = "X: " + d;
              // // Create a Set to store unique IDs of selected shapes
              // var uniqueShapes = [d];
              // // Iterate over all shapes to get their coordinates
              // shapes.enter().each(function (d1) {
              //   // Exclude the current shape
              //   if (d.activityId !== d1.activityId) {
              //     // Check distance
              //     var d1x = xScale(d1.startChainage);
              //     var d1x2 = xScale(d1.finishChainage);
              //     var dx = xScale(d.startChainage);
              //     var dx2 = xScale(d.finishChainage);
              //     // var d1y = yScale(new Date(d1.startDate));
              //     var xOverlap = d1x >= dx && d1x2 <= dx2;
              //     // Check if the activity is within the specified x-axis range and not already in uniqueShapes
              //     if (
              //       xOverlap &&
              //       !uniqueShapes.some((sh) => sh.activityId === d1.activityId)
              //     ) {
              //       uniqueShapes.push(d1);
              //     }
              //     // var distance = Math.sqrt(
              //     //   (d1x - m[0]) ** 2 + (d1y - m[1]) ** 2
              //     // );
              //     // var distance = Math.sqrt(Math.abs(d1y - m[1])) ** 2;
              //     // if (
              //     //   d1x >= dx &&
              //     //   d1x2 <= dx2 &&
              //     //   !uniqueShapes.some((sh) => sh.activityId === d1.activityId)
              //     // ) {
              //     //   uniqueShapes.push(d1);
              //     // }
              //     // if (
              //     //   distance <= 5 &&
              //     //   !uniqueShapes.some((sh) => sh.activityId === d1.activityId)
              //     // ) {
              //     //   // Add unique IDs to the set
              //     //   uniqueShapes.push(d1);
              //     // }
              //   }
              // });
              // // Display tooltip
              // tooltip.style("display", "block");
              // tooltip.style("padding", "10px");
              // tooltip.style("z-index", "50");
              // tooltip.style("left", event.pageX + "px");
              // tooltip.style("top", event.pageY + "px");
              // // Filter the shapes selection based on unique IDs
              // // var tooltipShapes = shapes.enter().filter(function (d) {
              // //   return uniqueShapes.some(
              // //     (shape) => shape.activityId === d.activityId
              // //   );
              // // });
              // console.error("this is data ", uniqueShapes);
              // // Display shape data in the tooltip
              // tooltip.html(generateTooltipContent(uniqueShapes));
            })

            .on("mouseout", function () {
              // Hide the tooltip on mouseout
              // setTimeout(function () {
              //   // Hide the tooltip after the delay
              //   tooltip.style("display", "none");
              // }, 30000);
            })

            .on("click", async function (event, d) {
              tooltip.style("display", "block");
              tooltip.style("padding", "0px");
              tooltip.style("z-index", "50");
              tooltip.style("background-color", shape.color);
              tooltip.style("left", event.pageX + "px");
              tooltip.style("top", event.pageY + "px");
              setSelectedShapeData(d as ActivityData);
              // setSelectedActivityTooltip(d as ActivityData);
              // Fetch activities data if not available
              try {
                const fetchedActivitiesData = await getActivitiesByActivityId({
                  projectId: id,
                  activityId: (d as ActivityData).id,
                });

                if (fetchedActivitiesData?.activities) {
                  tooltip.html(
                    generateTooltipContent(fetchedActivitiesData.activities, 3)
                  );
                  setScrollToActivityId((d as ActivityData).activityId);
                }
              } catch (error) {
                console.error("Error fetching activities:", error);
                // Handle error if needed
              }
            });
        });

      // // ?update selection
      // shapes
      //   .attr("class", "activity-rectangle")
      //   .each(function (d: GraphDataType) {
      //     const defs = svg.select("defs");
      //     const shapeInCanvas = d3.select(this);
      //     let shape = shapesData.shapesData.find((x) => x.name === d.style)!;

      //     if (!shape) {
      //       return;
      //     }
      //     // Define boundaries
      //     const minStartDate = startDateObject;

      //     const maxEndDate = endDateObject;

      //     const minStartChainage = fromDistance;
      //     const maxFinishChainage = toDistance;

      //     // Calculate the adjusted coordinates
      //     let x1 = xScale(d.startChainage);
      //     let x2 = xScale(d.finishChainage);
      //     let y1 = yScale(new Date(d.startDate));
      //     let y2 = yScale(new Date(d.finishDate));

      //     // Adjust the coordinates to stay within the boundaries
      //     x1 = Math.max(x1, xScale(minStartChainage));
      //     x2 = Math.min(x2, xScale(maxFinishChainage));
      //     y1 = Math.max(y1, yScale(minStartDate));
      //     y2 = Math.min(y2, yScale(maxEndDate));
      //     const textureConfig = texturesData.find(
      //       (x) => x.id === shape.backgroundTexture
      //     );
      //     let shapeStroke = shape.color;
      //     if (shape.type === "line") {
      //       let lineStyleAttr: LineStyle;
      //       if (shape.lineType !== "") {
      //         lineStyleAttr =
      //           lineStyles.find((x) => x.id === shape.lineType) || {};
      //       }

      //       if (lineStyleAttr.markerStartName) {
      //         // addding markers to the defs
      //         const markerConfig: MarkerConfig =
      //           markersConfig[lineStyleAttr.markerStartName];
      //         const endArrowMarker = defs
      //           .append("marker")
      //           .attr("id", `${markerConfig.id}${textureConfig.id}`)
      //           .attr("viewBox", markerConfig.config.viewBox)
      //           .attr("markerWidth", markerConfig.config.markerWidth)
      //           .attr("markerHeight", markerConfig.config.markerHeight)
      //           .attr("refX", markerConfig.config.refX)
      //           .attr("refY", markerConfig.config.refY)
      //           .attr("orient", markerConfig.config.orient);

      //         endArrowMarker
      //           .append("path")
      //           .attr("d", markerConfig.config.d)
      //           .attr("fill", shapeStroke);
      //       }
      //       if (lineStyleAttr.markerEndName) {
      //         // addding markers to the defs
      //         const markerConfig: MarkerConfig =
      //           markersConfig[lineStyleAttr.markerEndName];
      //         const endArrowMarker = defs
      //           .append("marker")
      //           .attr("id", `${markerConfig.id}${shape.name}`)
      //           .attr("viewBox", markerConfig.config.viewBox)
      //           .attr("markerWidth", markerConfig.config.markerWidth)
      //           .attr("markerHeight", markerConfig.config.markerHeight)
      //           .attr("refX", markerConfig.config.refX)
      //           .attr("refY", markerConfig.config.refY)
      //           .attr("orient", markerConfig.config.orient)
      //           .attr("stroke", "context-stroke")
      //           .attr("fill", "context-fill");

      //         endArrowMarker
      //           .append("path")
      //           .attr("d", markerConfig.config.d)
      //           .attr("fill", shapeStroke);
      //       }

      //       shapeInCanvas
      //         .attr("x1", x1)
      //         .attr("x2", x2)
      //         .attr("y1", y1)
      //         .attr("y2", y2)

      //         .attr(
      //           "marker-end",
      //           `url(#${lineStyleAttr.markerEndId}${shape.name})`
      //         )
      //         .attr(
      //           "marker-start",
      //           `url(#${lineStyleAttr.markerStartId}${shape.name})`
      //         )
      //         .attr("stroke", shapeStroke)
      //         .attr("stroke-width", () =>
      //           lineStyleAttr.style ? lineStyleAttr.style["stroke-width"] : 2
      //         )
      //         .attr(
      //           "stroke-dasharray",
      //           lineStyleAttr.style
      //             ? lineStyleAttr.style["stroke-dasharray"]
      //             : ""
      //         );
      //     } else if (shape.type === "rect") {
      //       x1 = Math.min(x1, x2);
      //       y1 = Math.min(y1, y2);
      //       x2 = Math.max(x1, x2);
      //       y2 = Math.max(y1, y2);
      //       shapeInCanvas
      //         .attr("x", x1)
      //         .attr("y", y1)
      //         .attr("stroke", shapeStroke)

      //         .attr("width", x2 - x1)
      //         .attr("height", y2 - y1);
      //     } else if (shape.type === "triangle") {
      //       // Define the points for the triangle (adjust as needed)
      //       const trianglePoints = `${x1},${y1} ${x2},${y2} ${x1},${y2}`;

      //       shapeInCanvas
      //         .attr("points", trianglePoints)
      //         .attr("stroke", shapeStroke);
      //     } else {
      //       shapeInCanvas
      //         .attr("cx", (x1 + x2) / 2)
      //         .attr("cy", (y1 + y2) / 2)
      //         .attr("r", 5);
      //     }
      //     let textureId = "";
      //     if (textureConfig) {
      //       textureId = sanitizeClassName(shape.name + textureConfig.id);

      //       // svg.call(
      //       //   textureConfig?.configuration.id(shape.name).stroke(shapeStroke)
      //       // );
      //       shapeInCanvas.style(
      //         "fill",
      //         textureConfig?.configuration.id(textureId).url()
      //       );
      //     }
      //     shapeInCanvas.attr("id", `shape-${(d as GraphDataType).id}`);

      //     shapeInCanvas
      //       .on("mouseover", function (event: MouseEvent, d: unknown) {
      //         // Show the tooltip and position it
      //         tooltip.style("display", "block");
      //         tooltip.style("padding", "10px");
      //         tooltip.style("background-color", shape.color);
      //         tooltip.style("left", event.pageX + "px");
      //         tooltip.style("top", event.pageY + "px");

      //         // Display shape data in the tooltip
      //         tooltip.html(generateTooltipContent(d as GraphDataType));
      //       })
      //       .on("mouseout", function () {
      //         // Hide the tooltip on mouseout
      //         tooltip.style("display", "none");
      //       })

      //       .on("click", function (event, d) {
      //         setSelectedShapeData(d as ActivityData);
      //       });
      //   });

      shapes.exit().remove();
    },
    [
      endDateObject,
      fromDistance,
      generateTooltipContent,
      graphData,
      id,
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
    const svg = d3.select("legend-item");
    const svgTexture = d3.select(textureDefsRef.current!);
    svgTexture.selectAll("*").remove();

    shapesData.shapesData.forEach((shape) => {
      let selectedTexture = texturesData.find(
        (x) => x.id === shape.backgroundTexture
      );

      if (selectedTexture) {
        const optionTexture = selectedTexture.configuration
          .id(sanitizeClassName(shape.name + selectedTexture.id))
          .stroke(shape.color);
        svgTexture.call(optionTexture);
      }
    });
  }, [shapesData.shapesData]);

  const drawComment = useCallback(
    (
      g: d3.Selection<SVGGElement, unknown, null, undefined>,
      xScale: d3.ScaleLinear<number, number, never>,
      yScale: d3.ScaleLinear<number, number, never>
    ) => {
      let updatedCommentValue: CommentsType;
      let isDragging = false;

      const drag = d3
        .drag<SVGGElement, CommentsType>()
        .on("start", function (event, d) {
          d3.select(this).raise().classed("active", true);
          isDragging = false;
        })
        .on("drag", function (event, d) {
          isDragging = true;
          const newX = Math.round(xScale.invert(event.x));
          const newY = Math.round(yScale.invert(event.y));

          updatedCommentValue = {
            ...d,
            pk: newX,
            start: newY,
          };

          const index = commentsData.findIndex(
            (comment) => comment.id === d.id
          );

          dispatch(
            updateComment({
              comment: updatedCommentValue,
              index: index,
            })
          );

          d3.select(this).attr(
            "transform",
            `translate(${xScale(newX)}, ${yScale(newY)})`
          );
        })
        .on("end", function (event, d) {
          d3.select(this).classed("active", false);
          if (isDragging) {
            saveComment({
              ...updatedCommentValue,
              start: new Date(updatedCommentValue.start),
            });
          }
        });

      const startSlot = g
        .selectAll<SVGGElement, CommentData>(".comment-group")
        .data(commentsData);

      const newComments = startSlot
        .enter()
        .append("g")
        .attr("class", "comment-group")
        .attr(
          "transform",
          (d) => `translate(${xScale(d.pk)}, ${yScale(new Date(d.start))})`
        )
        .style("cursor", "pointer")
        .on("mouseover", function () {
          d3.select(this)
            .select(".delete-button")
            .style("visibility", "visible");
          d3.select(this).select(".rect-info").style("visibility", "visible");
          d3.select(this)
            .select(".rect-info-email")
            .style("visibility", "visible");
          d3.select(this)
            .select(".rect-info-date")
            .style("visibility", "visible");
          d3.select(this).select(".rect-info-email").style("display", "block");
          d3.select(this).select(".rect-info-date").style("display", "block");
        })
        .on("mouseout", function () {
          d3.select(this)
            .select(".delete-button")
            .style("visibility", "hidden");
          d3.select(this).select(".rect-info").style("visibility", "hidden");
          d3.select(this)
            .select(".rect-info-email")
            .style("visibility", "visible");
          d3.select(this)
            .select(".rect-info-date")
            .style("visibility", "visible");
          d3.select(this).select(".rect-info-email").style("display", "none");
          d3.select(this).select(".rect-info-date").style("display", "none");
        })
        .call(drag);

      newComments
        .append("text")
        .attr("class", "comment-text")
        .attr("dy", 10)
        .style("font-size", "14px")

        .text((d) => d.commentText);

      newComments
        .append("text")
        .attr("class", "delete-button")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", -5)
        .style("font-size", "12px")
        .style("fill", "red")
        .style("visibility", "hidden")

        .text("X")
        .on("click", function (event, d) {
          // Your code to remove the comment (d) goes here
          if (!isDragging) {
            deleteComment(d.id).then((re) => {
              if (re.status === 200) {
                dispatch(fetchProjectByIdThunk(id));
                dispatch(fetchCommentsThunk(id));
              }
            });
          }
        });
      // Add a rect element for the email and creation date
      newComments
        .append("rect")
        .style("visibility", "hidden")
        .attr("class", "rect-info")
        .attr("x", 15) // Adjust the distance from the "X" icon
        .attr("y", 25) // Adjust the vertical position
        .attr("width", 250) // Adjust the width of the rectangle
        .attr("height", 40)
        .attr("rx", 10) // Adjust the horizontal radius for rounded corners
        .attr("ry", 10)

        // Adjust the height of the rectangle
        .style("fill", "#FF6F91"); // You can change the background color

      // Add text for email
      newComments
        .append("text")
        .attr("class", "rect-info-email")
        .attr("x", 20) // Adjust the distance from the "X" icon
        .attr("y", 5)
        .attr("dy", 35)
        .style("visibility", "hidden")
        .style("display", "none")
        .style("fill", "#ffffff")
        .style("font-size", "12px") // Adjust the font size
        .text(function (d) {
          return "Email: " + d.commentorUserEmail; // Assuming that the comment data has a property called 'email'
        });

      // Add text for creation date
      newComments
        .append("text")
        .attr("class", "rect-info-date")
        .style("visibility", "hidden")
        .style("display", "none")
        .attr("x", 20) // Adjust the distance from the "X" icon
        .attr("y", 65) // Adjust the vertical position
        .attr("dy", -5)
        .style("fill", "#ffffff")
        .style("font-size", "12px") // Adjust the font size
        .text(function (d) {
          var formated = moment(d.createdDate)
            .tz(userTimeZone)
            .format("YYYY-MM-DD HH:mm");
          return "Date: " + formated; // Assuming that the comment data has a property called 'creationDate'
        });
      startSlot
        .merge(newComments)
        .attr(
          "transform",
          (d) => `translate(${xScale(d.pk)}, ${yScale(new Date(d.start))})`
        )
        .select(".comment-text")
        .text((d) => d.commentText)
        .on("click", function (event, d) {
          // Your click event code
          setSelectedCommentId(d);
          setIsAddingComments(true);
        });

      startSlot.exit().remove();
    },
    [commentsData, dispatch, id, userTimeZone]
  );

  useEffect(() => {
    if (hideComments) {
      d3.selectAll(".comment-text").attr("visibility", "hidden");
    } else {
      d3.selectAll(".comment-text").attr("visibility", "visible");
    }
  }, [hideComments]);

  useEffect(() => {
    //commentText.style("visibility", commentsDetails ? "visible" : "hidden");

    if (commentsDetails) {
      // Your logic to show details
      d3.selectAll(".delete-button").style("visibility", "visible");
      d3.selectAll(".rect-info").style("visibility", "visible");
      d3.selectAll(".rect-info-email").style("visibility", "visible");
      d3.selectAll(".rect-info-date").style("visibility", "visible");
      d3.selectAll(".rect-info-email").style("display", "block");
      d3.selectAll(".rect-info-date").style("display", "block");
    } else {
      d3.selectAll(".delete-button").style("visibility", "hidden");
      d3.selectAll(".rect-info").style("visibility", "hidden");
      d3.selectAll(".rect-info-email").style("visibility", "hidden");
      d3.selectAll(".rect-info-date").style("visibility", "hidden");
      d3.selectAll(".rect-info-email").style("display", "block");
      d3.selectAll(".rect-info-date").style("display", "block");
    }
  }, [commentsDetails]);
  const drawD3Chart = useCallback(() => {
    // Set the height attribute of the parent SVG to fit its children

    const svg = d3.select(svgRef.current!);
    const containerSVG = d3.select(containerSVGRef.current!);

    svg.selectAll("*").remove();

    const tooltip = d3.select("#tooltip");

    // const distanceAxisWidth =
    //   50 * ((toDistance - fromDistance) / distanceRange) < window.innerWidth
    //     ? window.innerWidth
    //     : 50 * ((toDistance - fromDistance) / distanceRange);

    const distanceAxisWidth = containerWidth - margin.right - margin.left - 100;
    // setContainerWidth(distanceAxisWidth);
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

    drawComment(g, xScale, yScale);
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
        const scale = event.deltaY > 0 ? 1.2 : 1;

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
    containerWidth,
    margin.right,
    margin.left,
    margin.top,
    DrawXScale,
    startDateObject,
    endDateObject,
    drawAxises,
    drawShapes,
    drawTaskSlot,
    graphSettings.taskSlotsLevelTwo,
    graphSettings.taskSlots,
    drawComment,
    zoom,
    containerHeight,
  ]);

  useEffect(() => {
    drawD3Chart();
    // Gray border
  }, [graphData, shapesData]);

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
  }, [callTextureData, shapesData.shapesData, textureDefsRef]);

  const resetZoom = useCallback(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const g = svg.select("g");

      // g.transition()
      //   .duration(750)
      //   .call(
      //     zoom.transform,
      //     d3.zoomIdentity,
      //     d3.zoomTransform(svg.node()).invert([containerWidth, containerHeight])
      //   );
      // console.log("svgRef.current:", svgRef.current);
      // console.log("g:", g);

      // if (svgRef.current && g) {
      //   console.log("ths is working ", zoom);
      //   setZoomLevel(1);
      //   g.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      // }
      if (selectedShapes.length > 0) {
        setSelectedShapes([]);
      }
      drawD3Chart();
    }
  }, [drawD3Chart, selectedShapes.length]);

  useEffect(() => {
    // Check if any shape name is clicked
    const isShapeNameClicked = selectedShapes.length > 0;

    d3.selectAll(".activity-rectangle")
      .style("z-index", (d: GraphDataType) => {
        // If a shape name is clicked, enable pointer events only for selected shapes
        // Otherwise, enable pointer events for all shapes
        return isShapeNameClicked && !selectedShapes.includes(d.style)
          ? "z-0"
          : "z-1000";
      })
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

      const textureId = sanitizeClassName(shape.name + textureConfig.id);

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
              <svg width="40" height="20">
                <line
                  x1="10"
                  y1="10"
                  x2="30"
                  y2="10"
                  stroke={shape.color}
                  markerEnd={`url(#${lineStyleAttr.markerEndId}${shape.name})`}
                  markerStart={`url(#${lineStyleAttr.markerStartId}${shape.name})`}
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
                <defs ref={textureDefsRef}></defs>
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
              <svg width="40" height="20">
                <defs ref={textureDefsRef}></defs>
                <polygon
                  points="10,18 40,2 40,18"
                  fill={textureConfig?.configuration.id(textureId).url()}
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
  const saveAsPdfOrImage = (format: "pdf" | "image") => {
    const svgContainer = document.getElementById("graph-container");

    const dpi = window.devicePixelRatio || 1;
    const pageWidthPx = Math.floor((A4_WIDTH_MM * dpi) / 25.4);
    const pageHeightPx = Math.floor((A4_HEIGHT_MM * dpi) / 25.4);

    if (format === "pdf") {
      const pdf = new jsPDF("portrait", "mm", [A4_WIDTH_MM, A4_HEIGHT_MM]);

      // Clone the SVG container to avoid modifying the original
      const clonedSvg = svgContainer.cloneNode(true);

      // Fetch external stylesheets and inject them into the SVG
      const styleSheets = Array.from(document.styleSheets);

      const fetchStyles = async (url: string) => {
        try {
          const response = await fetch(url);
          const cssText = await response.text();

          const styleElement = document.createElement("style");
          styleElement.textContent = cssText;
          clonedSvg.appendChild(styleElement);
        } catch (error) {
          console.error("Error fetching stylesheet:", error);
        }
      };

      styleSheets.forEach((styleSheet) => {
        if (styleSheet.href) {
          fetchStyles(styleSheet.href);
        }
      });

      // Convert the SVG to XML string
      const svgXml = new XMLSerializer().serializeToString(clonedSvg);

      // Embed the SVG XML into the PDF
      pdf.text(svgXml, 10, 10);

      // Save the PDF
      pdf.save("graph.pdf");
    }
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
  const submitStyleModal = (style: ShapeType) => {
    setStyleModalOpen(false);
    setSelectedShapeData(null);
    const activityStyle: ActivityStyleModel = {
      id: style.id,
      backgroundTextureType: style.backgroundTexture,
      color: style.color,
      shapeType: style.type,
      lineStyleType: style.lineType,
      name: style.name,
    };
    const data = saveActivityStyle(activityStyle);

    // navigate("/refresh");
    // navigate(-1);
  };

  const closeStyleModal = () => {
    setStyleModalOpen(false);
    setSelectedShapeData(null);
  };

  const closeCommentsModal = () => {
    setIsAddingComments(false);
    dispatch(fetchProjectByIdThunk(id));
    dispatch(fetchCommentsThunk(id));
    setSelectedShapeData(null);
    navigate("/refresh");
    navigate(-1);
  };

  const submitCommentModal = () => {
    setIsAddingComments(false);
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
      rawData.map(({ styleId, id, ...rest }) => rest) // Exclude styleID
    );

    // Define the column headers dynamically based on object keys
    const headers = Object.keys(
      rawData.map(({ styleId, id, ...rest }) => rest)[0]
    );

    // Set column headers
    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
      const headerCell = worksheet[cellAddress] || {};
      headerCell.v = header.toUpperCase();
      worksheet[cellAddress] = headerCell;
    });

    // Iterate through the data and trim field values
    for (let i = 2; i <= rawData.length + 1; i++) {
      const row = i - 1;

      // Iterate through the columns dynamically
      headers.forEach((col, index) => {
        const cellAddress = `${XLSX.utils.encode_col(index)}${i}`;
        const cell = worksheet[cellAddress] || {};

        // cell.v = (cell.v || "").trim();

        // Trim values for all columns

        // Format date values if applicable
        if (rawData[row - 1][col] instanceof Date) {
          cell.t = "d";
          cell.z = "yyyy-mm-dd";
        }

        worksheet[cellAddress] = cell;
      });
    }

    // Create a new workbook and add the worksheet to it
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Graph Data");

    // Export the workbook to an XLSX file
    XLSX.writeFile(workbook, "pcfallData.xlsx");
  };
  // const handleSaveProject = () => {
  //   dispatch(saveProjectThunk(user!));
  // };

  //? this is the write text inside the chart logic
  const [isAddingComments, setIsAddingComments] = useState(false);

  const handleAddComments = () => {
    setIsAddingComments(true);
  };

  //?----------------------------------------------

  useEffect(() => {
    const filteredActivity = graphData
      ?.filter((x) => x.critical)
      .map((e) => e.activityId);
    d3.selectAll(".activity-rectangle")
      .transition()
      .duration(200)
      .attr("opacity", (d: GraphDataType) => {
        if (showCritical) {
          // If a shape name is clicked, set opacity to 0.2 for all shapes except the selected one
          return filteredActivity.includes(d.activityId) ? 1 : 0.2;
        } else {
          // If no shape name is clicked, set opacity to 1 for all shapes
          return 1;
        }
      });

    // Check if any shape name is clicked
  }, [graphData, showCritical]);

  return (
    <DefaultLayout>
      {graphSettings.loading ? (
        <Spinner />
      ) : (
        <div className="flex flex-col bg-white dark:bg-body w-full overflow-x-auto">
          <div className="mx-20">
            <div className="flex  gap-4">
              <div className=" mt-2 flex items-center">
                <Checkbox
                  checked={hideComments}
                  onChange={() => setHideComments(!hideComments)}
                  label={t("Comments.hideComments")}
                />
              </div>
              <div className=" mt-2 flex items-center">
                <Checkbox
                  checked={commentsDetails}
                  onChange={() => setCommentsDetails(!commentsDetails)}
                  label={t("Comments.showCommentsDetails")}
                />
              </div>
              <div className=" mt-2 flex items-center">
                <Checkbox
                  checked={showCritical}
                  onChange={() => setShowCritical(!showCritical)}
                  label={t("drawGraph.showCritical")}
                />
              </div>
            </div>
            <Accordion
              title={t("drawGraph.utilButtons")}
              isOpenTrigger={selectedShapeData}
            >
              <div className="my-4 flex justify-center gap-2 ">
                {/* <button
                  // disabled
                  className="focus:outline-none mt-5  text-white bg-purple-500 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 flex items-center"
                  onClick={() => saveAsPdfOrImage("pdf")}
                >
                  <span className="mr-2">
                    <LockClosedIcon className="w-4 h-4" /> 
                  </span>
                  PDF
                </button> */}
                {/* <button
          type="button"
          onClick={() => navigate("/create-project/5")} // Handle going back to the previous step
          className=" mt-5 bg-gray-400 text-white  hover:bg-gray-500 focus:outline-none focus:ring focus:ring-gray-300 disabled:bg-gray-600 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 flex items-center"
        >
          {t("shapesForm.backButton")}
        </button> */}
                <button
                  type="button"
                  onClick={handleAddComments}
                  disabled={!selectedShapeData}
                  className="px-10 py-2 bg-green-400 text-white rounded-lg hover:bg-green-500 focus:outline-none focus:ring focus:ring-green-300 disabled:bg-gray-600"
                >
                  {t("drawGraph.addComments")}
                </button>

                {/* <button
        className="focus:outline-none mt-5 text-white bg-purple-500 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
        onClick={() => saveAsPdfOrImage("image")}
      >
        Save as image
      </button> */}

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
                  disabled={!selectedShapeData || (!canWrite && !isAdmin)}
                  className="px-10 py-2 bg-green-400 text-white rounded-lg hover:bg-green-500 focus:outline-none focus:ring focus:ring-green-300 disabled:bg-gray-600"
                  onClick={handleEditClick}
                >
                  {t("importFileForm.edit")}
                </button>
                <button
                  type="button"
                  className="px-10 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-600"
                  onClick={handleAddClick}
                  disabled={!canWrite && !isAdmin}
                >
                  {t("importFileForm.add")}
                </button>
                <button
                  type="button"
                  className="px-10 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 disabled:bg-gray-600"
                  onClick={handleDeleteClick}
                  disabled={!selectedShapeData || (!canWrite && !isAdmin)}
                >
                  {t("importFileForm.delete")}
                </button>
                <button
                  type="button"
                  className="px-10 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring focus:ring-orange-300 disabled:bg-gray-600"
                  onClick={handleExportAllClick}
                  disabled={!canWrite && !isAdmin}
                >
                  {/* {"Export All Data"} */}
                  {t("drawGraph.exportAllData")}
                </button>
                {/* <button
                  type="button"
                  className="px-10 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 disabled:bg-gray-600"
                  onClick={(e: any) => saveAsPdfOrImage("pdf")}
                  disabled={!canWrite && !isAdmin}
                >
                  {/* {"Export All Data"} */}
                {/* PDF
                </button>  */}

                <button
                  type="button"
                  disabled={!selectedShapeData || (!canWrite && !isAdmin)}
                  className="px-10 py-2 bg-green-400 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring focus:ring-orbg-orange-300 disabled:bg-gray-600 focus:ring-green-300"
                  onClick={() => setStyleModalOpen(true)}
                >
                  {t("drawGraph.changeStyle")}
                </button>
              </div>
            </Accordion>
          </div>
          {zoomLevel > 1 && (
            <button
              className="focus:outline-none mt-2 text-white bg-blue-500 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
              onClick={resetZoom}
            >
              {t("drawGraph.cancelZoomButtonLabel")}
            </button>
          )}
          <div className="flex flex-col w-full  " id="graph-container">
            <div className="graph-container">
              <div className="flex items-center border m-4 w-full ">
                <img
                  src={graphSettings.projectSettings.clientlogoImg ?? logo}
                  className="h-20 w-40 mr-4"
                  alt={"Client" + graphSettings.projectSettings.title}
                />
                <div className="flex-grow text-center">
                  <p className="text-2xl">
                    {graphSettings.projectSettings.title}
                  </p>
                  <p className="text-lg">
                    DataDate:
                    <span className="text-orange-600">
                      {` ${moment(
                        graphSettings.projectSettings.dataDate
                      ).format("DD/MM/YYYY HH:mm")}`}
                    </span>
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
            <Accordion title={t("drawGraph.activityDetailLabel")}>
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

                  <div className="border border-gray-700 p-2 bg-slate-500">
                    {t("drawGraph.activityDetails.calendar")}
                  </div>
                  <div className="border border-gray-700 p-2">
                    {selectedShapeData?.calendarName}
                  </div>

                  <div className="border border-gray-700 p-2 bg-slate-500">
                    {t("drawGraph.activityDetails.duration")}
                  </div>
                  <div className="border border-gray-700 p-2">
                    {selectedShapeData?.duration}
                  </div>
                </div>
              </div>
            </Accordion>
            <div className="flex w-full justify-center items-center my-4">
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
          {isAddingComments && (
            <CommentsPannel
              editComment={selectedCommentId}
              onSubmit={closeCommentsModal}
              handleClose={submitCommentModal}
              yPosition={selectedShapeData?.startDate}
            />
          )}
        </div>
      )}
    </DefaultLayout>
  );
}

export default ViewGraph;
