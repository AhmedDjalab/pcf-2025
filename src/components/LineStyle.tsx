//@ts-nocheck

import React from "react";
import "./LineStyle.css";

const LineStyle = ({ style }: any) => {
  const styleMap = {
    solid: "solid-line",
    dotted: "dotted-line",
    dashed: "dashed-line",
    double: "double-line",
    groove: "groove-line",
    ridge: "ridge-line",
    inset: "inset-line",
    outset: "outset-line",
    wave: "wave-line",
    zigzag: "zigzag-line",
    arrow: "arrow-line",
    arrowBoth: "arrow-both-line22",
    creative1: "creative-line-1",
    creative2: "creative-line-2",
    // Add more styles as needed
  };

  const lineStyleClass = styleMap[style] || "solid-line";

  return <div className={`line ${lineStyleClass}  `} />;
};

export default LineStyle;
