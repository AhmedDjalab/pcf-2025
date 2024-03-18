import React, { useCallback, useEffect, useRef, useState } from "react";
import useClickOutside from "../hooks/useClickOutside";
import * as d3 from "d3";
import { LineStyle } from "../const/linesArray";
import { default as TypeList } from "./LineStyle";
import {
  markersConfig,
  patternsConfig,
} from "../const/markerAndPatternsConfig";
import { useAuth } from "src/context/UserContext";

export interface ILineStylePickerProps {
  id?: string;
  rowId: string;
  color: string;
  onSelectLineStyle: any;
  selectedLineStyle: LineStyle;
  lineStyles: any[];
  classname?: string;
  width?: number;
  height?: number;
  startOffset?: number;
  label?: string;
}

const LineStylePicker = ({
  id,
  rowId,
  color,
  onSelectLineStyle,
  selectedLineStyle,
  lineStyles,
  classname,
  width = 150,
  height = 40,
  startOffset = 25,
  label,
}: ILineStylePickerProps) => {
  const popover = useRef(null);
  const { user, canWrite, isAdmin } = useAuth();

  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);
  const sanitizeClassName = (key: string): string => {
    // Replace any characters that are not letters, numbers, hyphens, or underscores with hyphens
    return key.replace(/[^a-zA-Z0-9-_]/g, "-");
  };

  const handleLineStyleClick = (lineStyle: LineStyle) => {
    onSelectLineStyle(lineStyle.id);
    close();
  };

  useClickOutside(popover, close);

  return (
    <div className="relative justify-center items-center flex" ref={popover}>
      {label && (
        <label
          htmlFor={id}
          className={`
        mb-2 block  text-sm font-medium text-gray-900 dark:text-white     
        `}
        >
          {label}
        </label>
      )}
      <div
        className="cursor-pointer rounded-lg border-[3px] border-solid border-transparent"
        onClick={() => (isAdmin || canWrite) && setIsOpen(true)}
      >
        <svg width={width} height={height}>
          <defs>
            {/* Add the arrowEnd marker */}
            {Object.keys(markersConfig).map((key: any) => {
              // @ts-ignore
              const marker = markersConfig[key];

              return marker.content(
                color,
                marker.id + sanitizeClassName(rowId)
              );
            })}
            {Object.keys(patternsConfig).map((key: any) => {
              // @ts-ignore
              const pattern = patternsConfig[key];

              return pattern.content(
                color,
                pattern.id + sanitizeClassName(rowId)
              );
            })}
          </defs>

          <line
            x1={startOffset}
            y1={height - 10}
            x2={width - 5}
            y2={height - 10}
            stroke={
              selectedLineStyle.patternId
                ? `url(#${
                    selectedLineStyle.patternId + sanitizeClassName(rowId)
                  })`
                : color
            }
            strokeWidth={
              selectedLineStyle.style
                ? selectedLineStyle.style["stroke-width"]
                : "4"
            }
            strokeDasharray={
              selectedLineStyle.style
                ? selectedLineStyle.style["stroke-dasharray"]
                : "0"
            }
            markerEnd={
              selectedLineStyle.markerEndId
                ? `url(#${
                    selectedLineStyle.markerEndId + sanitizeClassName(rowId)
                  })`
                : undefined
            }
            markerStart={
              selectedLineStyle.markerStartId
                ? `url(#${
                    selectedLineStyle.markerStartId + sanitizeClassName(rowId)
                  })`
                : undefined
            }
          />
        </svg>
      </div>
      {/* block w-full rounded-lg border border-gray-300  bg-gray-50 p-2.5  text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 */}
      {isOpen && (
        <div className="absolute z-20 shadow-[0_6px_12px_rgba(0,0,0,0.15)] rounded-[9px] left-0 top-[calc(100%_+_2px)] dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
          <div className="flex flex-col max-h-[150px] overflow-y-scroll px-4 justify-start bg-white p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500">
            {lineStyles.map((lineStyle: LineStyle) => (
              <div
                key={lineStyle.id}
                className={`cursor-pointer w-full rounded-lg border-[3px] border-solid border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                  selectedLineStyle.id === lineStyle.id
                    ? "border-blue-500" // Highlight selected style
                    : ""
                }`}
                onClick={() => handleLineStyleClick(lineStyle)}
              >
                <svg width={width} height={height}>
                  {/* <defs>
                    {Object.keys(patternsConfig).map((key: any) => {
                      // @ts-ignore
                      const pattern = patternsConfig[key];

                      return pattern.content(
                        pattern.id + sanitizeClassName(rowId)
                      );
                    })}
                  </defs> */}
                  <line
                    x1={startOffset}
                    y1={height - 10}
                    x2={width - 5}
                    y2={height - 10}
                    stroke={
                      lineStyle.patternId
                        ? `url(#${
                            lineStyle.patternId + sanitizeClassName(rowId)
                          })`
                        : color
                    }
                    strokeWidth={
                      lineStyle.style ? lineStyle.style["stroke-width"] : "4"
                    }
                    strokeDasharray={
                      lineStyle.style
                        ? lineStyle.style["stroke-dasharray"]
                        : "0"
                    }
                    markerEnd={
                      lineStyle.markerEndId
                        ? `url(#${
                            lineStyle.markerEndId + sanitizeClassName(rowId)
                          })`
                        : undefined
                    }
                    markerStart={
                      lineStyle.markerStartId
                        ? `url(#${
                            lineStyle.markerStartId + sanitizeClassName(rowId)
                          })`
                        : undefined
                    }
                    //stroke={`url(#${lineStyle.patternUrl})`}
                  />
                </svg>
              </div>
            ))}
            {/* <div className="w-40 h-[150px] flex flex-col justify-between">
              <TypeList style="solid" />
              <TypeList style="dotted" />
              <TypeList style="dashed" />
              <TypeList style="double" />
              <TypeList style="groove" />
              <TypeList style="ridge" />
              <TypeList style="inset" />
              <TypeList style="outset" />
              <TypeList style="wave" />
              <TypeList style="zigzag" />
              <TypeList style="arrow" />
              <TypeList style="arrowBoth" />
              <TypeList style="creative1" />
              <TypeList style="creative2" />
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default LineStylePicker;
