import React, { useCallback, useEffect, useRef, useState } from "react";
import useClickOutside from "../hooks/useClickOutside";
import * as d3 from "d3";
import { LineStyle } from "../const/linesArray";
import { default as TypeList } from "./LineStyle";
import { markersConfig } from "../const/markerAndPatternsConfig";

export interface ILineStylePickerProps {
  color: string;
  onSelectLineStyle: any;
  selectedLineStyle: LineStyle;
  lineStyles: any[];
}

const LineStylePicker = ({
  color,
  onSelectLineStyle,
  selectedLineStyle,
  lineStyles,
}: ILineStylePickerProps) => {
  const popover = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  const handleLineStyleClick = (lineStyle: LineStyle) => {
    onSelectLineStyle(lineStyle.id);
    close();
  };

  useClickOutside(popover, close);

  return (
    <div className="relative" ref={popover}>
      <div
        className="cursor-pointer rounded-lg border-[3px] border-solid border-white"
        onClick={() => setIsOpen(true)}
      >
        <svg width="150" height="40">
          <defs>
            {/* Add the arrowEnd marker */}
            {Object.keys(markersConfig).map((key: any) => {
              // @ts-ignore
              const marker = markersConfig[key];
              return marker.content();
            })}
          </defs>

          <line
            x1="25"
            y1="30"
            x2="135"
            y2="30"
            stroke={
              selectedLineStyle.patternUrl
                ? `url(#${selectedLineStyle.patternUrl})`
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
                ? `url(#${selectedLineStyle.markerEndId})`
                : undefined
            }
            markerStart={
              selectedLineStyle.markerStartId
                ? `url(#${selectedLineStyle.markerStartId})`
                : undefined
            }
          />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-20 shadow-[0_6px_12px_rgba(0,0,0,0.15)] rounded-[9px] left-0 top-[calc(100%_+_2px)]">
          <div className="flex flex-col max-h-[150px] overflow-y-scroll px-4 justify-start bg-white p-2">
            {lineStyles.map((lineStyle: LineStyle) => (
              <div
                key={lineStyle.id}
                className={`cursor-pointer w-full rounded-lg border-[3px] border-solid border-white ${
                  selectedLineStyle.id === lineStyle.id
                    ? "border-blue-500" // Highlight selected style
                    : ""
                }`}
                onClick={() => handleLineStyleClick(lineStyle)}
              >
                <svg width="150" height="40">
                  <line
                    x1="25"
                    y1="30"
                    x2="135"
                    y2="30"
                    stroke={
                      lineStyle.patternUrl
                        ? `url(#${lineStyle.patternUrl})`
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
                        ? `url(#${lineStyle.markerEndId})`
                        : undefined
                    }
                    markerStart={
                      lineStyle.markerStartId
                        ? `url(#${lineStyle.markerStartId})`
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
