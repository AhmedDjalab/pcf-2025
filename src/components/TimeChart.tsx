// src/components/ConstructionGraph.js
//@ts-nocheck

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { DataAndMonthPicker } from "./DateAndMonthPicker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// src/types.ts
export interface ActivityData {
  ID: string;
  ActivityName: string;
  StartDate: string;
  FinishDate: string;
  StartChainage: number;
  FinishChainage: number;
  Shape: string; // Shape type (line, rectangle, circle, triangle, etc.)
}
const ConstructionGraph = ({ data }) => {
  const svgRef = useRef();
  const legendRef = useRef();
  const tableRef = useRef();
  // State to manage the selected date range
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    const table = d3.select(tableRef.current);
    const svg = d3.select(svgRef.current);
    const legend = d3.select(legendRef.current);

    const margin = { top: 40, right: 30, bottom: 50, left: 150 };
    const width = 1000 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;
    // Create a table to display data

    // Create arrows pointing to the corresponding shapes in the graph

    const currentDate = new Date();
    const twoYearsLater = new Date(currentDate);
    twoYearsLater.setFullYear(currentDate.getFullYear() + 2);

    const xScale = d3
      .scaleLinear()
      .domain([10000, 20000])
      .range([margin.left, width]);

    const yScale = d3
      .scaleTime()
      .domain([currentDate, twoYearsLater])
      .range([margin.top, height]);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const monthGuidelines = d3.timeMonths(currentDate, twoYearsLater);

    g.selectAll(".month-guideline")
      .data(monthGuidelines)
      .enter()
      .append("line")
      .attr("class", "month-guideline")
      .attr("x1", (d) => xScale(10000)) // Start the line at the left edge
      .attr("x2", (d) => xScale(20000)) // Extend it to the right edge
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "2,2");
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
      .data(data)
      .enter()
      .append((d) => {
        if (d.Shape === "line") {
          return document.createElementNS("http://www.w3.org/2000/svg", "line");
        } else if (d.Shape === "rect") {
          return document.createElementNS("http://www.w3.org/2000/svg", "rect");
        } else if (d.Shape === "triangle") {
          return document.createElementNS(
            "http://www.w3.org/2000/svg",
            "polygon"
          );
        }
        return document.createElementNS("http://www.w3.org/2000/svg", "circle");
      })

      .attr("class", "activity-rectangle")
      .attr("fill", (d) => d.Color)
      .attr("r", 5)
      .attr("stroke", "black")
      .each(function (d) {
        const shape = d3.select(this);
        if (d.Shape === "line") {
          shape
            .attr("x1", (d) => xScale(d.StartChainage))
            .attr("x2", (d) => xScale(d.FinishChainage))
            .attr("y1", (d) => yScale(new Date(d.StartDate)))
            .attr("y2", (d) => yScale(new Date(d.FinishDate)));
        } else if (d.Shape === "rect") {
          shape
            .attr("x", (d) => xScale(d.StartChainage))
            .attr("y", (d) => yScale(new Date(d.StartDate)))
            .attr(
              "width",
              (d) => xScale(d.FinishChainage) - xScale(d.StartChainage)
            )
            .attr(
              "height",
              (d) =>
                yScale(new Date(d.FinishDate)) - yScale(new Date(d.StartDate))
            );
        } else if (d.Shape === "circle") {
          shape
            .attr("cx", (d) => xScale(d.StartChainage))
            .attr("cy", (d) => yScale(new Date(d.StartDate)))
            .attr("r", 5);
        } else if (d.Shape === "triangle") {
          // Define the points for the triangle (adjust as needed)
          const trianglePoints = `${xScale(d.StartChainage)},${yScale(
            new Date(d.StartDate)
          )}
                                ${xScale(d.FinishChainage)},${yScale(
            new Date(d.FinishDate)
          )}
                                ${xScale(d.StartChainage)},${yScale(
            new Date(d.FinishDate)
          )}`;

          shape.attr("points", trianglePoints);
        }
        shape.attr("id", `shape-${d.ID}`);
      });

    data.forEach((d) => {
      const shape = svg.select(`#shape-${d.ID}`); // Select the shape by ID
      const row = table.select(`#${d.ID}`); // Select the table row by ID
      if (shape.size() === 0 || row.size() === 0) {
        console.error(`Shape or row not found for ID: ${d.ID}`);
        return;
      }
      // Get the middle coordinates of the table row
      const rowOffset = row.node().getBoundingClientRect();
      const rowX = rowOffset.left + rowOffset.width / 2 + window.scrollX;
      const rowY = rowOffset.top + rowOffset.height / 2 + window.scrollY;

      // Get the middle coordinates of the shape
      const shapeOffset = shape.node().getBoundingClientRect();
      const shapeX = shapeOffset.left + shapeOffset.width / 2 + window.scrollX;
      const shapeY = shapeOffset.top + shapeOffset.height / 2 + window.scrollY;
      console.log(
        "🚀 ~ file: TimeChart.tsx:154 ~ data.forEach ~ shapeX:",
        shapeX,
        shapeY,
        rowX,
        rowY
      );

      svg
        .append("line")
        .attr("x1", rowX)
        .attr("y1", rowY)
        .attr("x2", shapeX)
        .attr("y2", shapeY)
        .attr("stroke", "blue") // Set the line color to blue
        .attr("stroke-dasharray", "5,5") // Set the line to a dashed pattern (adjust the values for the pattern)
        .attr("marker-end", "url(#arrow-marker)");
    });
  }, [data]);

  return (
    <div className="flex flex-col">
      <div></div>
      <div className="flex">
        <div className="graph-container">
          <svg width={1000} height={800}>
            <g ref={svgRef}></g>
          </svg>
        </div>
        <div className="table-container mt-40" ref={tableRef}>
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
            <tbody>
              {data.map((d) => (
                <tr key={d.ID} className="border-t" id={d.ID}>
                  <td className="px-4 py-2">{d.ActivityName}</td>
                  <td className="px-4 py-2">{d.StartDate}</td>
                  <td className="px-4 py-2">{d.FinishDate}</td>
                  <td className="px-4 py-2">{d.StartChainage}</td>
                  <td className="px-4 py-2">{d.FinishChainage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConstructionGraph;
