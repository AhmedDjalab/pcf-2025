//@ts-nocheck

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
  const margin = { top: 40, right: 20, bottom: 100, left: 100 };
  const containerWidth = 1800;
  const containerHeight = 1000;
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;
  useEffect(() => {
    const legendContainer = d3.select(legendRef.current!);
    const svg = d3.select(svgRef.current!);
    const tooltip = d3.select("#tooltip");

    // Create a table to display data

    // Create arrows pointing to the corresponding shapes in the graph

    // const currentDate = new Date();
    // const twoYearsLater = new Date(currentDate);
    // twoYearsLater.setFullYear(currentDate.getFullYear() + 2);

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
    const monthGuidelines = d3.timeMonths(
      new Date(startDate),
      new Date(endDate)
    );

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
        const shapeInCanvas = d3.select(this);
        let shape = shapesData.shapesData.find((x) =>
          x.activityId?.includes(d.id)
        )!;
        console.warn("🚀 ~ file: DrawGraphStep.tsx:139 ~ shape:", shape);

        const textureConfig = texturesData.find(
          (x) => x.id == shape.backgroundTexture
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
        svg
          .append("text")
          .attr("x", (xScale(d.startChainage) + xScale(d.finishChainage)) / 2) // Center the text horizontally
          .attr(
            "y",
            (yScale(new Date(d.startDate)) + yScale(new Date(d.finishDate))) / 2
          ) // Center the text vertically
          .text(d.activityName)
          .style("fill", "red"); // Set the text color to red

        // // Create a line connecting the activity name to the middle of its shape
        // svg
        //   .append("line")
        //   .attr("x1", (xScale(d.startChainage) + xScale(d.finishChainage)) / 2) // Center the line horizontally
        //   .attr(
        //     "y1",
        //     (yScale(new Date(d.startDate)) + yScale(new Date(d.finishDate))) /
        //       2 -
        //       2
        //   ) // Center the line vertically
        //   .attr("x2", xScale(d.startChainage))
        //   .attr("y2", yScale(new Date(d.startDate)))
        //   .style("stroke", "red"); // Set the line color to red
      });

    // Draw vertical lines at the start and end positions
    g.selectAll(".start-line")
      .data(graphSettings.taskSlots)
      .enter()
      .append("line")
      .attr("class", "start-line")
      .attr("x1", (d) => xScale(d.start)) // X-coordinate starts at the task slot's start value
      .attr("y1", height) // Y-coordinate starts at the bottom of the chart
      .attr("x2", (d) => xScale(d.start)) // X-coordinate ends at the same start value
      .attr("y2", (d) => margin.top - 10) // Y-coordinate ends at the start value
      .attr("stroke", "#7f7a7a")
      .attr("stroke-dasharray", "2,2");

    g.selectAll(".end-line")
      .data(graphSettings.taskSlots)
      .enter()
      .append("line")
      .attr("class", "end-line")
      .attr("x1", (d) => xScale(d.end)) // X-coordinate starts at the task slot's end value
      .attr("y1", height) // Y-coordinate starts at the bottom of the chart
      .attr("x2", (d) => xScale(d.end)) // X-coordinate ends at the same end value
      .attr("y2", (d) => margin.top - 10) // Y-coordinate ends at the end value
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

        // Check if there's enough space for the label horizontally
        if (labelWidth > xScale(d.end) - xScale(d.start)) {
          // If not, rotate the label vertically
          const label = d3.select(this);
          label
            .attr("glyph-orientation-vertical", `90`) // Rotate text vertically
            .style("writing-mode", "tb");
          // Adjust text-anchor for vertical alignment
        }
      });

    shapesData.shapesData.forEach((shape, index) => {
      // Create a group for each legend item
      const legendItem = legendContainer
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", `translate(${index * 120}, 0)`); // Adjust the spacing between legend items

      // Create a rectangle or polygon for the shape
      if (shape.type === "line") {
        legendItem
          .append("line")
          .attr("x1", 10)
          .attr("y1", 10)
          .attr("x2", 40)
          .attr("y2", 10)
          .style("stroke", shape.color)
          .style("stroke-width", 2);
      } else if (shape.type === "rect") {
        legendItem
          .append("rect")
          .attr("x", 10)
          .attr("y", 2)
          .attr("width", 30)
          .attr("height", 16)
          .style("fill", shape.color)
          .style("stroke", shape.color);

        // Check if there's a texture defined for the shape
        const textureConfig = texturesData.find(
          (x) => x.id === shape.backgroundTexture
        );
        if (textureConfig) {
          legendItem.call(textureConfig?.configuration.stroke(shape.color));
          legendItem
            .select("rect")
            .style("fill", textureConfig?.configuration.url());
        }
      } else if (shape.type === "triangle") {
        // Define the points for the triangle (adjust as needed)
        const trianglePoints = "10,18 40,2 40,18";
        legendItem
          .append("polygon")
          .attr("points", trianglePoints)
          .style("fill", shape.color)
          .style("stroke", shape.color);

        // Check if there's a texture defined for the shape
        const textureConfig = texturesData.find(
          (x) => x.id === shape.backgroundTexture
        );
        if (textureConfig) {
          legendItem.call(textureConfig?.configuration.stroke(shape.color));
          legendItem
            .select("polygon")
            .style("fill", textureConfig?.configuration.url());
        }
      } else {
        legendItem
          .append("circle")
          .attr("cx", 20)
          .attr("cy", 10)
          .attr("r", 8)
          .style("fill", shape.color);
      }

      // Add text label for the shape
      legendItem
        .append("text")
        .attr("x", 60) // Adjust the position of the label
        .attr("y", 14) // Adjust the position of the label
        .text(shape.name)
        .style("alignment-baseline", "middle")
        .style("font-size", "12px");
    });
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
          <svg width={containerWidth} height={containerHeight}>
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
      <div className="flex justify-center items-center ">
        <svg
          className="flex-wrap max-w-[500px]"
          ref={legendRef}
          width={500}
        ></svg>
      </div>
    </div>
  );
}

export default DrawGraphStep;
