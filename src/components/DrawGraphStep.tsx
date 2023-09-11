//@ts-noCheck

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useSelector } from "react-redux";
import { RootState } from "../state";
import { GraphDataType } from "../state/slices/graphSlice";
import texturesData from "../const/texturesArray";
import textures from "textures";
import moment from "moment";

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

  useEffect(() => {
    const table = d3.select(tableRef.current!);
    const svg = d3.select(svgRef.current!);
    const tooltip = d3.select("#tooltip");

    const margin = { top: 40, right: 30, bottom: 50, left: 150 };
    const width = 1000 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;
    // Create a table to display data

    // Create arrows pointing to the corresponding shapes in the graph

    // const currentDate = new Date();
    // const twoYearsLater = new Date(currentDate);
    // twoYearsLater.setFullYear(currentDate.getFullYear() + 2);
    const xScale = d3
      .scaleLinear()
      .domain([fromDistance, toDistance])
      .range([margin.left, width]);

    const yScale = d3
      .scaleTime()
      .domain([startDate, endDate])
      .range([margin.top, height]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const monthGuidelines = d3.timeMonths(startDate, endDate);

    // ?? months
    g.selectAll(".month-guideline")
      .data(monthGuidelines)
      .enter()
      .append("line")
      .attr("class", "month-guideline")
      .attr("x1", (d) => xScale(fromDistance))
      .attr("x2", (d) => xScale(toDistance))
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "2,2");

    //?? x axis
    const xAxis = d3.axisBottom(xScale);
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "middle")
      .attr("dy", "1em");
    var t1 = textures.lines().thicker();

    const yAxis = d3.axisLeft(yScale).ticks(d3.timeMonth.every(1));
    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-0.5em")
      .text((d) => d3.timeFormat("%a %m/%d/%Y")(d));

    g.selectAll(".activity-rectangle")
      .data(graphSettings.settings.graphData)
      .enter()
      .append((d) => {
        let shape = shapesData.shapesData.find((x) => x.activityId == d.id)!;
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
        const shapeInCanvas = d3.select(this);
        let shape = shapesData.shapesData.find((x) => x.activityId == d.id)!;
        const textureConfig = texturesData.find(
          (x) => x.id == shape.backgroundTexture
        );
        console.log(
          "🚀 ~ file: DrawGraphStep.tsx:120 ~ textureConfig:",
          textureConfig,
          shape
        );

        if (shape.type === "line") {
          shapeInCanvas
            .attr("x1", (d) => xScale(d.startChainage))
            .attr("x2", (d) => xScale(d.finishChainage))
            .attr("y1", (d) => yScale(new Date(d.startDate)))
            .attr("y2", (d) => yScale(new Date(d.finishDate)));
        } else if (shape.type === "rect") {
          shapeInCanvas
            .attr("x", (d) => xScale(d.startChainage))
            .attr("y", (d) => yScale(new Date(d.startDate)))
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

          shapeInCanvas.attr("points", trianglePoints);
        } else {
          shapeInCanvas
            .attr("cx", (d) => xScale(d.startChainage))
            .attr("cy", (d) => yScale(new Date(d.startDate)))
            .attr("r", 5);
        }
        console.log(
          "shapes colors ",
          shape.color,
          textureConfig?.configuration.url()
        );

        shapeInCanvas.style("stroke", shape.color);
        // .style("fill", textureConfig?.configuration.url());
        if (textureConfig) {
          svg.call(textureConfig?.configuration.stroke(shape.color));
          shapeInCanvas.style("fill", textureConfig?.configuration.url());
        } else {
          shapeInCanvas.style("fill", shape.color);
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
          });
      });

    // graphSettings.settings.graphData.forEach((d) => {
    //   const shape = svg.select(`#shape-${d.id}`); // Select the shape by ID
    //   const row = table.select(`#${d.id}`); // Select the table row by ID
    //   if (shape.size() === 0 || row.size() === 0) {
    //     console.error(`Shape or row not found for ID: ${d.id}`);
    //     return;
    //   }
    //   // Get the middle coordinates of the table row
    //   const rowOffset = row.node().getBoundingClientRect();
    //   const rowX = rowOffset.left + rowOffset.width / 2 + window.scrollX;
    //   const rowY = rowOffset.top + rowOffset.height / 2 + window.scrollY;

    //   // Get the middle coordinates of the shape
    //   const shapeOffset = shape.node().getBoundingClientRect();
    //   const shapeX = shapeOffset.left + shapeOffset.width / 2 + window.scrollX;
    //   const shapeY = shapeOffset.top + shapeOffset.height / 2 + window.scrollY;
    //   console.log(
    //     "🚀 ~ file: TimeChart.tsx:154 ~ data.forEach ~ shapeX:",
    //     shapeX,
    //     shapeY,
    //     rowX,
    //     rowY
    //   );

    //   svg
    //     .append("line")
    //     .attr("x1", rowX)
    //     .attr("y1", rowY)
    //     .attr("x2", shapeX)
    //     .attr("y2", shapeY)
    //     .attr("stroke", "blue") // Set the line color to blue
    //     .attr("stroke-dasharray", "5,5") // Set the line to a dashed pattern (adjust the values for the pattern)
    //     .attr("marker-end", "url(#arrow-marker)");
    // });
  }, [
    endDate,
    fromDistance,
    graphSettings,
    shapesData.shapesData,
    startDate,
    toDistance,
  ]);

  return (
    <div className="flex flex-col">
      <div></div>
      <div className="flex">
        <div className="graph-container">
          <div id="tooltip" className="absolute  text-white"></div>
          <svg width={1000} height={800}>
            <g ref={svgRef}></g>
          </svg>
        </div>
        {/* <div className="table-container mt-40" ref={tableRef}>
          <table className="border-collapse w-full">
            <thead className="bg-gray-300">
              <tr>
                <th className="px-4 py-2">Activity Name</th>
                <th className="px-4 py-2">Start Date</th>
                <th className="px-4 py-2">Finish Date</th>
                <th className="px-4 py-2">Start Chainage</th>
                <th className="px-4 py-2">Finish Chainage</th>
              </tr>
            </thead>
            <tbody> */}
        {/* {graphSettings.settings.graphData.map((d) => (
                <tr key={d.id} className="border-t" id={d.id}>
                  <td className="px-4 py-2">{d.activityName}</td>
                  <td className="px-4 py-2">{d.startDate}</td>
                  <td className="px-4 py-2">{d.finishDate}</td>
                  <td className="px-4 py-2">{d.startChainage}</td>
                  <td className="px-4 py-2">{d.finishChainage}</td>
                </tr>
              ))} */}
        {/* </tbody>
          </table>
        </div> */}
      </div>
    </div>
  );
}

export default DrawGraphStep;
