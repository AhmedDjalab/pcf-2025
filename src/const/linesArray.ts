export interface LineStyle {
  name: string;
  id: string;
  style?: {
    stroke?: string;
    "stroke-width": string;
    "stroke-dasharray"?: string;
    "marker-start"?: string;
    "marker-end"?: string;
  };
  className?: string;
  patternUrl?: string;
  patternId?: string;
  markerStartId?: string;
  markerEndId?: string;
  markerId?: string;
  markerEndName?: string;
  markerStartName?: string;
}

type Line = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
};
export type PatternAndMarkerMap = Record<
  string,
  {
    pattern?: {
      id: string;
      text: string;
      fontSize: number;
      fontFamily: string;
      fontWeight?: string;
    } | null;
    markerStart?: {
      id: string;
      path?: string;
      fill?: string;
      lines?: Line[];
    } | null;
    markerEnd?: {
      id: string;
      path?: string;
      fill?: string;
      lines?: Line[];
    } | null;
  }
>;

export const lineStyles: LineStyle[] = [
  {
    name: "Solid Line",
    id: "solid-line",
    style: {
      "stroke-width": "2",
      "stroke-dasharray": "0",
    },
    className: "stroke-black stroke-opacity-100",
  },
  {
    name: "Dotted Line",
    id: "dotted-line",
    style: {
      "stroke-width": "2",
      "stroke-dasharray": "2, 2",
    },
    className: "stroke-black stroke-opacity-100 stroke-dotted",
  },
  {
    name: "Double Line",
    id: "double-line",
    style: {
      "stroke-width": "4",
      "stroke-dasharray": "2, 2, 8, 2",
    },
    className: "stroke-black stroke-opacity-100",
  },
  {
    name: "Dash-Dot Line",
    id: "dash-dot-line",
    style: {
      "stroke-width": "3",
      "stroke-dasharray": "10, 5, 2, 5",
    },
    className: "stroke-black stroke-opacity-100",
  },
  {
    name: "Zigzag Line",
    id: "zigzag-line",
    style: {
      "stroke-width": "2",
      "stroke-dasharray": "4, 2, 4, 2",
    },
    className: "stroke-black stroke-opacity-100",
  },
  // {
  //   name: "Dashed Line",
  //   id: "dashed-line",
  //   patternUrl: "dashed-pattern",
  //   patternId: "dashed",
  // },
  // {
  //   name: "inset Line",
  //   id: "inset-line",
  //   patternUrl: "inset-pattern",
  //   patternId: "inset",
  // },
  {
    name: "arrow end Line",
    id: "arrow-end-line",
    markerEndId: "arrow-end-marker",
    markerEndName: "arrowEnd",
  },
  {
    name: "arrow Line",
    id: "arrow-start-line",
    markerEndId: "arrow-end-marker",
    markerStartId: "arrow-start-marker",
    markerEndName: "arrowEnd",
    markerStartName: "arrowStart",
  },

  // {
  //   name: "customPattern",
  //   id: "wave-pattern1",
  //   patternUrl: "customPattern",
  //   style: {
  //     "stroke-width": "5",
  //   },
  //   patternId: "wave-pattern1", // Reference to the pattern id in patternsConfig
  // },
  // {
  //   name: "Line13Pattern",
  //   id: "line-pattern13",
  //   patternUrl: "Line13Pattern",
  //   style: {
  //     "stroke-width": "5",
  //   },
  //   patternId: "line-pattern13", // Reference to the pattern id in patternsConfig
  // },
  // {
  //   name: "Line16Pattern",
  //   id: "line-pattern16",
  //   patternUrl: "Line16Pattern",
  //   style: {
  //     "stroke-width": "10",
  //   },
  //   patternId: "line-pattern16", // Reference to the pattern id in patternsConfig
  // },
  // // {
  // //   name: "dashed-pattern5",
  // //   id: "dashed-pattern5",
  // //   patternUrl: "dashed-pattern5",
  // //   style: {
  // //     "stroke-width": "2",
  // //     "stroke-dasharray": "15, 10, 5",
  // //   },
  // //   patternId: "dashed-pattern5", // Reference to the pattern id in patternsConfig
  // // },
  // {
  //   name: "CirclePattern",
  //   id: "circle-pattern5",
  //   patternUrl: "CirclePattern",
  //   style: {
  //     "stroke-width": "5",
  //   },
  //   patternId: "circle-pattern5", // Reference to the pattern id in patternsConfig
  // },
  // {
  //   name: "horizentalLinePattern",
  //   id: "hline-pattern5",
  //   patternUrl: "horizentalLinePattern",
  //   style: {
  //     "stroke-width": "5",
  //   },
  //   patternId: "hline-pattern5", // Reference to the pattern id in patternsConfig
  // },
  // {
  //   name: "horizentalDashedLinePattern",
  //   id: "hdashedline-pattern5",
  //   patternUrl: "horizentalDashedLinePattern",
  //   style: {
  //     "stroke-width": "6",
  //   },
  //   patternId: "hdashedline-pattern5", // Reference to the pattern id in patternsConfig
  // },
  // {
  //   name: "verticalLinePattern",
  //   id: "vline-pattern5",
  //   patternUrl: "verticalLinePattern",
  //   style: {
  //     "stroke-width": "10",
  //   },
  //   patternId: "vline-pattern5", // Reference to the pattern id in patternsConfig
  // },
  // {
  //   name: "verticalLineLeftPattern",
  //   id: "vlline-pattern5",
  //   patternUrl: "verticalLineLeftPattern",
  //   style: {
  //     "stroke-width": "10",
  //   },
  //   patternId: "vlline-pattern5", // Reference to the pattern id in patternsConfig
  // },
  // {
  //   name: "verticalLineRightPattern",
  //   id: "vrline-pattern5",
  //   patternUrl: "verticalLineRightPattern",
  //   style: {
  //     "stroke-width": "10",
  //   },
  //   patternId: "vrline-pattern5", // Reference to the pattern id in patternsConfig
  // },
  // {
  //   name: "vlineFilledLeftPattern",
  //   id: "vlineLFilled-pattern5",
  //   patternUrl: "vlineFilledLeftPattern",
  //   style: {
  //     "stroke-width": "10",
  //   },
  //   patternId: "vlineLFilled-pattern5", // Reference to the pattern id in patternsConfig
  // },
  {
    name: "LinePattern1",
    id: "line-pattern1",
    patternUrl: "line-pattern1",
    style: {
      "stroke-width": "10",
    },
    patternId: "line-pattern1", // Reference to the pattern id in patternsConfig
  },

  {
    name: "LinePattern3",
    id: "line-pattern3",
    patternUrl: "line-pattern3",
    style: {
      "stroke-width": "10",
    },
    patternId: "line-pattern3", // Reference to the pattern id in patternsConfig
  },
  // {
  //   name: "bracket  Line",
  //   id: "bracket-start-marker",
  //   markerEndId: "bracket-end-marker",
  //   markerStartId: "bracket-start-marker",
  //   markerStartName: "bracketStartMarker",
  //   markerEndName: "bracketEndMarker",
  // },
  // {
  //   name: "double arrow Line",
  //   id: "double-arrow-pattern-line",
  //   patternUrl: "double-arrow-pattern",
  //   patternId: "double-arrow",
  // },
  // {
  //   name: "Diagonal Stripes Line",
  //   id: "diagonal-stripes-line",
  //   patternUrl: "diagonal-stripes-pattern",
  //   patternId: "diagonalStripes",
  // },
  // {
  //   name: "Double Waves Line",
  //   id: "double-waves-line",
  //   patternUrl: "double-waves-pattern",
  //   patternId: "doubleWaves",
  // },
  // {
  //   name: "Parallel Lines Line",
  //   id: "parallel-lines-line",
  //   patternUrl: "parallel-lines-pattern",
  //   patternId: "parallelLines",
  // },
  // {
  //   name: "Zigzag Double Line",
  //   id: "zigzag-double-line",
  //   patternUrl: "zigzag-double-pattern",
  //   patternId: "zigzagDouble",
  // },
  // {
  //   name: "Starburst Line",
  //   id: "starburst-line",
  //   patternUrl: "starburst-pattern",
  //   patternId: "starburst",
  // },
  // {
  //   name: "Concentric Circles Line",
  //   id: "concentric-circles-line",
  //   patternUrl: "concentric-circles-pattern",
  //   patternId: "concentricCircles",
  // },
  // {
  //   name: "Curved Stripes Line",
  //   id: "curved-stripes-line",
  //   patternUrl: "curved-stripes-pattern",
  //   patternId: "curvedStripes",
  // },
];
